const { PrismaClient } = require("../../generated/prisma");
const hashedPasswordExtension = require("../services/extensions/hashPasswordExtension");
const bcrypt = require('bcrypt');

const prisma = new PrismaClient().$extends(hashedPasswordExtension);

exports.getAbout = async (req, res) => {
    res.render('pages/about.twig', {
        t: req.t,
        lng: req.language
    });
};

exports.getRegister = async (req, res) => {
    res.render('pages/register.twig', {
        t: req.t,
        lng: req.language
    });
};

exports.postRegister = async (req, res) => {
    const { firstName, lastName, mail, country, password, confirmPassword } = req.body;

    try {
        const regexName = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,30}$/; // Lettres, accents, tirets, apostrophes, 2 à 30 caractères
        const regexCountry = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,30}$/;
        const regexEmail = /^[a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
        const regexPassword = /^.{3,}$/; // Minimum 3 caractères

        if (!firstName || !lastName || !mail || !country || !password || !confirmPassword) {
            throw { message: req.t('all_fields_required') };
        }
        if (!regexName.test(firstName)) {
            throw { firstName: req.t('firstname_invalid') };
        }
        if (!regexName.test(lastName)) {
            throw { lastName: req.t('lastname_invalid') };
        }
        if (!regexCountry.test(country)) {
            throw { country: req.t('country_invalid') };
        }
        if (!regexEmail.test(mail)) {
            throw { mail: req.t('email_invalid') };
        }
        if (!regexPassword.test(password)) {
            throw { password: req.t('password_invalid') };
        }
        if (password !== confirmPassword) {
            throw { confirmPassword: req.t('passwords_no_match') };
        }

        const existinguser = await prisma.user.findUnique({
            where: { mail }
        });
        if (existinguser) {
            throw { mail: req.t('email_already_used') };
        }

        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                country,
                mail,
                password
            }
        });

        res.redirect('/login?message=' + encodeURIComponent(req.t('account_created_success')));

    } catch (error) {
        res.render('pages/register.twig', {
            error,
            formData: {
                firstName,
                lastName,
                mail,
                country
            },
            t: req.t,
            lng: req.language
        });
    }
};

exports.getLogin = async (req, res) => {
    const success = req.session.success;
    delete req.session.success;

    res.render('pages/login.twig', {
        success,
        t: req.t,
        lng: req.language
    });
};

exports.postLogin = async (req, res) => {
    try {
        const { mail, password } = req.body;

        const regexEmail = /^[a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
        const regexPassword = /^.{3,}$/; // Minimum 3 caractères

        if (!mail || !password) {
            throw { message: req.t('all_fields_required') };
        }
        if (!regexEmail.test(mail)) {
            throw { mail: req.t('email_invalid') };
        }
        if (!regexPassword.test(password)) {
            throw { password: req.t('password_invalid') };
        }

        const user = await prisma.user.findUnique({
            where: { mail }
        });
        if (!user) {
            throw { mail: req.t('email_not_found') };
        }

        if (!(await bcrypt.compare(password, user.password))) {
            throw { password: req.t('password_wrong') };
        }

        req.session.user = user;
        res.redirect('/home');
    } catch (error) {
        res.render('pages/login.twig', {
            error,
            t: req.t,
            lng: req.language
        });
    }
};

exports.getLogout = async (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};

exports.getFavori = async (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.redirect('/login');
    }
    const userWithFavoris = await prisma.user.findUnique({
        where: { id: user.id },
        include: { favoris: true }
    });
    const favoris = userWithFavoris.favoris.map(voyage => {
        voyage.mainPhoto = (voyage.photos && voyage.photos.split(';')[0]) || voyage.photo;
        return voyage;
    });

    res.render('pages/favori.twig', {
        user: userWithFavoris,
        favoris,
        t: req.t,
        lng: req.language
    });
};

exports.toggleFavori = async (req, res) => {
    const userId = req.session.user.id;
    const voyageId = parseInt(req.params.voyageId, 10);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { favoris: { where: { id: voyageId } } }
    });

    let isFavori;
    if (user.favoris.length > 0) {
        await prisma.user.update({
            where: { id: userId },
            data: { favoris: { disconnect: { id: voyageId } } }
        });
        isFavori = false;
    } else {
        await prisma.user.update({
            where: { id: userId },
            data: { favoris: { connect: { id: voyageId } } }
        });
        isFavori = true;
    }
    res.json({ isFavori });
};
