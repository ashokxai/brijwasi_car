require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Brand = require('./models/Brand');
const CarModel = require('./models/CarModel');
const City = require('./models/City');
const FuelType = require('./models/FuelType');
const Banner = require('./models/Banner');

async function seed() {
  await connectDB();

  const adminEmail = 'admin@dtcarbazaar.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'DT Admin',
      email: adminEmail,
      phone: '8630930402',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('Admin created:', adminEmail, '/ Admin@123');
  } else {
    console.log('Admin already exists');
  }

  const fuelNames = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
  for (const name of fuelNames) {
    await FuelType.findOneAndUpdate(
      { name },
      { name, isActive: true },
      { upsert: true, returnDocument: 'after' }
    );
  }

  const cityNames = ['Mathura', 'Agra', 'Delhi', 'Noida', 'Gurgaon', 'Jaipur'];
  for (const name of cityNames) {
    await City.findOneAndUpdate(
      { name },
      { name, isActive: true },
      { upsert: true, returnDocument: 'after' }
    );
  }

  const brandsData = {
    'Maruti Suzuki': ['Swift', 'Baleno', 'WagonR', 'Dzire', 'Ertiga'],
    Hyundai: ['i20', 'Creta', 'Venue', 'Grand i10'],
    Honda: ['City', 'Amaze', 'Jazz'],
    Tata: ['Nexon', 'Punch', 'Tiago', 'Altroz'],
    Toyota: ['Innova', 'Fortuner', 'Glanza'],
  };

  for (const [brandName, models] of Object.entries(brandsData)) {
    const brand = await Brand.findOneAndUpdate(
      { name: brandName },
      { name: brandName, isActive: true },
      { upsert: true, returnDocument: 'after' }
    );
    for (const modelName of models) {
      await CarModel.findOneAndUpdate(
        { brand: brand._id, name: modelName },
        { brand: brand._id, name: modelName, isActive: true },
        { upsert: true, returnDocument: 'after' }
      );
    }
  }

  const bannerCount = await Banner.countDocuments();
  if (bannerCount === 0) {
    await Banner.create([
      {
        title: 'Buy Trusted Used Cars',
        imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200',
        link: '',
        order: 1,
        isActive: true,
      },
      {
        title: 'Sell Your Car in 24 Hours',
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200',
        link: '',
        order: 2,
        isActive: true,
      },
    ]);
    console.log('Sample banners created');
  }

  console.log('Seed completed');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seed };