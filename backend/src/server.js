const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { initFirebase } = require('./config/firebase');
const { isCloudinaryConfigured } = require('./config/cloudinary');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Warm Firebase Admin if credentials are present
initFirebase();
console.log(
  isCloudinaryConfigured()
    ? 'Cloudinary configured — uploads go to cloud'
    : 'Cloudinary not configured — uploads use local /uploads (dev only)'
);

const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const adminRoutes = require('./routes/adminRoutes');
const metaRoutes = require('./routes/metaRoutes');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin(origin, callback) {
      // Allow mobile apps / curl (no Origin) and configured admin frontends
      if (!origin || config.corsOrigins.includes(origin) || config.corsOrigins.includes('*')) {
        return callback(null, true);
      }
      if (config.nodeEnv !== 'production') {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), config.uploadDir))
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, try again later' },
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DT Car Bazaar API',
    health: '/api/health',
    docs: {
      auth: ['POST /api/register', 'POST /api/login', 'GET /api/profile'],
      cars: ['GET /api/cars', 'GET /api/cars/:id'],
      admin: ['POST /api/admin/login', 'GET /api/admin/dashboard'],
      contact: ['GET /api/contact'],
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'DT Car Bazaar API running' });
});

app.use('/api', authLimiter);
app.use('/api', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', metaRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDB();
  try {
    const { backfillMissingCarKeys } = require('./utils/carKey');
    const filled = await backfillMissingCarKeys();
    if (filled > 0) console.log(`Backfilled carKey for ${filled} cars`);
  } catch (err) {
    console.warn('Car key backfill skipped:', err.message);
  }

  // Render free has no Shell. Set SEED_ON_START=true once, deploy, then turn it off.
  if (String(process.env.SEED_ON_START).toLowerCase() === 'true') {
    try {
      console.log('SEED_ON_START enabled — seeding database...');
      const { seed } = require('./seed');
      const { seedCars } = require('./seedCars');
      await seed();
      await seedCars();
      console.log('SEED_ON_START finished. Set SEED_ON_START=false in Render and redeploy.');
    } catch (err) {
      console.warn('SEED_ON_START failed:', err.message);
    }
  }

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});

module.exports = app;
