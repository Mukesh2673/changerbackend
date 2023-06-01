var express = require('express');
var router = express.Router();

const userController = require('../controllers/users');


// USER ROUTES
router.get('/users/:uid', userController.getUser);
router.post('/users', userController.createUser);


module.exports = router;
