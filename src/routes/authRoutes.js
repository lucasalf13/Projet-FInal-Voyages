const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const crypto = require('crypto');
const bcrypt = require('bcrypt');


router.get('/forgotpassword', (req, res) => {
    res.render('pages/forgotpassword.twig', {
        t: req.t,
        lng: req.language
    });
});

router.post('/forgotpassword', async (req, res) => {
    const { mail } = req.body;

    if (!mail) {
        return res.status(400).json({ message: req.t('email_required') });
    }

    const user = await prisma.user.findUnique({ where: { mail } });

    if (user) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiration = new Date(Date.now() + 60 * 60 * 1000); // 1h

        await prisma.user.update({
            where: { mail },
            data: {
                passwordResetToken: hashedToken,
                passwordResetAt: expiration,
            },
        });

        const resetLink = `http://localhost:8000/api/auth/reset-password?token=${resetToken}`;

        const nodemailer = require('nodemailer');

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        try {
            await transporter.sendMail({
                to: mail,
                subject: req.t('reset_email_subject'),
                html: `<p>${req.t('reset_email_body')} <a href="${resetLink}">${resetLink}</a></p>`
            });
        } catch (error) {
            console.error('Erreur lors de l’envoi de l’email :', error);
        }
    }

    req.session.success = req.t('password_reset_email_sent');
    return res.redirect('/login');
});

router.get('/reset-password', (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.render('pages/resetpassword.twig', {
            error: req.t('reset_token_invalid'),
            t: req.t,
            lng: req.language
        });
    }
    res.render('pages/resetpassword.twig', {
        token,
        t: req.t,
        lng: req.language
    });
});

router.post('/resetpassword/:token', async (req, res) => {
    const { password, passwordConfirm } = req.body;
    const { token } = req.params;

    if (!password || !passwordConfirm) {
        return res.render('pages/resetpassword.twig', {
            error: req.t('reset_all_fields_required'),
            token,
            t: req.t,
            lng: req.language
        });
    }
    if (password !== passwordConfirm) {
        return res.render('pages/resetpassword.twig', {
            error: req.t('reset_passwords_no_match'),
            token,
            t: req.t,
            lng: req.language
        });
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: hashedToken,
                passwordResetAt: { gte: new Date() },
            },
        });

        if (!user) {
            return res.render('pages/resetpassword.twig', {
                error: req.t('reset_token_invalid'),
                t: req.t,
                lng: req.language
            });
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetAt: null,
            },
        });

        res.render('pages/resetpassword.twig', {
            success: req.t('reset_success'),
            t: req.t,
            lng: req.language
        });
    } catch (error) {
        console.error(error);
        res.render('pages/resetpassword.twig', {
            error: req.t('server_error'),
            token,
            t: req.t,
            lng: req.language
        });
    }
});

module.exports = router;
