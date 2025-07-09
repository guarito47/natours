/**
 * @file app.js
 * @description creates a new app from express framework also define express routes
 * @author Edwin Guarachi
 * @created 4/22/2025
 * @lastUpdate 4/25/2025
 * @license MIT License
 */
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const winston = require('winston/lib/winston/config');
const swaggerUI = require('swagger-ui-express');
//const swaggerJsdoc = require('swagger-jsdoc');
const viewsRouter = require('./routes/viewRoutes');
const toursRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const reviewsRouter = require('./routes/reviewRoutes');

const AppError= require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControler');
const specs = require('./utils/swagger/swagger');
const APIFeatures = require('./utils/apiFeatures');
//const logger=require('./utils/logger');
// eslint-disable-next-line new-cap

const app = new express();

//we define engine for redering or templates, in this case 'pug'need to be installed first
app.set('view engine', 'pug');
//our pug templates are called in express 'views', so we set the path to our views directory
//we cant use './views' because it will be relative to the current working directory,
//so we use path.join to get the absolute path to our views directory so it will work in any environment
//so we dont need to worry about which /, \, // if we are using in our system, windows or linux
app.set('views', path.join(__dirname,'views')); //setting views directory



//1) GLOBAL MIDDLEWARES
//serving statis files , refactoring older way for path join

app.use(express.static(path.join(__dirname, 'public')));

//set http headers blinded to dont public critical info
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
//this parser the content to the body in json format, to read data from body into req.body,
// also as parameter the limit size of the body in order to prevent attacks with big body data size,
// trying to down the server
app.use(express.json({limit: '10kb'}));
//this urlencoded also enables to read url parameters (if we handle html request)
//extended for complex urls, and limit to 10kb of data
app.use(express.urlencoded({extended:true}))
//this cookie parser also enables to read cookies
app.use(cookieParser());

//setting swagger ui, (route, middleware, and swagger.json file)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

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


//test middleware
app.use((req, res, next) => {
  req.tiempoConsulta = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

//APPENDING MIDDLEWARES TO OUR APP FOR ROUTES

// first our routes for website, for express the render templates routes
app.use('/', viewsRouter);
// next the routes for our API application, 
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewsRouter);

app.all('*', (req, res, next)=>{
  next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
