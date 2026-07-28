require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const connectDB = require('./config/db');
const User = require('./models/User');
const Brand = require('./models/Brand');
const CarModel = require('./models/CarModel');
const City = require('./models/City');
const FuelType = require('./models/FuelType');
const Car = require('./models/Car');
const config = require('./config');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlink(dest, () => {});
          return download(res.headers.location, dest).then(resolve).catch(reject);
        }
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(dest)));
      })
      .on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

async function seedCars() {
  await connectDB();

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.error('Run npm run seed first to create admin');
    process.exit(1);
  }

  const existing = await Car.countDocuments();
  if (existing > 0) {
    console.log(`Cars already exist (${existing}). Skipping sample cars.`);
    process.exit(0);
  }

  const uploadRoot = path.join(process.cwd(), config.uploadDir);
  if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });

  const brand = await Brand.findOne({ name: 'Maruti Suzuki' });
  const model = await CarModel.findOne({ name: 'Swift', brand: brand._id });
  const diesel = await FuelType.findOne({ name: 'Diesel' });
  const petrol = await FuelType.findOne({ name: 'Petrol' });
  const city = await City.findOne({ name: 'Mathura' }) || (await City.findOne());

  const samples = [
    {
      title: 'Swift VDI',
      year: 2018,
      price: 300000,
      kmDriven: 75000,
      fuelType: diesel._id,
      transmission: 'Manual',
      ownership: 'First Owner',
      insuranceValidity: 'May 2025',
      isCertified: true,
      imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
    },
    {
      title: 'Baleno Alpha',
      year: 2020,
      price: 550000,
      kmDriven: 42000,
      fuelType: petrol._id,
      transmission: 'Manual',
      ownership: 'First Owner',
      insuranceValidity: 'Dec 2025',
      isCertified: true,
      imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    },
    {
      title: 'Dzire ZXI',
      year: 2019,
      price: 480000,
      kmDriven: 51000,
      fuelType: petrol._id,
      transmission: 'Automatic',
      ownership: 'Second Owner',
      insuranceValidity: 'Aug 2025',
      isCertified: false,
      imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    },
  ];

  for (const [index, sample] of samples.entries()) {
    const filename = `sample-${Date.now()}-${index}.jpg`;
    const dest = path.join(uploadRoot, filename);
    try {
      await download(sample.imageUrl, dest);
    } catch (err) {
      console.warn('Image download failed, creating placeholder', err.message);
      // Minimal valid JPEG
      const jpeg = Buffer.from(
        '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUQEhIVFRUVFRUVFRUVFRUWFxUXFhUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAADBAECBQYAB//EADkQAAIBAwMCBAMFBQkAAAAAAAECAwAEEQUSITFBBhNRYXEigZGhMkJSYnKxwdHwFSMzQ1OCkqLh/8QAGQEAAwEBAQAAAAAAAAAAAAAAAAECAwQF/8QAIhEAAgICAgIDAQEAAAAAAAAAAAECEQMSITFBBQYTIlFh/9oADAMBAAIRAxEAPwD3+iiigD/2Q==',
        'base64'
      );
      fs.writeFileSync(dest, jpeg);
    }

    const carModel =
      (await CarModel.findOne({ brand: brand._id, name: sample.title.split(' ')[0] })) ||
      model;

    await Car.create({
      title: sample.title,
      brand: brand._id,
      model: carModel._id,
      year: sample.year,
      price: sample.price,
      kmDriven: sample.kmDriven,
      fuelType: sample.fuelType,
      transmission: sample.transmission,
      ownership: sample.ownership,
      insuranceValidity: sample.insuranceValidity,
      city: city._id,
      description: `${sample.title} available at DT Car Bazaar. Well maintained.`,
      images: [`/uploads/${filename}`, `/uploads/${filename}`, `/uploads/${filename}`],
      status: 'approved',
      isCertified: sample.isCertified,
      listedBy: admin._id,
      listedByRole: 'admin',
    });
    console.log('Created', sample.title);
  }

  console.log('Sample cars seeded');
}

if (require.main === module) {
  seedCars()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedCars };