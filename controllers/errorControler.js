/**
 * @file errorController.js
 * @description handle mongo DB , JWT errors, and send a custom error 
 * dependig is are running in development or production mode
 * @author Edwin Guarachi
 * @created 4/22/2025
 * @lastUpdate 4/23/2025
 * @license MIT License
 */
const AppError = require('../utils/appError');

/**
 * handle mongo invalid format to parse mongo schema field
 * @param {Object} err the mongo db error 
 * @returns {AppError} a custom error with a proper message
 */
const handleCastErrorDB = (err)=>{
  //path is the db field that mongo find the error, and value the wrong value
  const message= `invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
}

/**
 * handle mongo already exist document in the db
 * @param {Object} err the mongo db error 
 * @returns {AppError} a custom error with a proper message
 */
const handleDuplicateDB = (err)=>{
  //to find the text/value inside the errmsg field that that causes the conflict we will use regular expression
  const value= err.errorResponse.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  
  const message= `Duplicate Field Value: ${value}.`;
  return new AppError(message, 400);
}

/**
 * handle mongo schema validation error 
 * @param {Object} err the mongo db error 
 * @returns {AppError} a custom error with a proper message
 */
const handleValidationErrorDB = (err)=>{
  //this will loop from the errors that is an arrays o error where will just extract the message of each one
  const errors = Object.values(err.errors).map(el =>el.message);
  //finally will create a string with all the messages separated by ". "
  const message= `Invalid Input Data.${errors.join('. ')}`;
  return new AppError(message, 400);
}
/*JWT HANDLER ERRORS*/
/**
 * handle JWT invalid token
 * @returns {AppError} a custom error with a proper message
 */
const handleJwtError=()=> new AppError('Invalid token please log in again', 401);
/**
 * handle JWT expired token
 * @returns {AppError} a custom error with a proper message
 */
const handleJwtExpire=()=> new AppError('Your session was expired, please log in again', 401);

/**
 * send development environment detailed error response with detailed fields about the error 
 * @param {Object} err the global error object
 * @param {Object} res the global response to return to the client
 */
const sendErrorDev= (err, req, res)=>{
  //when is running in development we will send as much details to the programmer,
  // because its only for programmers use, so first we will handle the api request
  //the api error send a json response
  if(req.originalUrl.startsWith('/api')){
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }//here we handle the http request that means the response need to be a page => a render response
  console.error('ERROR!!', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
  
};

/**
 * send production environment resume error response with minor fields about the error 
 * @param {Object} err the global error object
 * @param {Object} res the global response to return to the client
 */
const sendErrorProd=(err, req, res)=>{
  //FOR THE API REQUEST, the api error send a json response
  if(req.originalUrl.startsWith('/api')){
    //operational errors are trusted errors : that we know in advance and we know the non thecnical 
    // message to the client, like a route url doesnt exist
    if (err.isOperational){
      return res.status(err.statusCode).json({
        status: err.status,      
        message: err.message,      
      });
    }
    //if is non caused by a wellknow error, then its a programming error, no need to send a thecnical error 
    // we just send a 'ups something is not woking'
    //1) log the error
    console.error('ERROR!!', err);
    //2) send generic message
    return res.status(500).json({
      status:'error',
      message: 'something went very wrong !'
    })    
  } //FOR THE WEBSITE REQUEST, then its a render response
    //operational errors are trusted errors : that we know in advance and we know the non thecnical 
    // message to the client, like a route url doesnt exist
  if (err.isOperational){
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  console.error('ERROR!!', err);
  //2) send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
  
};

/**
 * main error hub that routes development error or production errors for mongo and jwt errors 
 * @param {Object} err the global error object
 * @param {Object} req the global client request to the server
 * @param {Object} res the global response to return to the client
 * @param {Object} next the global object to continue the next middleware
 */
module.exports= (err, req, res, next)=>{
  //to assing status code number just in case if we dont have predefined one (replace if)
  err.statusCode= err.statusCode || 500;
  //to assing status text related just in case if we dont have predefined one 
  err.status= err.status || 'error';

  if(process.env.NODE_ENV.trim()==='development'){      
      sendErrorDev(err, req, res);
  }
  else if(process.env.NODE_ENV.trim()==='production'){  
    //to dont overwrite our original err we will create a copy using let, 
    // and then reassig later with the proper error when mongo db error happend
    let error = { ...err };
    //for some reason this copy of error doesnt have the message (undefined) so we are doing the copy manually
    error.message=err.message;
    /*MONGO DB ERRORS*/    
    if(error.name==='CastError'){
      error = handleCastErrorDB(error);
    } 
    if(error.kind==='ObjectId'){//mongo db id is not in the mongo format
      error = handleCastErrorDB(error);
    } 
    if(error.code===11000){//mongo db document already exist
      error = handleDuplicateDB(error);
    }
    if(error._message==='Validation failed'){//mongo db validation fail      
      error = handleValidationErrorDB(error);
    }
    /*jwt ERRORS */
    //if token was altered manipulated
    if(error.name ==='JsonWebTokenError') error = handleJwtError();
    //if token expires
    if(error.name ==='TokenExpiredError') error = handleJwtExpire();

    //now we pass our custom error for mongo db handled errors    
    sendErrorProd(error, req, res);
  }
}; 