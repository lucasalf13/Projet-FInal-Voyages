const express = require('express');
const router = express.Router();
const travelController = require('../controllers/travelController');

router.get('/new', travelController.getCreateForm);

router.post('/new', travelController.uploadPhotos, travelController.createTravel);

router.get('/region/:destination', travelController.getRegionPage);

router.get('/:id', travelController.getVoyageDetail);

router.post('/:id/delete', travelController.deleteTravel);
router.get('/:id/edit', travelController.getEditForm);
router.post('/:id/edit', travelController.uploadPhotos, travelController.updateTravel);

router.get('/:id/pdf', travelController.downloadPDF);

module.exports = router;

