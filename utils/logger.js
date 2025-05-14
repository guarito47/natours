/**
 * @file app.js
 * @description creates the logger to track the app
 * @author Edwin Guarachi
 * @created 4/22/2025
 * @lastUpdate 4/25/2025
 * @license MIT License
 */
const {createLogger, format, transports, loggers} = require ('winston');
const winston = require('winston');
const dotEnv = require('dotenv');

const {combine, timestamp, json, prettyPrint, errors, colorize, printf, uncolorize}= format;
const { Logtail } = require("@logtail/node");
const { LogtailTransport } = require("@logtail/winston");

dotEnv.config({path: './config.env'});
let logger=null;

// Create a Logtail client to store logs in better stack service

const logtail = new Logtail(process.env.BETTERSTACK_TOKEN, {
  endpoint: process.env.BETTERSTACK_HOST,
});

const devFormat= printf((info)=>`[${info.timestamp}] [${info.level}]: ${info.message}`);

const devLogger=()=>createLogger({
  level: "debug",
  format: combine(
    //colorize(),
    timestamp({format: "DD:MM:YYYY HH:mm:ss"}),
    devFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename:`${__dirname}/../logs/devDebug.log`  
    }),
    new transports.File({
      filename:`${__dirname}/../logs/devError.log`,
      level:'error',
      handleExceptions: true,
      maxsize: 5242880,
      maxFiles:5
    }),
    new LogtailTransport(logtail)
  ]
});

const prodLogger=()=>createLogger({
  level: "info",
  format: combine(
    errors({stack: true}),    
    timestamp(),//we need the exact server timestamp
    json(),
    prettyPrint()
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename:`${__dirname}/../logs/prodError.log`,
      level:'error',
      handleExceptions: true,
      maxsize: 5242880,
      maxFiles:5
    }),
    new LogtailTransport(logtail)
  ],
  defaultMeta:{service: 'Prod logger service'},
  exitOnError: false
});

//console.log('*'+process.env.NODE_ENV+'*');
if(process.env.NODE_ENV.trim() ==='development'){  
  logger= devLogger();
}

if(process.env.NODE_ENV.trim() ==='production'){  
  logger= prodLogger();
}










const colors= {
  error:'red',
  warn:'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
}

winston.addColors(colors);

const consoleFormat= combine(
  colorize({all: true}),
  timestamp(),
  printf((info)=>`[${info.timestamp}] [${info.level}]: ${info.message}` )
);


const fileFormat= combine(
  uncolorize(),
  timestamp(),
  json()
);

const options ={

  infoFile: {
    level: 'info',
    filename: `${__dirname}/../logs/info.log`,
    handleExceptions: true,
    maxsize: 5242880,
    maxFiles:5,
    format: fileFormat
  },
  warnFile: {
    level: 'warn',
    filename: `${__dirname}/../logs/warns.log`,
    handleExceptions: true,
    maxsize: 5242880,
    maxFiles:5,
    format: fileFormat
  },
  errorFile: {
    level: 'error',
    filename: `${__dirname}/../logs/errors.log`,
    handleExceptions: true,
    maxsize: 5242880,
    maxFiles:5,
    format: fileFormat
  },
  consoleLog: {
    level: 'debug',
    handleExceptions: true,    
    format: consoleFormat
  }
};

const logger2 = createLogger({
  transports:[
    new transports.File(options.infoFile),
    new transports.File(options.warnFile),
    new transports.File(options.errorFile),
    new transports.Console(options.consoleLog)
  ],
  exitOnError: false
});

logger.stream = {
  write(message){
    logger.info(message)
  }
};

module.exports = createLogger({

  level:'debug',
  
  format: combine(
    //format.cli(),
    errors({stack: true}),
    timestamp(),
    //format.printf(info => `[${info.timestamp}] [${info.level}] ${info.message} ${info.json}`),
    json(),
    prettyPrint()
  ),
  
  transports: [
    new transports.File({
      maxsize: 512000,
      maxFiles:5,
      filename:`${__dirname}/../logs/log-api.log`
    }),

    new transports.File({
      maxsize: 512000,
      maxFiles:5,
      filename:`${__dirname}/../logs/errors2.log`,
      level: 'error'
    }),

    new transports.Console({
      level:'debug'      
    })]
});

loggers.add('OrderLogger', {

  level:'info',  
  format: combine(    
    errors({stack: true}),
    timestamp(),    
    json(),
    prettyPrint()
  ),  
  transports: [
    new transports.File({
      maxsize: 512000,
      maxFiles:5,
      filename:`${__dirname}/../logs/orders.log`
    }),

    new transports.Console({
      level:'debug'      
    }),

    new transports.Console({
      level:'debug'      
    }),
    new LogtailTransport(logtail)
  ],  
  defaultMeta: {service: 'orderService'}
});

loggers.add('PaymentLogger', {
  
  format: json(),
  transports: [

    new transports.File({
      maxsize: 512000,
      maxFiles:5,
      filename:`${__dirname}/../logs/payments.log`
    }),

    new LogtailTransport(logtail)
  ],
    defaultMeta: {service: 'PaymentService'}
});



module.exports= logger;