const nodemailer = require("nodemailer");
require("dotenv").config();

const CC_SENDER_MAIL = process.env.CC_SENDER_MAIL;
const CC_SENDER_PASS = process.env.CC_SENDER_PASS;

async function sendMail(reciever, subject, body) {
  try {
    // Create a transporter object using your SMTP server details
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or your email service provider
      port: 25,
      auth: {
        user: CC_SENDER_MAIL,
        pass: CC_SENDER_PASS,
      },
    });

    // Create an email message
    const mailOptions = {
      from: CC_SENDER_MAIL,
      to: reciever,
      subject: subject,
      text: body,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.response);
    return { status: true, message: "Email sent:" + info.response };
  } catch (error) {
    console.error("Error sending email:", error);
    return { status: false, message: "Error sending email:" + error };
  }
}

module.exports = {
  sendMail,
};
