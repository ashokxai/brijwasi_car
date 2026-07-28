const path = require('path');
const fs = require('fs');
const { v2: cloudinary } = require('cloudinary');
const config = require('./index');

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function configureCloudinary() {
  if (!isCloudinaryConfigured()) return false;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return true;
}

async function uploadImageBuffer(buffer, folder = 'dt-car-bazaar') {
  if (!configureCloudinary()) {
    const err = new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.'
    );
    err.statusCode = 503;
    throw err;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

function saveLocalFile(file) {
  const uploadRoot = path.join(process.cwd(), config.uploadDir);
  if (!fs.existsSync(uploadRoot)) {
    fs.mkdirSync(uploadRoot, { recursive: true });
  }
  const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  fs.writeFileSync(path.join(uploadRoot, filename), file.buffer);
  return `/uploads/${filename}`;
}

async function filesToImageUrls(files, folder = 'dt-car-bazaar/cars') {
  if (!files || !files.length) return [];

  if (isCloudinaryConfigured()) {
    return Promise.all(files.map((file) => uploadImageBuffer(file.buffer, folder)));
  }

  return files.map((file) => saveLocalFile(file));
}

async function fileToImageUrl(file, folder = 'dt-car-bazaar/banners') {
  if (!file) return null;
  const [url] = await filesToImageUrls([file], folder);
  return url;
}

module.exports = {
  isCloudinaryConfigured,
  configureCloudinary,
  uploadImageBuffer,
  filesToImageUrls,
  fileToImageUrl,
};
