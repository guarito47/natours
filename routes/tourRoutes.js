/**
 * @file tourRoutes.js
 * @description handle all tour paths under /api/v1/tours for tour CRUD operations 
 * also stadistics and filtering routes, and routes for tours in azure mysql DB
 * @author Edwin Guarachi
 * @created 4/22/2025
 * @lastUpdate 4/23/2025
 * @license MIT License
 */
const express = require('express');
const tourController = require('../controllers/tourController');
const tourController4MySql = require('../controllers/tourController4Mysql');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const toursRouter= express.Router();

//as we have another main branch from a branch tour we need to tell express router to use
//this child branch from the way where appears :tourId/reviews
toursRouter.use('/:tourId/reviews', reviewRouter);

toursRouter
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);

toursRouter
    .route('/tour-stats')
    .get(tourController.getTourStats);
toursRouter
    .route('/monthly-plan/:year')
    .get(tourController.getMonthlyPlan);

toursRouter
    .route('/')
    .get(authController.protect,  tourController.getAllTours)
    .post(tourController.createTour);     

toursRouter
    .route('/:id')
    .get(tourController.getTour)    
    .patch(tourController.updateTour)
    .delete(
        authController.protect, 
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour);

///////*MYSQL azure database natours *///////
toursRouter
    .route('/postTour')    
    .post(tourController4MySql.createTour); 

toursRouter
    .route('/getAllTours')    
    .get(tourController4MySql.getAllTours);

toursRouter
    .route('/getTour/:id')    
    .get(tourController4MySql.getTour);

module.exports= toursRouter;