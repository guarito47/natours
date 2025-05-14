const nodemailer = require('nodemailer');

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
