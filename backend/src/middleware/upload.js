const path = require('path');
const fs = require('fs');
const multer = require('multer');
const config = require('../config');
const AppError = require('../utils/AppError');

const uploadRoot = path.join(process.cwd(), config.uploadDir);
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new AppError('Only JPEG, PNG and WebP images are allowed', 400), false);
  }
  cb(null, true);
}

// Always buffer in memory; controller chooses Cloudinary vs local disk.
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024, files: 10 },
});

module.exports = { upload, uploadRoot };
