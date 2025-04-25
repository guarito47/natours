/**
 * @file userController.js
 * @description handle all about user administration, like list of all users, retrieve user by id
 * creating new user, updating, deleting user and so on
 * @author Edwin Guarachi
 * @created 4/22/2025
 * @lastUpdate 4/25/2025
 * @license MIT License
 */
const User= require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

/**
 * retrieve all the existing users in the DB
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
exports.getAllUsers=catchAsync(async (req, res, next )=>{

    const Users= await User.find();
    res
    .status(200).json({
        status:'success',
        results: User.length, 
        data: {
            Users
        }
    });
});

/**
 * retrieve an existing user by their id (pending)
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
exports.getUser=(req, res)=>{
    res
    .status(500)
    .json({
        status:'error',
        message: 'user page still working v2'
    });
};

/**
 * creates a new user internally (pending)
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
exports.createUser=(req, res)=>{
    res
    .status(500)
    .json({
        status:'error',
        message: 'create users still working'
    });
};

/**
 * updates user info (pending)
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
exports.updateUser=(req, res)=>{
    res
    .status(500)
    .json({
        status:'error',
        message: 'update user still working'
    });
};


/**
 * delete a specific user by thir id (pending)
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
exports.deleteUser=(req, res)=>{
    res
    .status(500)
    .json({
        status:'error',
        message: 'delete user  still working'
    });
};