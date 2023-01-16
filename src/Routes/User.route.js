const express = require('express');
const router = express.Router();
const UserController = require("../Controllers/User");

//Get a list of all user
// router.get('/', UserController.getAllUsers);

//Get a user by id
router.get('/', UserController.find);

//Create a new user
// router.post('/', UserController.createNewUser);

module.exports = router;
