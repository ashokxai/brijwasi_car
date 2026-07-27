const path = require('path');
const fs = require('fs');
const multer = require('multer');
const config = require('../config');
const AppError = require('../utils/AppError');

const uploadRoot = path.join(process.cwd(), config.uploadDir);
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadRoot);
  },
  filename(req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new AppError('Only JPEG, PNG and WebP images are allowed', 400), false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024, files: 10 },
});

module.exports = { upload, uploadRoot };
