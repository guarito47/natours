const nodemailer = require('nodemailer');
const pug = require('pug'); // pug is a template engine to render an give us html
const {convert} = require('html-to-text'); // this is to convert html to text

//we will create an class to handle the email sending depending on the options we pass to it
//so we can use like: new Email(user, url).sendWelcome(); or sendRecoverPsw(); etc
//this class will be used from the authController.js when singup or recover password

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email; // we will send the email to the user email
    this.firstName = user.name.split(' ')[0]; // [0] has the name and [1] the last name
    this.url = url; // we will use the url to send in the email
    this.from = `Edwin Guarachi <${process.env.EMAIL_FROM}>`; // we will use the name of the sender
  }

  //prepares the transport (mail server, port, credentials) depending on the environment
  natoursTransport() {
  //we ask if we are in development or production environment
  //console.log("process.env.NODE_ENV: ", process.env.NODE_ENV);  
    if(process.env.NODE_ENV.trim() === 'production') {
      //FOR NOW SENGRID IS NOT WORKING DUE TO PHONE VERIFICATION, SO WE WILL USE NODEMAILER
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      
      // in production we will use the sendgrid service      
      /*return nodemailer.createTransport({
        //node js knows internally the server ports etc, here we just tell it to use the sendgrid service
        service: 'SendGrid', 
        auth: {
          user: process.env.SENDGRID_USERNAME, // this is the username for the sendgrid service
          pass: process.env.SENDGRID_PASSWORD // this is the password for the sendgrid service
        }
        //to test the real email sending we will use mailsac.com and create a fake email account
      });*/
    }
    // if we are in development we will use the nodemailer service
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }


  async send(template, subject) {
    // 1) render html based on a 'template', and the variables to pass to the template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject // we can pass the subject as a parameter
    });
    // 2) package all and set what we have till here and put into mail options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject, // comes as parameter of this method
      html, // we can use text or html, but not both      
      // and just in case a only content (text) version of the email //npm i html-to-text
      text: convert(html) // this will convert the html to text
    };

    // 3) Create the transport and send the email with all the processed info
    await this.natoursTransport().sendMail(mailOptions);
  } 

  //is a pre filled method to send a welcome email giving internally the proper template and subject
  async sendWelcome() {    
    await this.send('welcome', 'Welcome to the Natours Family!');
  };

  async sendPasswordReset() {    
    await this.send('passwordReset', 'Your password reset token, (only valid for 10 minutes)');
  };
}


