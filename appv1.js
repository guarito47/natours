const fs= require('fs');
const express = require('express');
const app= new express();
//here we are telling that we will use a middleware that is express.json that handle json data
//because the req.body is not send it by express,only the client, but now just for demostration pourposes
app.use(express.json());
/* app.get('/', (req, res)=>{
    //res.status(200).send('hello from the server side');
    res
    .status(200)
    .json({message:'hello from the server side', app:'guaritours'});
});

app.post('/', (req, res)=>{
    res
    .status(200)
    .json({message:'hello from post the server side', app:'guaritours'});
}); */

// we read the json file and the result we parse to a javascript object
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)) ;

app.get('/api/v1/tours', (req, res)=>{
    res.status(200).json(
        {
            status:'succes',
            //we can calculate other fileds from the object 
            results: tours.length,
            data: {
                tours: tours
            }
        }
    );
});

app.get('/api/v1/tours/:id', (req, res)=>{
    console.log(req.params)
    //we grab the id from the url param TRICK: and * 1 to convert to numerical value
    const urlId = req.params.id*1;    
    //we use find function to grab the specific tour
    const tourFinded= tours.find(el => el.id===urlId );
    console.log(tourFinded);
    //this if is to reproduce a fictional invalid id by just comparing url id > the tours.lenght    
    //if(urlId>tours.length){
    if(!tourFinded){//if we tourfinded is null(undefined) by no exist
        return res.status(400).json(
            {
                status: 'fail',
                message: 'invialid id'
            }
        );
    }    
    
    res.status(200).json(
        {
            status:'succes',
            //we can calculate other fileds from the object 
            data: {
                tourFinded
            }
        }
    );
});

app.patch('/api/v1/tours/:id', (req, res)=>{
    
    if(req.params.id*1>tours.length){//if we tourfinded is null(undefined) by no exist
        return res.status(400).json(
            {
                status: 'fail',
                message: 'invialid id'
            }
        );
    }    
    
    res.status(200).json(
        {
            status:'succes',
            //we can calculate other fileds from the object 
            data: {
                tour: '<updated tour here..>'
            }
        }
    );
});

app.delete('/api/v1/tours/:id', (req, res)=>{
    
    if(req.params.id*1>tours.length){//if we tourfinded is null(undefined) by no exist
        return res.status(400).json(
            {
                status: 'fail',
                message: 'invialid id'
            }
        );
    }    
    
    res.status(204).json({
            status:'success',
            //we can calculate other fileds from the object 
            data: null
        });
});

app.post('/api/v1/tours', (req, res)=>{
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

});


port= 3000;
app.listen(port, ()=>{
    console.log('guaritorus working on port:'+port);
});