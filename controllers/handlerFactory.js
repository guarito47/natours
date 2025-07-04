const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
//to have a centralized CRUD operations for all the models
//this handler factory do the crud operations for any model

//this is a generic function that recieves kind of document 'model' for delete a record
exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    //instead of word Model now we will replace for Tour, User or Review or any other Mongo document Model
    //the result will be called doc for general model result purposes
    
    const doc = await Model.findByIdAndDelete(req.params.id);    
    
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    //first we will find the document by id
    let query = Model.findById(req.params.id);
    //and if we have a popOptions we will populate the document
    if (popOptions) query = query.populate(popOptions);
    //then we will execute the query
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });


exports.getAll = Model =>
  catchAsync(async (req, res, next) => {    
    // this 2 lines is for reviews only, to allow for nested GET reviews on tour (hack)
    let filter = {};//if its not from review this will be empty and dont affect for the rest
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();    
    //const doc = await features.mongoQueryObj.explain();
    // with 'explain' we can have inside the json a helpull fields about the indexes used
    const doc = await features.mongoQueryObj;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc
      }
    });
  });
