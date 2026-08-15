const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      // Required for classic register; Google / Firebase users may not have a phone yet.
      required: function requiredPhone() {
        return !this.firebaseUid;
      },
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
      required: function requiredPassword() {
        return !this.firebaseUid;
      },
    },
    firebaseUid: { type: String, sparse: true, unique: true, trim: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    favorites: this.favorites,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
