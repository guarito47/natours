/**
 * @file userRoutes.js
 * @description handle all user paths under /api/v1/users for user CRUD operations 
 * also creation and authorization process
 * @author Edwin Guarachi
 * @created 4/22/2025
 * @lastUpdate 4/25/2025
 * @license MIT License
 */

const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const usersRouter= express.Router();

usersRouter.post('/signup',authController.signup);
usersRouter.post('/login',authController.login);

usersRouter
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

usersRouter
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports=usersRouter;