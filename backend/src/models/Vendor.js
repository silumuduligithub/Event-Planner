const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  pricingType: { type: String, enum: ['fixed', 'per_plate', 'per_hour', 'per_day', 'per_event'], default: 'fixed' },
  price: { type: Number, required: true, min: 0 },
  description: String,
  isOptional: { type: Boolean, default: true },
});

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  roleOrSkill: String,
  pricePerPerformance: { type: Number, required: true, min: 0 },
  photo: String,
  sampleAudioVideoUrl: String,
  bio: String,
  isAvailable: { type: Boolean, default: true },
});

const vendorSchema = new mongoose.Schema({
  businessName: { type: String, required: true, trim: true },
  ownerName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, required: true, trim: true },
  vendorType: { type: String, required: true, enum: ['Event Planner', 'Photography', 'Videography', 'Catering', 'Venue', 'Decoration', 'DJ & Sound', 'Orchestra & Melody', 'Celebrity & Artist', 'Makeup & Styling', 'Other'] },
  description: String,
  address: {
    city: { type: String, required: true },
    state: String,
    pincode: String,
    fullAddress: String,
  },
  portfolioImages: [{ type: String }],
  videoLinks: [{ type: String }],
  startingPrice: { type: Number, default: 0, min: 0 },
  services: [serviceSchema],
  artistsOrCelebrities: [artistSchema],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },
  isVerified: { type: Boolean, default: false },
  fcmToken: { type: String, select: false },
}, { timestamps: true });

vendorSchema.index({ vendorType: 1, 'address.city': 1, startingPrice: 1 });
module.exports = mongoose.model('Vendor', vendorSchema);
