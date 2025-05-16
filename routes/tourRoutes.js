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

/**
 * @swagger
 * components:
 *  schemas:
 *  Tour:
 *    type: object
 *    required:
 *    - name
 *    - maxGroupSize
 *    - difficulty
 *    - price
 *    properties:
 *      id:
 *        type: string
 *        description: The auto-generated id by mongoDB
 *      name:
 *        type: string
 *        description: The name of the Jedi
 *      slug:
 *        type: string
 *        description: The auto generated slug by slugify
 *      maxGroupSize:
 *        type: number
 *        description: The max group size of the tour
 *      difficulty:
 *        type: string
 *        description: The difficulty of the tour
 *      ratingsAverage:
 *        type: number
 *        description: The average of the ratings
 *      ratingsQuantity:
 *        type: number
 *        description: The quantity of the ratings
 *      price:
 *        type: number
 *        description: The price of the tour
 *      priceDiscount:
 *        type: number
 *        description: The discount of the tour
 *      summary:
 *        type: string
 *        description: The summary of the tour
 *      description:
 *        type: string
 *        description: The description of the tour
 *      imageCover:
 *        type: string
 *        description: Path of The cover image of the tour
 *      images:
 *        type: array
 *        description: The images of the tour
 *      createdAt:
 *        type: Date
 *        description: Auto generated The date when the tour was created
 *      startDates:
 *        type: array
 *        description: The start dates of the tour
 *      startLocation:
 *        type: string
 *        description: The start location of the tour
 *      locations:
 *        type: array
 *        description: The locations of the tour
 *      guides:
 *        type: array
 *        description: The guides of the tour
 *      example:
 *        name: San Borja
 *        maxGroupSize: 10
 *        difficulty: easy
 *        ratingsAverage: 4.5
 *        ratingsQuantity: 10
 *        price: 100
 */

/**
 * @swagger
 * tags:
 *   name: Tours
 *   description: The Tours managing API
 */


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

/**
 * @swagger
 * /api/v1/tours:
 *   get:
 *     summary: Returns the list of all the Tours
 *     tags: [Tours] 
 *     responses:
 *       200:
 *         description: The list of the Tours
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 */
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

///////*MYSQL azure database natours rollback *///////
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