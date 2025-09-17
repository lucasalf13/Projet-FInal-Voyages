const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();

exports.getHome = async (req, res) => {
    try {
        const userId = req.session.user?.id;
        const voyages = await prisma.travel.findMany();
        let favorisIds = [];

        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { favoris: { select: { id: true } } }
            });
            favorisIds = user.favoris.map(f => f.id);
        }

        const voyagesWithFavori = voyages.map(voyage => {
            voyage.mainPhoto = (voyage.photos && voyage.photos.split(';')[0]) || voyage.photo;
            return {
                ...voyage,
                isFavori: favorisIds.includes(voyage.id),
                mainPhoto: voyage.mainPhoto
            };
        });


        const destinations = ['Sud-Est', 'Sud-Ouest', 'Nord-Est', 'Nord-Ouest'];
        const voyagesParDestination = {};
        destinations.forEach(destination => {
            voyagesParDestination[destination] = voyagesWithFavori.filter(v => v.destination === destination);
        });

        res.render('pages/home.twig', {
            pathinfo: req.path,
            user: req.session.user,
            voyagesParDestination,
            t: req.t,
            lng: req.language
        });

    } catch (error) {
        res.render('pages/home.twig', {
            pathinfo: req.path,
            user: req.session.user,
            voyagesParDestination: {},
            t: req.t,
            lng: req.language
        });

    }
};

exports.getAbout = async (req, res) => {
    const aboutCards = req.t('about_cards', { returnObjects: true });

    res.render('pages/about.twig', {
        pathinfo: req.path,
        t: req.t,
        lng: req.language,
        about_cards: aboutCards
    });
};
