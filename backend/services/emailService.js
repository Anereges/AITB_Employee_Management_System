const nodemailer = require('nodemailer');

// Create a transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: process.env.EMAIL_USERNAME || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-email-password'
  }
});

// Email service functions
const emailService = {
  sendEmail: async (to, subject, text, html) => {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'your-email@gmail.com',
        to,
        subject,
        text,
        html
      };

      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  },

  // Add more email-related functions as needed
};

module.exports = emailService;