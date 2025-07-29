const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');
const authguard = require('../services/authguard');
const iaController = require('../controllers/iaController');

router.get('/', mainController.getAbout);
router.get('/home', authguard, mainController.getHome);
router.post('/api/ia-voyage', iaController.proposeVoyage);
router.get('/api/meteo/:lat/:lon', async (req, res) => {
  const { lat, lon } = req.params;
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=2&lang=fr`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur météo' });
  }
});


module.exports = router;