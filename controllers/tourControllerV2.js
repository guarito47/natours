const Tour = require('../models/tourModels');

exports.getAllTours= async(req, res)=>{
    
    try{

        console.log(req.query);
        //to query all the collections in this collection just leave empty
    //this will return a promise so we will convert a async function
    const tours = await Tour.find()
    
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
        .status(400)
        .json({
            status:'fail',        
            message:'fail to get all tours'
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
