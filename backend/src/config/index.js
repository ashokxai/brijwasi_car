require('dotenv').config();

function parseOrigins(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const corsOrigins = parseOrigins(process.env.CORS_ORIGINS);
if (clientUrl && !corsOrigins.includes(clientUrl)) {
  corsOrigins.push(clientUrl);
}
if (!corsOrigins.length) {
  corsOrigins.push('http://localhost:5173');
}

module.exports = {
  port: process.env.PORT || 5050,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dt_car_bazaar',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminJwtExpiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '1d',
  clientUrl,
  corsOrigins,
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 5),
  contactPhone: process.env.CONTACT_PHONE || '+918630930402',
  contactWhatsapp: process.env.CONTACT_WHATSAPP || '918630930402',
  nodeEnv: process.env.NODE_ENV || 'development',
};
