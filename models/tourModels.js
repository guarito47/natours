
const mongoose = require('mongoose');
const slugify= require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name:{
      type: String,
      required: [true, 'A tour must have name'],
      unique:true,
      trim: true,
      //this is consider an in built validator
      maxLength: [40, 'max lenght 40 chars'],
      minLength: [10, 'min lenght 10 chars'],
      //using external library of validators
      //validate: [validator.isAlpha, 'tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'a tour must have a duration']
    },

    maxGroupSize:{
      type: Number,
      required: [true, 'a tour must have a group Size']
    },

    difficulty:{
      type: String,
      required: [true, 'a tour must have a difficulty'],
      enum:{
        values: ['easy', 'medium', 'difficult'],
        message:'only easy, medium difficult values'
      }
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min:[1, 'min above 1.0'],
      max:[1, 'max below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'a tour must have price']
    },

    priceDiscount: {
      type: Number,
      //IMPORTANT this only refers to the currenct doc to be created, means that wont run for update
      validate: {        
        validator: function(val){//use normal funciton to handle the fields of each doc by using this
          return val<this.price;
        },
        message: 'price discount ({VALUE}) cant be greater than the price'
      }
    },

    summary: {
      type: String,
      trim: true,//removes spaces at the beginning /end of the text, 
      // only works for string types
      required: [true, 'a tour must have summary']
    },

    description: {
      type: String,
      trim: true
    },

    imageCover:{
      type: String,
      required: [true, 'a tour must have an image cover']
    },

    images: [String],

    createdAt: {
      type: Date,
      default: Date.now() ,
      select:false
    },

    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    } 
  },
  {//this object means that we want to see in the json output the field/virtual field that we calculate 
  // as part of the collection, IMPORTANT we can query because is virtual doesnt exit in the db
    toJSON:{virtuals: true},
    toObject:{virtuals: true}//also for handling as object
  });

  //a virtual property of a defined squema y a field that can be calculated from the fields like duration in weeks
  tourSchema.virtual('durationWeeks').get(
    function(){//we use a real function because we will handle the parameters of pour object by using this.
      return this.duration/7 
    });

    //DOCUEMNT MIDDLEWARE as we know triggers, runs everytime ocurrPRE MEANS  BEFORE this callings: 
    // save(), create() , NOT working for insertMany() this time a cool example before save a new tour
    //we will have a field called slug so we can handle in the url, to create a slug we use slugify
    //and as a express midleware wqe next to call next
    //THIS refers to the current document
    tourSchema.pre('save', function(next){
      this.slug= slugify(this.name, {lower:true});
      next();
    });
    //QUERY MIDDLEWARE, by example we have secret tours that only for vip members , so we cant show to public members
    // instead we will pre filter the collection before run the find that trigger this midleware
    //in this case THIA refers a query object, we will improive the code below
    /*tourSchema.pre('find', function(next){
      this.find({secretTour: {$ne: true}});
      next();
    });*/
    //to apply this filter of secretTours for all the find operations, instead of create one midleware for ech type 
    //of find, like findOne, we will use a regular expresion un the hook: means 'find'
    // a regular expression delimitates with /../ inside ^ means that the name starts with find and next whatever
    tourSchema.pre(/^find/, function(next){
      this.find({secretTour: {$ne: true}});
      this.start= Date.now();//we can create a properties in real time ands reuse later
      next();
    });

    tourSchema.post(/^find/, function(docs, next){
      console.log(`query took ${Date.now()-this.start} miliseconds`);
      //console.log(docs);
      next();
    });
    //as another middleware post meas after saving task, but in this case we have also the doc as
    //return , important we dont have the this. object but we have the doc remember 
    /*tourSchema.post('save', function(doc, next){
      console.log(doc);
      next();
    });*/
    
//AGREGATION MIDLEWARE; needed for the tour stats where still having in count the secret tour
//here THIS refers to the current agregation object
tourSchema.pre('aggregate', function(next){  
  //console.log(this.pipeline());
  //we will modify the agregate by adding a stage at the end using unshift and filter by match 
  //where all the docs that secret tour is true
  this.pipeline().unshift({$match:{secretTour:{$ne:true}}});
  next();
});

  const Tour = mongoose.model('Tour',tourSchema);
  module.exports= Tour;