require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/aitb_employee_db',
  JWT_SECRET: process.env.JWT_SECRET || 'your_fallback_jwt_secret',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
  UPLOAD_LIMIT: process.env.UPLOAD_LIMIT || '5mb',
  
  // Email configuration (if you add email service later)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  FROM_EMAIL: process.env.FROM_EMAIL,
  FROM_NAME: process.env.FROM_NAME || 'AITB Employee System'
};