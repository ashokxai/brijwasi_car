const mongoose = require('mongoose');

const carModelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

carModelSchema.index({ brand: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('CarModel', carModelSchema);
