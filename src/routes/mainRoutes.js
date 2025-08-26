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
router.get('/api/meteo/top-ville', async (req, res) => {
  const villes = [
 { nom: "Paris", lat: 48.8566, lon: 2.3522 },
		{ nom: "Marseille", lat: 43.2965, lon: 5.3698 },
		{ nom: "Lyon", lat: 45.7640, lon: 4.8357 },
		{ nom: "Toulouse", lat: 43.6047, lon: 1.4442 },
		{ nom: "Nice", lat: 43.7102, lon: 7.2620 },
		{ nom: "Nantes", lat: 47.2184, lon: -1.5536 },
		{ nom: "Strasbourg", lat: 48.5734, lon: 7.7521 },
		{ nom: "Montpellier", lat: 43.6119, lon: 3.8777 },
		{ nom: "Bordeaux", lat: 44.8378, lon: -0.5792 },
		{ nom: "Lille", lat: 50.6292, lon: 3.0573 },
		{ nom: "Rennes", lat: 48.1173, lon: -1.6778 },
		{ nom: "Reims", lat: 49.2583, lon: 4.0317 },
		{ nom: "Le Havre", lat: 49.4944, lon: 0.1079 },
		{ nom: "Saint-Étienne", lat: 45.4397, lon: 4.3872 },
		{ nom: "Grenoble", lat: 45.1885, lon: 5.7245 },
		{ nom: "Dijon", lat: 47.3220, lon: 5.0415 },
		{ nom: "Nîmes", lat: 43.8367, lon: 4.3601 },
		{ nom: "Clermont-Ferrand", lat: 45.7772, lon: 3.0870 },
		{ nom: "Brest", lat: 48.3904, lon: -4.4861 },
		{ nom: "Limoges", lat: 45.8336, lon: 1.2611 },
		{ nom: "Tours", lat: 47.3941, lon: 0.6848 },
		{ nom: "Amiens", lat: 49.8950, lon: 2.3023 },
		{ nom: "Perpignan", lat: 42.6887, lon: 2.8948 },
		{ nom: "Metz", lat: 49.1193, lon: 6.1757 },
		{ nom: "Ajaccio", lat: 41.9192, lon: 8.7386 },
		{ nom: "Biarritz", lat: 43.4832, lon: -1.5586 },
		{ nom: "Caen", lat: 49.1829, lon: -0.3707 },
		{ nom: "La Rochelle", lat: 46.1603, lon: -1.1511 }
  ];

  let bestVille = null;
  let bestScore = -Infinity;
  let fallbackVille = null;
  let fallbackScoreDiff = Infinity;

  for (const ville of villes) {
    try {
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=${ville.lat},${ville.lon}&days=1&lang=fr`;
      const response = await fetch(url);
      const data = await response.json();

      const jour = data.forecast.forecastday[0].day;
      const tempMax = jour.maxtemp_c;
      const condition = jour.condition.text.toLowerCase();

      let score = tempMax;
      if (condition.includes("soleil") || condition.includes("dégagé")) score += 10;

     if (tempMax >= 25 && tempMax <= 30) {
        if (score > bestScore) {
          bestScore = score;
          bestVille = {
            city: ville.nom,
            lat: ville.lat,
            lon: ville.lon,
            temp_c: tempMax,
            condition: jour.condition.text,
            icon: "https:" + jour.condition.icon
          };
        }
      } else {
        const diff = Math.min(Math.abs(tempMax - 25), Math.abs(tempMax - 30));
        if (diff < fallbackScoreDiff) {
          fallbackScoreDiff = diff;
          fallbackVille = {
            city: ville.nom,
            lat: ville.lat,
            lon: ville.lon,
            temp_c: tempMax,
            condition: jour.condition.text,
            icon: "https:" + jour.condition.icon
          };
        }
      }
    } catch (err) {
      console.error(`Erreur météo ${ville.nom}:`, err.message);
    }
  }

  if (bestVille) {
    res.json(bestVille);
  } else if (fallbackVille) {
    res.json(fallbackVille);
  } else {
    res.status(500).json({ error: "Impossible de déterminer la meilleure ville météo" });
  }
});
router.get('/mentions', (req, res) => {
    res.render('pages/mentions.twig', {
        title: 'Mentions Légales',
        lng: req.locale || 'fr'
    });
});
router.get('/politique', (req, res) => {
    res.render('pages/politique.twig', {
        title: 'Politique de Confidentialité',
        lng: req.locale || 'fr'
    });
});


module.exports = router;