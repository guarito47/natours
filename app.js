const express = require('express');
const morgan = require('morgan');
const toursRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const AppError= require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControler');

// eslint-disable-next-line new-cap
const app = new express();
//here we are telling that we will use a middleware that is express.json that handle json data
//because the req.body is not send it by express,only the client
// 1. MIDDLEWARES

if (process.env.NODE_ENV === 'development'){
  console.log('using morgan as development env');
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public/`));

app.use((req, res, next)=>{
  console.log('hello from guaro middleware');
  next();
});

app.use((req, res, next) => {
  req.tiempoConsulta = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
//if dont fall in this first routers , for sure is not a valid url so will catch here
//all means any of verbs, get, post, ;put etc, * any url, having next means we are talking of a middleware

app.all('*', (req, res, next)=>{
/*   res.status(404).json({
    status: 'fail',
    message: `cant find ${req.originalUrl} on this server`
  }); */
 /*  const error= new Error(`cant find ${req.originalUrl} on this server v2`);
  error.status= 'fail';
  error.statusCode=404; */
  //by passing teh error as argument in the next function, express understand that is an error, and 
  //skip all remaining midlewares and directly moves to the error handler middleware
  //next(error);

  //now using our customg error handler from appError, we just create and object with the parameters
  //don forget the fail field will be generated based on the number 404
  next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});

//to central error handling lets use as well a midleware
//this error handler now it converts as errorController.js
/*app.use((err, req, res, next)=>{
  //to assing status code number just in case if we dont have predefined one (replace if)
  err.statusCode= err.statusCode || 500;
  //to assing status text related just in case if we dont have predefined one 
  err.status= err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });

});*/
app.use(globalErrorHandler);

module.exports = app;
