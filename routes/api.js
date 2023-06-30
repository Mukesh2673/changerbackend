var express = require('express');
var router = express.Router();

const userController = require('../controllers/userController');
const campaignController = require('../controllers/campaignController');
const videoController = require('../controllers/videoController');


// USER ROUTES
router.get('/users/:uid', userController.getUser);
router.post('/users', userController.createUser);

// CAMPAIGN ROUTES
router.get('/campaigns/:id', campaignController.show);
router.get('/campaigns', campaignController.index);

// VIDEO ROUTES
router.get('/videos/:id', videoController.show);
router.get('/videos', videoController.index);


module.exports = router;
