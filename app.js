// Chargement des variables d'environnement (.env)
require('dotenv').config();

// Import des modules nécessaires
const express = require('express');
const session = require('express-session');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const path = require('path');
const twig = require('twig');

// Import des routes de l'application
const userRoutes = require('./src/routes/userRoutes');
const mainRoutes = require('./src/routes/mainRoutes');
const authRoutes = require('./src/routes/authRoutes');
const travelRoutes = require('./src/routes/travelRoutes');

// Configuration de i18next pour la gestion multilingue
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'fr', // Langue par défaut
    preload: ['fr', 'en'], // Langues chargées au démarrage
    backend: {
      loadPath: path.join(__dirname, '/locales/{{lng}}/translation.json'), // Chemin des fichiers de traduction
    }
  });

const app = express();

// Middlewares pour parser les requêtes POST (formulaires et JSON)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sert les fichiers statiques (CSS, JS, images)
app.use(express.static("./public"));

// Configuration du moteur de templates Twig
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'twig');
app.engine('twig', twig.__express);

// Middleware pour la gestion multilingue (i18next)
app.use(middleware.handle(i18next));

// Configuration de la session utilisateur
app.use(session({
  secret: process.env.SESSION_SECRET, // Clé secrète stockée dans .env
  resave: true,
  saveUninitialized: true
}));

// Middleware pour rendre accessibles certaines variables dans toutes les vues Twig
app.use((req, res, next) => {
  res.locals.t = req.t; // Fonction de traduction
  res.locals.lng = req.language; // Langue courante
  res.locals.user = req.session.user; // Utilisateur connecté
  next();
});

// Route pour changer la langue de l'application
app.get('/lang/:lng', (req, res) => {
  const { lng } = req.params;
  res.cookie('i18next', lng, { maxAge: 900000, httpOnly: false });
  const redirectTo = req.get('Referer') || '/';
  res.redirect(redirectTo);
});

// Montage des routes principales de l'application
app.use(userRoutes);
app.use(mainRoutes);
app.use('/api/auth', authRoutes);
app.use('/voyages', travelRoutes);

// Démarrage du serveur sur le port défini dans .env
app.listen(process.env.PORT, () => {
  console.log(`Le serveur écoute sur le port ${process.env.PORT}`);
});