const mongoose = require('mongoose');
const config = require('./index');

function describeMongoUri(uri) {
  try {
    const u = new URL(uri);
    return {
      protocol: u.protocol.replace(':', ''),
      username: decodeURIComponent(u.username || '(none)'),
      host: u.host,
      db: (u.pathname || '/').replace(/^\//, '') || '(none)',
      hasPassword: Boolean(u.password),
      passwordLength: u.password ? decodeURIComponent(u.password).length : 0,
    };
  } catch {
    return { invalid: true, startsWith: String(uri || '').slice(0, 20) };
  }
}

async function connectDB() {
  mongoose.set('strictQuery', true);

  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is missing. Set it in Render → Environment (not only a local .env file).'
    );
  }

  const info = describeMongoUri(config.mongoUri);
  console.log('Connecting to MongoDB:', JSON.stringify(info));

  if (info.invalid) {
    throw new Error('MONGODB_URI is not a valid URL. Check for missing characters or broken paste.');
  }
  if (!info.hasPassword || info.passwordLength < 1) {
    throw new Error('MONGODB_URI has no password. Replace YOUR_REAL_PASSWORD with the Atlas password.');
  }
  if (String(process.env.MONGODB_URI).includes('<') || String(process.env.MONGODB_URI).includes('>')) {
    throw new Error('MONGODB_URI still contains < >. Remove angle brackets around the password.');
  }

  await mongoose.connect(config.mongoUri);
  console.log('MongoDB connected');
}

module.exports = connectDB;
