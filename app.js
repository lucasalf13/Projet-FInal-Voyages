require('dotenv').config();
const express = require('express');
const session = require('express-session');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const path = require('path');
const twig = require('twig');

const userRoutes = require('./src/routes/userRoutes');
const mainRoutes = require('./src/routes/mainRoutes');
const authRoutes = require('./src/routes/authRoutes');
const travelRoutes = require('./src/routes/travelRoutes');

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'fr',
    preload: ['fr', 'en'],
    backend: {
      loadPath: path.join(__dirname, '/locales/{{lng}}/translation.json'),
    }
  });

const app = express();

app.use(express.urlencoded({ extended: true })); // Middleware pour parser les données des formulaires
app.use(express.json());
app.use(express.static("./public")); // Middleware pour servir les fichiers statiques
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'twig');
app.engine('twig', twig.__express);


app.use(middleware.handle(i18next));
app.use(session({ // Middleware pour gérer les sessions
  secret: 'vamosnadalos', // Clé secrète pour signer les sessions
  resave: true, // Re-sauvegarder la session même si elle n'a pas été modifiée
  saveUninitialized: true // Ne pas sauvegarder les sessions non initialisées
}));

app.use((req, res, next) => {
  res.locals.t = req.t;
  res.locals.lng = req.language;
  res.locals.user = req.session.user;
  next();
});

app.get('/lang/:lng', (req, res) => {
  const { lng } = req.params;
  res.cookie('i18next', lng, { maxAge: 900000, httpOnly: false });
  const redirectTo = req.get('Referer') || '/';
  res.redirect(redirectTo);
});

app.use(userRoutes);
app.use(mainRoutes);
app.use('/api/auth', authRoutes);
app.use('/voyages', travelRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Le serveur écoute sur le port ${process.env.PORT}`);
});