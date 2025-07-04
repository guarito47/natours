class APIFeatures{

	constructor(mongoQueryObj, reqQuery){
		this.mongoQueryObj= mongoQueryObj;
		this.reqQuery= reqQuery;
	}

	filter(){
		
		const queryObj = {...this.reqQuery};
    const excludeFields= ['page', 'sort', 'limit', 'fields'];    
    excludeFields.forEach(el=>delete queryObj[el]);
    
		let queryStr=JSON.stringify(queryObj);
		queryStr= queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match=> `$${match}`);	

		//let queryDBFields = Tour.find(JSON.parse(queryStr));
		this.mongoQueryObj= this.mongoQueryObj.find(JSON.parse(queryStr));
		//console.log("this filter");
		//console.log(this);	
		return this;//in order to keep chaining this functions filter().sort();..
	}

	sort(){
		if(this.reqQuery.sort){
			const sortBy= this.reqQuery.sort.split(',').join(' ');		
		//console.log("sortBy");
		//console.log(sortBy);	
			this.mongoQueryObj= this.mongoQueryObj.sort(sortBy);
			} else {
			 	this.mongoQueryObj=this.mongoQueryObj.sort('-createdAt');
			}

		//console.log("this sort");
		//console.log(this);	
		return this;
	}

	limitFields(){
		
		if(this.reqQuery.fields){
			const fieldBy= this.reqQuery.fields.split(',').join(' ');
			//const fieldBy= this.reqQuery.fields.split(',').join(' ');
			this.mongoQueryObj= this.mongoQueryObj.select(fieldBy);
		} else {
			//- means exclude __v is the field created by mongo
			this.mongoQueryObj=this.mongoQueryObj.select('-__v');
		}
		//console.log("this limit");
		//console.log(this.mongoQueryObj);	
		return this;
	}

	paginate(){
		const page= this.reqQuery.page*1 || 1;
		const limit= this.reqQuery.limit*1 ||100;
		
		const skip= (page-1)*limit;
		
		this.mongoQueryObj= this.mongoQueryObj.skip(skip).limit(limit);		
		
		//if we think again we dont need this validation because next with 0 result is 
		//a good result when theres no more objectsa to show
		// if(this.reqQuery.page){//if exist the url parameter page			
		// 	const numTours= await Tour.countDocuments(); 
		// 	if(skip >= numTours)
		// 		throw new Error('no more page numbers to move on');
		// }
		//console.log("this paginate");
		//console.log(this.mongoQueryObj);	
		return this;
	}
}

module.exports= APIFeatures;