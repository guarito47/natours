
const mongoose = require('mongoose');
const slugify= require('slugify');
//const validator = require('validator');

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
      max:[5, 'max below 5.0'],
      set: val => Math.round(val * 10) / 10 //to round the decimals, ex: 4.6666 to 4.7
      //if we round now well have 5, to avoid that, we multiply first by 10 and then divide by 10
      //so we will have 4.6666 to 46.666 and then to 47.0 and divided by 10 to get 4.7
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
    },
    startLocation: {//the starting location that will be used for the map
          // GeoJSON
          type: {
            type: String,
            default: 'Point',
            enum: ['Point']
          },
          coordinates: [Number],
          address: String,
          description: String
    },
    locations: [//are the locations that we will visit in the tour
      {
            type: {
              type: String,
              default: 'Point',
              enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
          }
    ],
    guides: [
          {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
          }
    ]
  }, 
  {//this object means that we want to see in the json output the field/virtual field that we calculate 
  // as part of the collection, IMPORTANT we can query because is virtual doesnt exit in the db
    toJSON:{virtuals: true},
    toObject:{virtuals: true}//also for handling as object
  }
);
/*this is to quicly access the tours by price and ratingsAverage, as they are frequently used in queries
that hepls a lot to speed up the queries, that uses this fields
1 means ascending order, -1 means descending order*/
tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});//this is to index the slug field, so we can search by slug
//this is to index the startLocation field, so we can search by location quicly
tourSchema.index({startLocation: '2dsphere'});//as a GeoJSON object, the index order way is 2dsphere way
//a virtual property of a defined squema y a field that can be calculated from the fields like duration in weeks
tourSchema.virtual('durationWeeks').get(
  function(){//we use a real function because we will handle the parameters of pour object by using this.
    return this.duration / 7; 
});

  /* this is a virtual table with n:n of tour ID and Review ID that will use to populate the reviews,
  we will use the populate method to get the reviews of each tour
  works like a reference but we will not store the reviews ID in the tour*/
tourSchema.virtual('reviews', {
  ref: 'Review',// the document model name where to look at for the ID
  foreignField: 'tour',// the field in the reviews model that stores the id of the tour 
  localField: '_id'//our local field that stores our id to compare with the foreign field
});

/*DOCUEMNT MIDDLEWARE as we know triggers, runs everytime ocurrPRE MEANS  BEFORE this callings: 
save(), create() , NOT working for insertMany() this time a cool example before save a new tour
we will have a field called slug so we can handle in the url, to create a slug we use slugify
and as a express midleware wqe next to call next
THIS refers to the current document*/
  tourSchema.pre('save', function(next){
      this.slug= slugify(this.name, {lower:true});
      next();
  });


//this way is to embed the user info into the tour, but we will use the reference
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

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

    // this is to populate the guides field with the user info, we will use the populate method
    // path refers to wich object ids wants to populate, select -__v -passwordChangedAt
    //  means that we dont want to show this fields
    tourSchema.pre(/^find/, function(next) {
      this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
      });

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

// to work with geospacial route for distances we will disable for now, because this middleware
// makes to be the first one stage pipeline , and to use geoespatial in pipelines, this need to be first always
/*tourSchema.pre('aggregate', function(next){  
  //console.log(this.pipeline());
  //we will modify the agregate by adding a stage at the end using unshift and filter by match 
  //where all the docs that secret tour is true
  this.pipeline().unshift({$match:{secretTour:{$ne:true}}});
  next();
});*/

  const Tour = mongoose.model('Tour',tourSchema);
  module.exports= Tour;