const Tour = require('../models/tourModels');

exports.aliasTopTours=(req, res, next)=>{
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	console.log('alias top cheap');
	console.log(req.query);

	next();

};

exports.getAllTours= async(req, res)=>{
    
    try{        			
        //way 1
        /*const tours = await Tour.find({
          duration: 5,
          difficulty:'easy'
        });*/
        //way 2
    /*const tours = await Tour.find()
                                .where('duration').equals(5)
                                .where('difficulty').equals('easy');*/

		//LETS BUILD THE QUERY
		//1.A) FILTERING
    //in the real world in the url comes not just field params, sometimes include
    //page, sort, limit etc that is not part of th squema so we will remove those
    //to do that we need a copy (not reference)of the values of req.query
    //TRICK: we will create an object {}, ... means deconstructing
    const queryObj = {...req.query};
    //next prepare the list of exclusions
    const excludeFields= ['page', 'sort', 'limit', 'fields'];
    //we loop the fields to remove and for each we will remove from of queryObj if its present
    excludeFields.forEach(el=>delete queryObj[el]);
    //console.log(req.query, queryObj);

    /*IMPORTANT: this line of code by executing the QUERY in  AWAIT mode that means the promise will return with
    return sucessfully with docs from the db , in that moment theres no way to sort
    or group by pages etc*/
    //const tours = await Tour.find(req.query);
    //so the solution is use the return find as Query Object,
		//by removing the await cvomand
		// 1.B)ADVANCE FILTERING
		//we will use the >= val for the field of duration, in this case we need to use
		//[gte]=5 in the url and in the code duration: {&gte:5} 
		//in the query params handle like this
		//{difficulty:'easy', duration:{gte:'5'}}
		//but we need to parse like this
		//{difficulty:'easy', duration:{$gte:5}}
		//to replace/add &gte,first convert rto string to do operations
		//we will not only gte (greater than, equal) also for the rest of the possible
		//operators, trick we will use regular expressions
		
		let queryStr=JSON.stringify(queryObj);
		//stringify fomat result: {"difficulty":"easy","duration":{"gte":"5"}}			
		// the /(..)/ to tell that we will use regular expression
		//inside the text that we want to find separated by | its its more than one
		// \b...\b means to only apply to the exact match
		//finally the g to apply multiple times if present the occurs
		//then when appears one of this case, we will handle as match and will return
		//tye same word but with $ added to the begining importa t no spaces between
		queryStr= queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match=> `$${match}`);	
		//now using JSON.parse to convert to Json format, the result is
		//{ difficulty: 'easy', duration: { '$ gte': '5' } }		

		let queryDBFields = Tour.find(JSON.parse(queryStr));
// 2) SORTING, because queryBDFielt still an Query object we can still chain more 
//operations to the query object
		if(req.query.sort){//if exist this parameter in the url
			//if we have more than 1 sort parameter that means second layer of sorting
			//mongoose allow to add multiple layers of sort by just adding them separated with space				
			const sortBy= req.query.sort.split(',').join(' ');			
			queryDBFields= queryDBFields.sort(sortBy);
		} else {

			queryDBFields=queryDBFields.sort('-createdAt');
		}

// 3) FIELD filtering

		if(req.query.fields){//if exist this parameter in the url
			//if we have more than 1 sort parameter that means second layer of sorting
			//mongoose allow to add multiple layers of sort by just adding them separated with space				
			const fieldBy= req.query.fields.split(',').join(' ');			
			queryDBFields= queryDBFields.select(fieldBy);
		} else {

			queryDBFields=queryDBFields.select('-__v');
		}

		// 4) PAGINATION an limitation: just skip an amount of objects after sending the obkject result
		//we grab the page number, multiply *1 to convert to number, || 1 to set default page 1
		const page= req.query.page*1 || 1;
		const limit= req.query.limit*1 ||100;
		//formula to skip objects to start in the page requested this is the formula
		const skip= (page-1)*limit;
		
		//console.log('values page limit skip v9');
		//console.log(page, limit, skip);

		//the limit is not working
		queryDBFields= queryDBFields.skip(skip).limit(limit);		
		//in order to dont have more pages to next when we don have it, lets limit the pages by getting
		//the total of tours that we have in the collection
		if(req.query.page){//if exist the url parameter page			
			const numTours= await Tour.countDocuments(); 
			if(skip >= numTours)
				throw new Error('no more page numbers to move on');
		}
    //NOW LETS EXECUTE THE QUERY
		const tours = await queryDBFields;
		//NOW SEND THE RESPONSE
		
    res
    .status(200)
    .json({
        status:'success',
        //requestAt: req.tiempoConsulta,        
        results: tours.length,
        data: {
            tours: tours
        }
    });
    } catch(err){
        res
        .status(404)
        .json({
            status:'fail',        
            message:err
        });
    }    
};

exports.getTour= async(req, res)=>{
    
    try{
        //Tour.findOne({_id: req.params.id})
        const tourFinded= await Tour.findById(req.params.id);
        res.status(200).json(
            {
                status:'succes',
                data: {
                    tourFinded
                }
            }
        );
    } catch(err){
        res
        .status(400)
        .json({
            status:'fail',        
            message:err
        });
    }
    
};

exports.createTour=async(req, res)=>{
    //this is the old way to create new row/document in the db
    //const newTour= new Tour({sampleDataHere});
    //newTour.save();

    try{
    //newest way to create/store new row/document in the db
    //directly calling a method from the model squema, while the older way
    //creates an instance and as a document object uses the method save to do the exact task 
    //intead to use the then() to get the result obj we upgrate to async function
    //so we can use await to get the result in a more secuence running way
    const newTour=  await Tour.create(req.body);

    res
    .status(201)
    .json(
        {
            status:'success',
            data:{
                tour: newTour
            } 
        }
    );  
    } catch(err){
        console.log(`error create tour:${err}`);
        res.status(400)
        .json({
            status:'fail',
            message: 'invalid data sent from create tour'
        });
    } 
};

exports.updateTour= async (req, res)=>{

    try {
        // some options to add are 
        const updatedTour= await Tour.findByIdAndUpdate(req.params.id, req.body,{
            new:true,//to return the updated document
            runValidators:true
        } )
        res.status(200).json(
            {
                status:'succes',
                data: {
                    tour: updatedTour
                }
            }
        );
    } catch (error) {
        res.status(400)
        .json({
            status:'fail',
            message: error
        });
    }
    
};
exports.deleteTour= async(req, res)=>{ 
    try {
        // some options to add are 
        const deletedTour= await Tour.findByIdAndDelete(req.params.id);
        console.log('tour deleted');
        res.status(200).json(
            {
                status:'succes',
                data: {
                    tour: deletedTour
                }
            }
        );
    } catch (error) {
        res.status(400)
        .json({
            status:'fail',
            message: error
        });
    }
};
