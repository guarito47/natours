/**
 * @file authController.js
 * @description this controller handle all about authorization, givin access tokens and bypass authenticated users .
 * @author Edwin Guarachi
 * @created 4/22/2025
 * @lastUpdate 4/25/2025
 * @license MIT License
 */
require('../utils/logger');
const util = require('util');
const {promisify} = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const User = require ('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const logger = require('../utils/logger');
const azGetSecret= require('../utils/azureKeyVault');



/**
 * this function creates a Json Web Token with given user Id and Secret for token creation
 * @param {string} userId the user database Id as payload to create the token
 * @returns {string} the token created
 */
/*const jwtSecret= azGetSecret(process.env.KEY_VAULT_SECRET_JWT)
.then((secret)=>{
  process.env.JWT_SECRET= secret.value;
}).catch((error)=>{ 
  logger.error('error getting secret from azure key vault');
  logger.error(error);
});*/


const signToken =  async(userId)=>{  

  try{
    const jwts =await azGetSecret(process.env.KEY_VAULT_SECRET_JWT);
    logger.error(`sign token2 jwts: ${jwts.value}`);
    const token = jwt.sign( { id:userId}, jwts.value, { expiresIn: process.env.JWT_EXPIRES_IN});
    logger.error(`sign token2 token: ${token}`);
    return token;
  } catch(error){
    logger.error('error getting secret from azure key vault');
    logger.error(error);
  }
    
};


//const signToken = (userId) =>jwt.sign( { id:userId}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN})

/**
 * creates a JWT token with expiration date, also set as cookie to the client, 
 * @param {userModel} newUser where gets theirid as payload for jwt
 * @param {number} statusCode status to be assigned in the response
 * @param {Object} res the global response to return to the client
 */
const createSendToken= async (newUser, statusCode, res)=>{  
  //const token= signToken(newUser._id.valueOf());
  
  let token;
  try {
     token= await signToken(newUser._id.valueOf());
     logger.error(`token from keyvault: ${token}`);

  } catch (error) {
    logger.error(`error from keyvault: ${error}`);
    console.log(error);
  }  

  const cookieOptions= {
    //cookie value is 90 days we need to convert to miliseconds where 24 hours 60 min, 60 sec x 1000 to be miliseconds  
    expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    //secure: true, //to works only through httpS , 
    httpOnly: true //means that the cookie only can be accessing bye http and no other ways to accessing it
  };
    
  //we will set manually the httpS depends if we are on dev o production mode
  if(process.env.NODE_ENV ==='production') cookieOptions.secure = true;
  //to SEND THE TOKEN AS A COOKIE AND SAVE IR INTO THE BROWSER CLIENT
  res.cookie('jwt', token, cookieOptions);
  //in order to remove the passsword from the output mean in the json response we can set undefined
  newUser.password= undefined;
    

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
};

/**
 * process the user singup request with only basic info and gives a token to be atomatically authenticated 
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
exports.signup = catchAsync( async(req, res, next)=>{  

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });

  createSendToken(newUser, 201, res);
});

/**
 * process login request validating required fields and correct credentials 
 * and gives a token if its valid
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    logger.warn(new AppError('Please provide email and password!', 400));
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct  
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    logger.error(new AppError('Incorrect email or password', 401));
    return next(new AppError('Incorrect email or password', 401));
  } 
  // 3) If everything ok, send token to client  
  createSendToken(user, 200, res);
  
});

/**
 * used to protect routes for only authehticated users (next by roles as well) with different
 * layers of security, like token manipulation, user exist, token expiration by password change  
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
exports.protect = catchAsync(async (req, res, next)=>{
  let token;
  // 1) lets check if exist the token in the header of the client  
  if(//we  ask in the client header if exist the authortization parameter with the token
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ){//if exist then take off the bearer part to just keep the token
    token = req.headers.authorization.split(' ')[1];
  }
  
  if(!token){
    logger.warn(new AppError('You are not logged in! please log in first', 401));
    return next(new AppError('You are not logged in! please log in first', 401));
  }

  //console.log("reach protect");
  // 2) verification, if no one manipulate the token or if expires
  const decoded =  await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  // 3) check if the user exist, in case we delete the user , the token need to be deleted as well
  const currentUserFromDB = await User.findById(decoded.id);

  if(!currentUserFromDB){
    logger.error(new AppError('The user that belongs this token, no longer exist', 401))
    return next(new AppError('The user that belongs this token, no longer exist', 401));    
  }
  // 4) if the user change the password after the token was give, 
  if(currentUserFromDB.changedPswAfter(decoded.iat)){  
    logger.error(new AppError('The user recently change their psw, please log in again', 401));  
    return next(new AppError('The user recently change their psw, please log in again', 401));
  }
  req.user= currentUserFromDB;
  //console.log("protect moves to next middleware")
  next();
});

//the 3 dots means REST PARAMETER SYNTAX IN ES6 so it will create an array to handle 
// the dynamic number of parameters so the roles is this array can be 1, or 2, or 3 roles
//because we cant send parameters into a middleware we will wraper a midleware to handle parameters
exports.restrictTo = (...roles)=>{
  return (req, res, next)=>{
    //roles are ['admin', 'lead-guide'] so we will check if the user role are inside this array
    if(!roles.includes(req.user.role)){
      return next(new AppError('you do not have permission to perform this action', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  //we used findOne to search by email, because we dont know their id, in that case we use finById
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  //the line up, assign value to expirationDate, and creatyed a resetToken but till now is only in memory
  //not saved in db, to save we need to call save method
  //but will send error for the required fields validators of the rest of the fields se we need to bypass
  //for this only step
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  //now lets prepare tyhe link to reset their psw
  //req.protocol is http or https where it works for dev or prod environment
  //re.get.hostworks for localhost, dev, or prod
  //DONT forgot that we are sending the plain token , not the encrypted one
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {//here we are creating the object options to compose the email 
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });
    //always finish the req/res cycle otherwise the req/res will never finish
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });//if fail to send the email, to do it again we need to RESET THE paSswordeResetToken and expiration 
    //for the new incoming try if the user will try again, because we saved the in this try and its runnin 10 mins 
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  //here we receive email link with the token (un-encryted one) to compare with our token
  //saved in our DB (encrypten) so to compare we need to encrypt the token from email to
  //compare encrypted against encrypted
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
//NOW the only thing that we know about the user is the passwordResetToken and nothing more, theres no
//email, pas nothing, so this token is the only thing and unique thing to find the user
  const user = await User.findOne({
    passwordResetToken: hashedToken, //here we are comparing encrypted tokens, email token vs db token
    //$gt stands for greater than to validate dont pass 10 mins if its greater, stills in the future
    //means still have time, but when its in the past that means 10 mions was gone 
    passwordResetExpires: { $gt: Date.now() } 
  });

  // 2) If token has expired, or theres no valid token
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  //otherwise is valid token and between the 10 mins, lets update the password
  //  and clean the resettoken and expiration for future reset operations
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  //now lets save it, NOTE that we dont bypass teh validations because we want to validate 
  //if both psw match
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection but with onbly field password
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  //as user ia a userModel Object we can use their methods to verify the given payload psw
  //against the db password
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    //if doeant match then someone that is not the user finds the computer open
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // User.findByIdAndUpdate will NOT work as intended! because we will avoid to trigger our pre save functions
  //that is required to encryp and make sure validations, that only we did that in pre save funcions and not in
  //findbyidand upodate, thats why we need to use save
  await user.save();
  

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});