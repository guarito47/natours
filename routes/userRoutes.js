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


const usersRouter= express.Router( );


/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *    type: object
 *    required:
 *    - name
 *    - email
 *    - password
 *    - passwordConfirm
 *    properties:
 *      id:
 *        type: string
 *        description: The auto-generated id by mongoDB
 *      name:
 *        type: string
 *        description: The name of the User
 *      email:
 *        type: string
 *        description: The email of the User
 *      photo:
 *        type: string
 *        description: The photo of the User
 *      role:
 *        type: string
 *        enum:
 *        - user
 *        - guide
 *        - lead-guide
 *        - admin
 *        description: The role of the User            
 *      password:
 *        type: string
 *        description: The password of the User
 *      passwordConfirm:
 *        type: string
 *        description: The password confirmation of the User
 *      passwordChangedAt:
 *        type: date
 *        description: The date when the password was changed
 *      passwordResetToken:
 *        type: string
 *        description: The password reset token of the User
 *      passwordResetExpires:
 *        type: date
 *        description: The date when the password reset token expires
 *      active:
 *        type: boolean
 *        description: The active status of the User
 *      example:         
 *        name: guarito
 *        email: guarito@mail.com
 *        password: password123
 *        passwordConfirm: password123
 */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: The Users managing API
 */


/**
 * @swagger
 * /api/v1/users/signup:
 *   post:
 *     summary: create a new user
 *     tags: [User]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: you user was created
 *         content:
 *           application/json:
 *             schema:
 *               type: String
 */

usersRouter.post('/signup',authController.signup);

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login a user
 *     tags: [User]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: you are successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: String
 */

usersRouter.post('/login',authController.login);


usersRouter.post('/forgotPassword', authController.forgotPassword);
usersRouter.patch('/resetPassword/:token', authController.resetPassword);
usersRouter.patch('/updateMyPassword', authController.protect, authController.updatePassword);
usersRouter.patch('/updateMe', authController.protect, userController.updateMe);
usersRouter.delete('/deleteMe', authController.protect, userController.deleteMe);


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