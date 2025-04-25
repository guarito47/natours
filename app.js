const express = require('express');
const morgan = require('morgan');
const toursRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const AppError= require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControler');
//const logger=require('./utils/logger');
const winston = require('winston/lib/winston/config');

// eslint-disable-next-line new-cap
const app = new express();

if (process.env.NODE_ENV === 'development'){
  console.log('using morgan as development env');
  //app.use(morgan('combined', {stream: winston.stream})); //works but doesnt save in file
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public/`));

app.use((req, res, next) => {
  req.tiempoConsulta = new Date().toISOString();
  next();
});


app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);

app.all('*', (req, res, next)=>{
  next(new AppError(`cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
