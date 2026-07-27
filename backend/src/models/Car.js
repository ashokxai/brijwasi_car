const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    carKey: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    model: { type: mongoose.Schema.Types.ObjectId, ref: 'CarModel', required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    kmDriven: { type: Number, required: true },
    fuelType: { type: mongoose.Schema.Types.ObjectId, ref: 'FuelType', required: true },
    transmission: {
      type: String,
      enum: ['Manual', 'Automatic'],
      default: 'Manual',
    },
    ownership: {
      type: String,
      enum: ['First Owner', 'Second Owner', 'Third Owner', 'Fourth Owner or more'],
      default: 'First Owner',
    },
    insuranceValidity: { type: String, default: '' },
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
    description: { type: String, default: '' },
    images: {
      type: [String],
      validate: {
        validator(v) {
          return Array.isArray(v) && v.length >= 1 && v.length <= 10;
        },
        message: 'Cars must have between 1 and 10 images',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    isCertified: { type: Boolean, default: false },
    rejectionReason: { type: String, default: '' },
    listedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listedByRole: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  },
  { timestamps: true }
);

carSchema.index({ price: 1, year: 1, status: 1 });
carSchema.index({ title: 'text', description: 'text', carKey: 'text' });

module.exports = mongoose.model('Car', carSchema);
