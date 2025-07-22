const multer = require('multer');
const path = require('path');
const puppeteer = require('puppeteer');
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/assets/img/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

exports.uploadPhotos = upload.array('photos', 10);

exports.getCreateForm = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send(req.t('access_denied'));
    }
    res.render('pages/createTravel.twig', {
        user: req.session.user,
        t: req.t,
        lng: req.language
    });
};

exports.createTravel = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send(req.t('access_denied'));
    }

    try {
        const {
            name,
            destination,
            queFaire,
            itinerary,
            ouDormir,
            ouManger,
            transports
        } = req.body;

        // Gestion des fichiers envoyés (photos)
        const photos = req.files ? req.files.map(file => file.filename) : [];

        await prisma.travel.create({
            data: {
                name,
                destination,
                photos: photos.join(';'),
                queFaire,
                itinerary,
                ouDormir,
                ouManger,
                transports
            }
        });

        res.redirect('/home');

    } catch (error) {
        console.error(error); // Utile pour debug
        res.render('pages/createTravel.twig', {
            error: req.t('create_error'),
            user: req.session.user,
            t: req.t,
            lng: req.language
        });
    }
};

exports.getVoyageDetail = async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).send("ID de voyage manquant ou invalide.");
    }
    const voyage = await prisma.travel.findUnique({
        where: { id }
    });
    if (!voyage) {
        return res.status(404).render('pages/404.twig', {
            user: req.session.user,
            t: req.t,
            lng: req.language
        });

    }
    const photos = voyage.photos ? voyage.photos.split(';') : [];
    res.render('pages/travelDetail.twig', {
        voyage,
        photos,
        user: req.session.user,
        t: req.t,
        lng: req.language
    });

};

exports.deleteTravel = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send(req.t('access_denied'));
    }
    const id = Number(req.params.id);
    try {
        await prisma.travel.delete({ where: { id } });
        res.redirect('/home');
    } catch (error) {
        res.status(500).send("Erreur lors de la suppression");
    }
};

exports.getEditForm = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send(req.t('access_denied'));
    }
    const id = Number(req.params.id);
    const voyage = await prisma.travel.findUnique({ where: { id } });
    if (!voyage) {
        return res.status(404).send("Voyage non trouvé");
    }
    const photosArray = voyage.photos ? voyage.photos.split(';') : [];
    res.render('pages/createTravel.twig', {
        voyage,
        photosArray,
        user: req.session.user,
        edit: true,
        t: req.t,
        lng: req.language
    });
};

exports.updateTravel = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send(req.t('access_denied'));
  }

  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).send("ID de voyage manquant ou invalide.");
  }

  try {
    const {
      name,
      destination,
      queFaire,
      itinerary,
      ouDormir,
      ouManger,
      transports
    } = req.body;

    const oldVoyage = await prisma.travel.findUnique({ where: { id } });
    if (!oldVoyage) {
      return res.status(404).send("Voyage introuvable");
    }

    let photosArray = oldVoyage.photos ? oldVoyage.photos.split(';') : [];

    // Suppression des photos cochées
    let toDelete = req.body.delete_photos;
    if (toDelete) {
      if (!Array.isArray(toDelete)) toDelete = [toDelete];
      photosArray = photosArray.filter(photo => !toDelete.includes(photo));
    }

    // Ajout des nouvelles photos uploadées
    if (req.files && req.files.length > 0) {
      const uploaded = req.files.map(file => file.filename);
      photosArray = photosArray.concat(uploaded);
    }

    const photos = photosArray.join(';');

    await prisma.travel.update({
      where: { id },
      data: {
        name,
        destination,
        photos,
        queFaire,
        itinerary,
        ouDormir,
        ouManger,
        transports
      }
    });

    res.redirect('/voyages/' + id);

  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la modification");
  }
};

exports.downloadPDF = async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).send("ID de voyage manquant ou invalide.");
    }
    const voyage = await prisma.travel.findUnique({ where: { id } });
    if (!voyage) {
        return res.status(404).send("Voyage non trouvé");
    }
    const absoluteUrl = `${req.protocol}://${req.get('host')}`;
    res.app.render('pages/travelDetailPdf.twig', { voyage, absoluteUrl, t: req.t, lng: req.language }, async (err, html) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Erreur lors du rendu PDF");
        }
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
            await browser.close();

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="voyage-${id}.pdf"`,
            });
            res.send(pdfBuffer);
        } catch (error) {
            console.error(error);
            res.status(500).send("Erreur lors de la génération du PDF");
        }
    });
};

exports.getRegionPage = async (req, res) => {
  const destination = req.params.destination;

  try {
    const voyages = await prisma.travel.findMany({
      where: { destination }
    });

    res.render('pages/region.twig', {
      voyages,
      destination,
      user: req.session.user,
      t: req.t,
      lng: req.language
    });

  } catch (error) {
    console.error('Erreur chargement région:', error);
    res.status(500).send("Erreur lors du chargement de la région");
  }
};
