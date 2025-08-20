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

exports.uploadPhotos = upload.array('photos[]', 10);

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
        } = req.body;

        const itineraries = req.body.itineraries || [];
        const accommodations = JSON.parse(req.body.accommodations || '[]');
        const restaurants = JSON.parse(req.body.restaurants || '[]');
        let transports = req.body.transports || [];
        if (!Array.isArray(transports)) {
            transports = Object.values(transports);
        }
        const captions = req.body.captions || [];
        const photos = req.files ? req.files.map(file => file.filename) : [];
        const captionsCorrected = photos.map((_, i) => captions[i] || '');
        const photosString = photos.join(';');
        const captionsString = captionsCorrected.join(';');
        const travel = await prisma.travel.create({
            data: {
                name,
                destination,
                photos: photosString,
                photoCaptions: captionsString
            }
        });
  for (const t of transports) {
  if (t.type) {
    await prisma.transport.create({
      data: {
        type: t.type,
        detail_fr: t.detail_fr || '',
        detail_en: t.detail_en || '',
        detail_es: t.detail_es || '',
        detail_it: t.detail_it || '',
        travelId: travel.id
      }
    });
  }
}

       for (const itin of itineraries) {
  if (itin.title) {
    await prisma.itinerary.create({
      data: {
        title: itin.title,
        detail_fr: itin.detail_fr || '',
        detail_en: itin.detail_en || '',
        detail_es: itin.detail_es || '',
        detail_it: itin.detail_it || '',
        travelId: travel.id
      }
    });
  }
}


        for (const acc of accommodations) {
            await prisma.accommodation.create({
                data: {
                    title: acc.title,
                    photo: acc.photo,
                    priceCategory: acc.priceCategory,
                    url: acc.url,
                    travelId: travel.id
                }
            });
        }

        for (const resto of restaurants) {
            await prisma.restaurant.create({
                data: {
                    title: resto.title,
                    photo: resto.photo,
                    priceCategory: resto.priceCategory,
                    url: resto.url,
                    travelId: travel.id
                }
            });
        }

        res.redirect('/home');

    } catch (error) {
        console.error(error);
        res.render('pages/createTravel.twig', {
            error: req.t('create_error'),
            user: req.session.user,
            t: req.t,
            lng: req.language,
        });
    }
};

