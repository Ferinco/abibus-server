module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret_here",
  CLOUD_NAME: process.env.CLOUD_NAME || "your-cloud-name",
  CLOUD_API_KEY: process.env.CLOUD_API_KEY || "your-cloud-api-key",
  CLOUD_API_SECRET: process.env.CLOUD_API_SECRET || "your-cloud-api-secret",
  EMAIL_USER: process.env.EMAIL_USER || "admin@abibushotelandsuites.com",
  EMAIL_PASS: process.env.EMAIL_PASS || "Admin@Abibus2024",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@abibus.com",
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI_TEST: process.env.MONGODB_URI_TEST,
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.zoho.com",
  EMAIL_PORT: process.env.EMAIL_PORT || 465,
};
