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
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

//...allowedFields means that can be variable parameters, that will treat as array
const filterObj = (obj, ...allowedFields) => {
    //newObj will become the filtered body without critical fields
    const newObj = {};
    //to loop the fields of the body user payload lets use Object.keys moving through 'el'
    Object.keys(obj).forEach(el => {
    //if the field from body is a valid element we store on newObj NOTE that we dont specify positions intead
    //we specify fields newObj[email] = obj[email] ...{email: eguarachi@gmail.com}
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

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

exports.updateMe = catchAsync(async (req, res, next) => {
    //we only update info related with no passwords, so if any password is pressent we will reject
    if (req.body.password || req.body.passwordConfirm) {
        return next(
          new AppError(
            'This route is not for password updates. Please use /updateMyPassword.',
            400
          )
        );
    }
    
    //before save first as security layer we dont allow a user to change their role to admin, or token expiration etc
    //to avoid to allow this updates in case appears in the body, wi will filter with a function filterObj
    const filteredBody= filterObj(req.body, 'name', 'email');
    //we cant use SAVE because has activated all validators like password confirm not present
    //instead findbyidandupdate params user.id, fields to update, option new: true to return the new updated user
    
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {new: true, runValidators:true});        

    res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        }
    );
    //next();
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    //we only hide the user instead to delete, just for auditing tasks, 
    // to do that we will set the active field to false
    await User.findByIdAndUpdate(req.user.id, { active: false });
  
    res.status(204).json({
      status: 'success',
      data: null
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
/*
exports.deleteUser=(req, res)=>{
    res
    .status(500)
    .json({
        status:'error',
        message: 'delete user  still working'
    });
};
*/
exports.deleteUser= factory.deleteOne(User);