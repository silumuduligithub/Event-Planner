const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: function () { return !this.googleSub && !this.appleSub; }, select: false },
  googleSub: { type: String, unique: true, sparse: true, select: false },
  appleSub: { type: String, unique: true, sparse: true, select: false },
  resetPasswordHash: { type: String, select: false },
  resetPasswordExpiresAt: { type: Date, select: false },
  resetPasswordSentAt: { type: Date, select: false },
  phone: { type: String, trim: true },
  city: { type: String, trim: true },
  avatar: { type: String, default: '' },
  savedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  fcmToken: { type: String, select: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
