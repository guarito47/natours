const nodemailer = require('nodemailer');

//we will create an class to handle the email sending depending on the options we pass to it
//so we can use like: new Email(user, url).sendWelcome(); or sendRecoverPsw(); etc

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email; // we will send the email to the user email
    this.firstName = user.name.split(' ')[0]; // [0] has the name and [1] the last name
    this.url = url; // we will use the url to send in the email
    this.from = `Edwin Guarachi <${process.env.EMAIL_FROM}>`; // we will use the name of the sender
  }
}



//options is the object that contains the email To, subject, message etc
const sendEmail = async options => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Edwin Guarachi <guarito@testify.io>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };

  // 3) Actually send the email with the filled mailOptions
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
