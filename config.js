

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.DB_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  CLOUD_NAME: process.env.CLOUD_NAME || 'your-cloud-name',
  CLOUD_API_KEY: process.env.CLOUD_API_KEY || 'your-cloud-api-key',
  CLOUD_API_SECRET: process.env.CLOUD_API_SECRET || 'your-cloud-api-secret',
  EMAIL_USER: process.env.EMAIL_USER || 'your-email-user',
  EMAIL_PASS: process.env.EMAIL_PASS || 'your-email-pass',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@abibus.com',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI_TEST: process.env.MONGODB_URI_TEST,
};
