const nodemailer = require("nodemailer");
const config = require("../config");

const sendEmail = async (options) => {
  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS,
    },
  });

  // Define email options
  const mailOptions = {
    from: config.EMAIL_USER,
    to: options.to,
    subject: options.subject,
    text: options.text,
    attachments: options.attachments,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
