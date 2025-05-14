/**
 * @file app.js
 * @description creates a new app from express framework also define express routes
 * @author Edwin Guarachi
 * @created 4/22/2025
 * @lastUpdate 4/25/2025
 * @license MIT License
 */

const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const toursRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const reviewsRouter = require('./routes/reviewRoutes');
const AppError= require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControler');
//const logger=require('./utils/logger');
const winston = require('winston/lib/winston/config');

// eslint-disable-next-line new-cap
const app = new express();

//1) GLOBAL MIDDLEWARES

//set http headers
app.use(helmet());

//chossing morgan depening dev o rprod envirenment
if (process.env.NODE_ENV === 'development'){
  console.log('using morgan as development env');
  //app.use(morgan('combined', {stream: winston.stream})); //works but doesnt save in file
  app.use(morgan('dev'));
}



//ASSIGN GLOBAL MIDDLEWARES TO OUR APP

//here we are configuring our rateLimit to prevent brute force attacks, limiting request from same ip
const limiter = rateLimit({
  max:100, //request per Ip in 
  windowMS: 60 *  60 * 1000, //period of time Window MiliSeconds we define 1 hour, min*sec* milisec
  message: 'Too many request from this ip, please try again in 1 hour'

});
app.use('/api',limiter);

//body parser, to read data from body into req.body, also as parameter the limit size of the body
//in order to prevent attacks with big body data size, trying to down the server
app.use(express.json({limit: '10kb'}));

// DATA SANITIZATION agains NoSQl query injection, like {"email": {"$gt":""}} that match any email
//this mongosanitize middleware removes $ character and another special characters that mongo indetifies as operators
app.use(mongoSanitize());

// DATA SANITIZATION agains XSS cross site , in case they are trying to send malicius html code that
//contains inside malicius javascript code
app.use(xss());

// PREVENT PARAMETER POLLUTION like get all tours sort by duration, price and many others sorts our app dont handle this
// so Http Parameter Pollution, removes the duplicates parameters, but keeping only specific cases in a whitelist
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxFroupSize', 'difficulty', 'price']
}));

//serving statis files 
app.use(express.static(`${__dirname}/public/`));
//test middleware
app.use((req, res, next) => {
  req.tiempoConsulta = new Date().toISOString();
  next();
});

//APPENDING MIDDLEWARES TO OUR APP FOR ROUTES
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewsRouter);

app.all('*', (req, res, next)=>{
  next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
