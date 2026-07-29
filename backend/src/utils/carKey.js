const Car = require('../models/Car');

async function generateCarKey(session = null) {
  const year = new Date().getFullYear();
  const prefix = `BC-${year}-`;
  const query = Car.findOne({ carKey: new RegExp(`^${prefix}`) }).sort({ carKey: -1 });
  if (session) query.session(session);
  const last = await query.lean();

  let next = 1;
  if (last?.carKey) {
    const parts = last.carKey.split('-');
    const n = parseInt(parts[parts.length - 1], 10);
    if (!Number.isNaN(n)) next = n + 1;
  }

  return `${prefix}${String(next).padStart(5, '0')}`;
}

async function ensureCarKey(carDoc) {
  if (carDoc.carKey) return carDoc.carKey;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      carDoc.carKey = await generateCarKey();
      await carDoc.save();
      return carDoc.carKey;
    } catch (err) {
      if (err.code !== 11000) throw err;
    }
  }
  throw new Error('Could not generate unique car key');
}

async function backfillMissingCarKeys() {
  const cars = await Car.find({
    $or: [{ carKey: { $exists: false } }, { carKey: null }, { carKey: '' }],
  }).sort({ createdAt: 1 });

  for (const car of cars) {
    await ensureCarKey(car);
  }
  return cars.length;
}

module.exports = { generateCarKey, ensureCarKey, backfillMissingCarKeys };
