//const util = require('util');
//since we will use just that property we can destructure util and just use the specific object
//learn ES6 destructuring
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require ('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (userId) =>{
  
  return jwt.sign( { id:userId}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN});
}

const createSendToken= (newUser, statusCode, res)=>{
  //const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN});
  const token = signToken(newUser._id.valueOf()); 

  const cookieOptions= {
    //cookie value is 90 days we need to convert to miliseconds si 24 hours 60 min, 60 sec x 1000 to be miliseconds  
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
}

exports.signup = catchAsync( async(req, res, next)=>{  
  //const newUser = await User.create(req.body);
  //we are replacing the above code because from the body payload anyone can give himself admin role
  //so we will prevent that by just filling the basic data fron new users from guest users

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });

  createSendToken(newUser, 201, res);

});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  //from .select, as we change the field of password not selected in the user model,
  //in this time we needed to verify that match our records, thats why we specify with "+"
  //and the name of the field that we wnat to be selected this time

   const user = await User.findOne({ email }).select('+password');

   
// notice candidate psw is the one as plain text, and user psw is hashed password from db
//if not null and not correct the psw comparation
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  } 

  // 3) If everything ok, send token to client
  //const token= signToken(user._id);
  const token= signToken(user._id.valueOf());

  res.status(200).json({
    status: 'success',
    token
  });
});

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
    return next(new AppError('You are not logged in! please log in first', 401));
  }
  // 2) verification, if no one manipulate the token or if expires
  const decoded =  await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  // 3) check if the user exist, in case we delete the user , the token need to be deleted as well
  const currentUserFromDB = await User.findById(decoded.id);

  if(!currentUserFromDB){
    return next(new AppError('The user that belongs this token, no longer exist', 401));
  }
  // 4) if teh user change the password after(despues) the token was give, 
  // is the scenario where someone hacks a user and has their token to the user just change their password
  //the previous token before the change password need to be deleted asd well iat measn Issued At
  //if the user chage their psw after(despues) of the given token if its true means that the token expired
  //because the user change their password and that token is not valid now
  if(currentUserFromDB.changedPswAfter(decoded.iat)){    
    return next(new AppError('The user recently change their psw, please log in again', 401));
  }
  //if pass all this filters then we can approve to jump into next middleware in that way allowing to access
  //also now that we grab all the info of a valid user with valid token, lets set this user to the re element
  //like as a session data, so we cn use it along all the client ussage of the website
  req.user= currentUserFromDB;
  next();
});