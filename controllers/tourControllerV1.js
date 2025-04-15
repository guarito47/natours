const fs= require('fs');
// we read the json file and the result we parse to a javascript object
const Tour = require('../models/tourModels');

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)) ;

exports.checkId = (req, res, next, val)=>{

    console.log(`check id:${val}`);
    if(req.params.id*1>tours.length){//if we tourfinded is null(undefined) by no exist
        return res.status(400).json(
            {
                status: 'fail',
                message: 'checkId midle:invialid id'
            }
        );
    } 
    next();
};

exports.checkBody=(req, res, next)=>{
    if(!req.body.name || !req.body.price){
        return res.status(400).json(
            {
                status: 'fail',
                message: 'checkBody midle:missing name or price'
            }
        );
    }
    next();
};

exports.getAllTours= (req, res)=>{
    
    console.log(req.tiempoConsulta);
    res
    .status(200)
    .json({
        status:'success',
        requestAt: req.tiempoConsulta,        
        results: tours.length,
        data: {
            tours: tours
        }
    });
};

exports.getTour= (req, res)=>{
    console.log(req.params)
    //we grab the id from the url param TRICK: and * 1 to convert to numerical value
    const urlId = req.params.id*1;    
    //we use find function to grab the specific tour
    const tourFinded= tours.find(el => el.id===urlId );
    //console.log(tourFinded);
    //this if is to reproduce a fictional invalid id by just comparing url id > the tours.lenght    
    //if(urlId>tours.length){
    
    
    res.status(200).json(
        {
            status:'succes',
            data: {
                tourFinded
            }
        }
    );
};

exports.createTour=(req, res)=>{
    //console.log(req.body);
    //first we need to create a new id, we will use the last one+1 from tour array
    const  newId= tours[tours.length-1].id+1;
    //next we need to pass the new tour having the new id+the info that we recieve
    //to do that we will use Object.assing that merge 2 info into 1
    const newTour= Object.assign({id:newId}, req.body)
    //now ad this nmew object to the current arraus of objects
    tours.push(newTour);
    //now to store, before convert from javascript object to an json objevt notattion we use stringify
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err)=>{
        res
        .status(201)
        .json(
            {
                status:'success',
                data: newTour
            }
        );
    });

};

exports.updateTour= (req, res)=>{
    
    res.status(200).json(
        {
            status:'succes',
            data: {
                tour: '<updated tour here..>'
            }
        }
    );
};
exports.deleteTour= (req, res)=>{
    
       
    
    res.status(204).json({
            status:'success',
            //we can calculate other fileds from the object 
            data: null
        });
};
