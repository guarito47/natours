// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModels');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  { //this prepares or schema to show calculated fields like quantity of results and shows in the output
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
/*this index 'tour 1, user 1' the one is only for ordering, the main effect with unique is that
// will prevent to have multiple reviews for the same tour and user
// means that only tourId and userId need to be unique together
// so if we try to create a review for the same tour and user, it will throw an error
// this is useful to prevent users from creating multiple reviews for the same tour*/
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// this middleware works for find and all the method that starts with 'find'
reviewSchema.pre(/^find/, function(next) {
  /*this.populate({
    path: 'tour',//this will populate the tour field with the tour document
    select: 'name'//this will select only the name field of the tour document
  }).populate({//in the same result we will populate the user field
    path: 'user', //this will populate the user field with the user document
    select: 'name photo' //this will select only the name and photo fields of the user document
  });  */
  /*the code of above is populating the where appears tour id. Works in get all reviews reviews, 
  but in get tour by id when we populate a review that contains a tour id it duplicate the tour info 
  so we will only populate the user field in the reviews and not the tour*/
  this.populate({//in the same result we will populate the user field
    path: 'user', //this will populate the user field with the user document
    select: 'name photo' //this will select only the name and photo fields of the user document and not the rest
  });

  next();
});

/*when we create as static method that will work to handle the model and not the document
// we will use this method to update the tour ratingsAverage and ratingsQuantity fields
// we will use this method in the post save middleware of the review schema
 we will use this method in the post findOneAndUpdate findOneAndDelete middleware of the review schema*/
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // this points to the current model, aggregate works as filter stages
  const stats = await this.aggregate([
    {//first we will select all the reviews of a specific tour
      $match: { tour: tourId }
    },
    {
      $group: {//in this phase we will group the reviews by tour id
        _id: '$tour',
        nRating: { $sum: 1 },//we will count the num of reviews
        avgRating: { $avg: '$rating' }// we will calculate the average rating passing the name fo the field=rating
      }
    }
  ]);  
  
  //console.log(stats);
  /* till here we have it the json object resul with id, nratring and avgrating
  stats is the array of objects that contains the result of the aggregation
  but if we dont have any object in case theres no reviews for a specific tour this will be empty
  so we need to check if stats has any element and if not we will set the
  ratingsQuantity to 0 and ratingsAverage to 4.5 (default value)*/
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
/**with this example of the object stats of the result of the agreggation
 * its return an array of 1 element and that only element is accesible in the position 0
 * [
  {
    _id: new ObjectId('685c7056b6062f0769c3ff21'),
    nRating: 3,
    avgRating: 4
  }
]
 */
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};


/*
this middleware works to update the tour ratingsAverage and ratingsQuantity fields
so this run everytime that we create a new review or update an existing one
and update the tour ratingsAverage and ratingsQuantity fields
*/
reviewSchema.post('save', function() {
  /* 'this' points to current review , also this method only is called from a current review
  and from here we can call to an document method or a static method that is calcAverageRatings
  Review.calcAverageRatings(this.tour);
  the problem with the code above is that Review is not define yet, 
  so we will use the constructor property of the current document
  this.constructor is another way to refer Review 
  in order to use the static method if the model is not initialized yet*/
  this.constructor.calcAverageRatings(this.tour);
  //we need to check why dont allow to save multiple reviews for the same tour and user mondo db error:diplicate keys
});

/* this middleware works for find FindOneAnd and all the method that starts with 'findOneAnd'
 findByIdAndUpdate
 findByIdAndDelete
 if we will delete a review we will use finOneAndUpdate (works as save) to use this method we need the id of the review
 so if we use post findOneAnddelete means after the review is deleted we will lost the review and the tourId 
 where we need to upodate the ratingsAverage and ratingsQuantity fields
 so we will use pre findOneAndUpdate and pre findOneAndDelete to get save the review in this.r before be deleted 
*/
reviewSchema.pre(/^findOneAnd/, async function(next) {  
  /*  we create a variable called 'r' into 'this'object to store the Review that we are going to update or delete   
  the 'clone' method is used to create a copy of the query so we can use it later 
  also clone is used to avoid the query to be executed at this point to dont fall in 'query already executed' error
  */
  
  //this.r ='685c7056b6062f0769c3ff21';
  this.r = await this.findOne().clone();//'r' store the Review document that we are going to update or delete  
  
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  /* this.r is the review that we are going to update or delete
  we can use this.r to get the tour id and update the ratingsAverage and ratingsQuantity fields
  this.r.tour is the tour id of the review that we are going to update
  await this.findOne(); does NOT work here, will show empty because review doent exist at this point
  */
  
  await this.r.constructor.calcAverageRatings(this.r);
  //this.r.constructor is the Review model, so we can use the static method calcAverageRatings
  /*for some reason this middleware its not fired after pre findoneAndUpdate or findOneAndDelete
  something that we need to investigate
  */
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
