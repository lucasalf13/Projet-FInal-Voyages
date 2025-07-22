const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/about', userController.getAbout);

router.get('/register', userController.getRegister);
router.post('/register', userController.postRegister);

router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);

router.get('/logout', userController.getLogout);

router.get('/favori', userController.getFavori);
router.post('/favoris/:voyageId', userController.toggleFavori);

module.exports = router;