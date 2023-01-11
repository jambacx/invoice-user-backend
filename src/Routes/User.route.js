const express = require('express');
const router = express.Router();

const UserController = require('../Controllers/User.Controller');

//Get a list of all user
// router.get('/', UserController.getAllUsers);

//Get a user by id
router.get('/:id', UserController.findUserById);

//Create a new user
// router.post('/', UserController.createNewUser);

module.exports = router;
