const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');
const authguard = require('../services/authguard');
const iaController = require('../controllers/iaController');

router.get('/', mainController.getAbout);
router.get('/home', authguard, mainController.getHome);
router.post('/api/ia-voyage', iaController.proposeVoyage);

module.exports = router;