exports.getVoyageDetail = async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).send("ID de voyage manquant ou invalide.");
    }
    const voyage = await prisma.travel.findUnique({
        where: { id },
        include: {
            accommodations: true,
            restaurants: true,
            itineraries: true,
            transports: true
        }
    });
    if (!voyage) {
        return res.status(404).render('pages/404.twig', {
            user: req.session.user,
            t: req.t,
            lng: req.language
        });

    }
    const user = req.session.user;
    let isFavori = false;

    if (user) {
        const userWithFavoris = await prisma.user.findUnique({
            where: { id: user.id },
            include: { favoris: { select: { id: true } } }
        });

        isFavori = userWithFavoris.favoris.some(fav => fav.id === id);
    }

    voyage.isFavori = isFavori;

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
    const photoCaptions = voyage.photoCaptions ? voyage.photoCaptions.split(';') : [];

    res.render('pages/createTravel.twig', {
        voyage,
        photosArray,
        photoCaptions,
        transports: await prisma.transport.findMany({ where: { travelId: id } }),
        user: req.session.user,
        edit: true,
        accommodations: await prisma.accommodation.findMany({ where: { travelId: id } }),
        restaurants: await prisma.restaurant.findMany({ where: { travelId: id } }),
        itineraries: await prisma.itinerary.findMany({ where: { travelId: id } }),
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
            destination
        } = req.body;

        let transports = req.body.transports || [];
        if (!Array.isArray(transports)) {
            transports = Object.values(transports);
        }
        let accommodations = req.body.accommodations || [];
        if (typeof accommodations === 'string') {
            try { accommodations = JSON.parse(accommodations); } catch { }
        }
        let restaurants = req.body.restaurants || [];
        if (typeof restaurants === 'string') {
            try { restaurants = JSON.parse(restaurants); } catch { }
        }
        let itineraries = req.body.itineraries || [];
        if (!Array.isArray(itineraries)) {
            itineraries = Object.values(itineraries);
        }
        const oldVoyage = await prisma.travel.findUnique({ where: { id } });
        if (!oldVoyage) {
            return res.status(404).send("Voyage introuvable");
        }
        let captionsExisting = req.body.captions_existing || [];
        if (!Array.isArray(captionsExisting)) captionsExisting = [captionsExisting];

        let captionsNew = req.body.captions || [];
        if (!Array.isArray(captionsNew)) captionsNew = [captionsNew];
        let photosArray = oldVoyage.photos ? oldVoyage.photos.split(';') : [];

        let toDelete = req.body.delete_photos || [];
        if (!Array.isArray(toDelete)) toDelete = [toDelete];

        const filteredPhotos = [];
        const filteredCaptions = [];
        for (let i = 0; i < photosArray.length; i++) {
            if (!toDelete.includes(photosArray[i])) {
                filteredPhotos.push(photosArray[i]);
                filteredCaptions.push(captionsExisting[i] || '');
            }
        }
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                filteredPhotos.push(req.files[i].filename);
                filteredCaptions.push(captionsNew[i] || '');
            }
        }
        const photos = filteredPhotos.join(';');
        const photoCaptions = filteredCaptions.join(';');


        await prisma.travel.update({
            where: { id },
            data: {
                name,
                destination,
                photos,
                photoCaptions
            }
        });

        await prisma.accommodation.deleteMany({ where: { travelId: id } });
        await prisma.restaurant.deleteMany({ where: { travelId: id } });
        await prisma.itinerary.deleteMany({ where: { travelId: id } });
        await prisma.transport.deleteMany({ where: { travelId: id } });

   for (const t of transports) {
  if (t.type) {
    await prisma.transport.create({
      data: {
        type: t.type,
        detail_fr: t.detail_fr || '',
        detail_en: t.detail_en || '',
        detail_es: t.detail_es || '',
        detail_it: t.detail_it || '',
        travelId: id
      }
    });
  }
}


for (const itin of itineraries) {
  if (itin.title) {
    await prisma.itinerary.create({
      data: {
        title: itin.title,
        detail_fr: itin.detail_fr || '',
        detail_en: itin.detail_en || '',
        detail_es: itin.detail_es || '',
        detail_it: itin.detail_it || '',
        travelId: id
      }
    });
  }
}
        for (const acc of accommodations) {
            await prisma.accommodation.create({
                data: {
                    title: acc.title,
                    photo: acc.photo,
                    priceCategory: acc.priceCategory,
                    url: acc.url,
                    travelId: id
                }
            });
        }

        for (const resto of restaurants) {
            await prisma.restaurant.create({
                data: {
                    title: resto.title,
                    photo: resto.photo,
                    priceCategory: resto.priceCategory,
                    url: resto.url,
                    travelId: id
                }
            });
        }

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
    const voyage = await prisma.travel.findUnique({
        where: { id },
        include: {
            itineraries: true,
            transports: true,
            accommodations: true,
            restaurants: true
        }
    });
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
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '5mm',
                    right: '5mm',
                    bottom: '5mm',
                    left: '5mm'
                },
                preferCSSPageSize: true
            });
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
    const userId = req.session.user?.id;

    try {
        const voyages = await prisma.travel.findMany({
            where: { destination }
        });

        let favorisIds = [];
        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { favoris: { select: { id: true } } }
            });
            favorisIds = user?.favoris.map(f => f.id) || [];
        }

        const voyagesWithFavori = voyages.map(voyage => {
            const mainPhoto = (voyage.photos && voyage.photos.split(';')[0]) || 'default.webp';
            return {
                ...voyage,
                isFavori: favorisIds.includes(voyage.id),
                mainPhoto
            };
        });

        res.render('pages/region.twig', {
            voyages: voyagesWithFavori,
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

