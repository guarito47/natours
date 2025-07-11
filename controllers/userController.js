/**
 * @file userController.js
 * @description handle all about user administration, like list of all users, retrieve user by id
 * creating new user, updating, deleting user and so on
 * @author Edwin Guarachi
 * @created 4/22/2025
 * @lastUpdate 4/25/2025
 * @license MIT License
 */
// multer is a middleware for handling multipart/form-data used for uploading files
// so to update the user photo in our API not from raw json , but by form-data 
const multer = require('multer');
const sharp = require('sharp'); //sharp is a library to resize images
const User= require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

//the professional way to handle file uploads is to use multer, so we will use multer.diskStorage
/*const multerStorage = multer.diskStorage({
    //cb is like next in the same usabillity, like to use to handle errors, cb is to set the destination
    destination: (req, file, cb) => { 
    //first argumnet is error, if any(for now null for none), second is the destination folder
        cb(null, 'public/img/users');
    },
    filename: (req, file, cb) => {
        //we will have the following format user-<userId>-<timestamp>.<ext>
        //where the ext comes from req.file field mimetype: 'image/jpeg', tyhat why we will remove 'image/' part        
        const ext = file.mimetype.split('/')[1]; //get the extension from the mimetype
        //and we will add a timestamp to avoid conflicts with same name files
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`); 
    }
});*/

// because diskStorage save in the disk but we are not taking care about the image resizing first,
// we will use memoryStorage to save the file in memory, so we can resize first and then save it to disk
// this is useful to avoid saving the original file to disk, and then resizing it
const multerStorage = multer.memoryStorage();

//this is to dont allow to upload files that arnot images, so we will use a filter
const multerFilter = (req, file, cb) => {
    //we will check if the file is an image, if not we will reject it
    if (file.mimetype.startsWith('image')) {
        //if the file is an image we will accept it
        cb(null, true);
    } else {
        //if the file is not an image we will reject it
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

//upload is the multer instance but with a specific configuration thanks to multerStorage and multerFilter
const upload = multer({
    storage: multerStorage, //set the storage to the multerStorage we created
    fileFilter: multerFilter //set the filter to the multerFilter we created
 });

//upload.single is the middleware that will handle the file upload
//of course we can use upload.single directly in the rout, but we wrap to have a better readeable code
exports.uploadUserPhoto= upload.single('photo'); // 'photo' is the field name in the form

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    //we will only resize the photo if we have a file, so we check if req.file is present
    if (!req.file) return next(); //if no file, we will skip this middleware
    //we will use sharp to resize the image, so we need to install sharp first
    //npm install sharp
    //we will set the filename to the user id and timestamp, because the next middleware "updateMe" will use it
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`; 
     //req.file.buffer is the photo in memory
    await sharp(req.file.buffer)
        .resize(500, 500) //width, height
        .toFormat('jpeg') //we will save the image in jpeg format
        .jpeg({ quality: 90 }) //we will set the quality to 90% when compressed
        .toFile(`public/img/users/${req.file.filename}`); //we will setup the file dest in the disk;
    
        next(); //we will call the next middleware, in this case updateMe
});

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
//this method retrieve the current user info, without getting from the url as parameter instead will use
//the req.user object that was set in the protect middleware
exports.getMe= (req, res, next) => {
    req.params.id = req.user.id; //we will use the user id from the token
    next(); //we will call the next middleware, in this case getOne
}

exports.updateMe = catchAsync(async (req, res, next) => {
    
    //lets look what we have till here phase 1
    //console.log('updateMe called');
    //console.log(req.file);
    /*
    {
  fieldname: 'photo',
  originalname: 'leo.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: 'public/img/users',
  filename: 'cdf2761cab2424e702b740b9cc82c120',
  path: 'public\\img\\users\\cdf2761cab2424e702b740b9cc82c120',
  size: 207078
}
    */
    //console.log(req.body); //[Object: null prototype] { name: 'Leo C. Gillespie' }

    //we only update info related with no passwords, so if any password is pressent we will reject
    if (req.body.password || req.body.passwordConfirm) {
        return next(
          new AppError(
            'This route is not for password updates. Please use /updateMyPassword.',
            400
          )
        );
    }
    
    //before save first as security layer we dont allow a user to change their role to admin, 
    // or token expiration etc
    //to avoid to allow this updates in case appears in the body, wi will filter with a function filterObj
    const filteredBody= filterObj(req.body, 'name', 'email');
    //if we have a file (photo), we will add the photo field to the filteredBody
    if (req.file) 
        filteredBody.photo = req.file.filename; //we will store the filename, not the path,     
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
 * creates a new user internally (pending)
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
//we will never has this method exposed to the client, this is only for internal use
// so users need to user signup process to create a new user
exports.createUser=(req, res)=>{
    res
    .status(500)
    .json({
        status:'error',
        message: 'this route is not defined , please use signup instead'
    });
};

/**
 * retrieve an existing user by their id (pending)
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */

exports.getUser= factory.getOne(User);
/*
exports.getUser=(req, res)=>{
    res
    .status(500)
    .json({
        status:'error',
        message: 'user page still working v2'
    });
};
*/
/**
 * retrieve all the existing users in the DB
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
exports.getAllUsers = factory.getAll(User);
/*
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
*/

/**
 * updates user info (pending)
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
//Do NOT update passwords with this method, use the updateMyPassword method instead
exports.updateUser= factory.updateOne(User);
/*
exports.updateUser=(req, res)=>{
    res
    .status(500)
    .json({
        status:'error',
        message: 'update user still working'
    });
};
*/

/**
 * delete a specific user by thir id (pending)
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
exports.deleteUser= factory.deleteOne(User);
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