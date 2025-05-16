const swaggerJsdoc = require('swagger-jsdoc');
/*
const options = {    
    definition: {
        openapi: '3.1.1',        
        info: {            
            title: 'Natours API',
            version: '1.0.0',
            description: 'API for Natours SIte',
            contact: {
                name: 'Edwin Guarachi'
            },
            servers: [
                {
                    url: 'http://localhost:3000',
                    description: 'Local server'
                }
            ]
        }
    },
     // Path to the API docs
    apis: ['./routes/*.js']
};*/

const options = {
  definition:{
    openapi: '3.1.1',
    info: {
      title: 'Natours API',
      version: '1.0.0',
      description: 'API for Natours SIte',
      contact: {
        name: 'Edwin Guarachi'
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local server'
        }
      ],
      
    }
  },
  apis: ['./routes/*.js']
}

const specs = swaggerJsdoc(options);
module.exports =specs;