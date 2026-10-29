const mongoose = require('mongoose');
const { requirementKeys } = require('../utils/requirements');

const requirementsSchema = new mongoose.Schema(Object.fromEntries(requirementKeys.map((key) => [key, { type: String, trim: true, maxlength: 500 }])), { _id: false });

const selectedServiceSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  pricingType: { type: String, enum: ['fixed', 'per_plate', 'per_hour', 'per_day', 'per_event'], required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, default: 1, min: 1 },
  totalPrice: { type: Number, required: true, min: 0 },
  requirements: { type: requirementsSchema, default: () => ({}) },
}, { _id: false });

const selectedArtistSchema = new mongoose.Schema({
  artistId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  roleOrSkill: String,
  price: { type: Number, required: true, min: 0 },
  requirements: { type: requirementsSchema, default: () => ({}) },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  bookingType: { type: String, enum: ['full_event_package', 'single_service', 'orchestra_celebrity'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  requestKey: String,
  requestHash: String,
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  occasion: { type: String, trim: true, maxlength: 100 },
  selectedServices: [selectedServiceSchema],
  selectedCelebrities: [selectedArtistSchema],
  eventDate: { type: Date, required: true },
  eventTime: String,
  eventLocation: { city: { type: String, required: true }, address: String },
  subtotal: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  taxAmount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  advanceAmount: { type: Number, default: 0, min: 0 },
  pendingAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['estimate_requested', 'pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'], default: 'estimate_requested' },
  userNotes: String,
  vendorNotes: String,
}, { timestamps: true });

bookingSchema.index({ vendorId: 1, status: 1, eventDate: 1 });
bookingSchema.index({ userId: 1, requestKey: 1 }, { unique: true, partialFilterExpression: { requestKey: { $type: 'string' } } });
module.exports = mongoose.model('Booking', bookingSchema);
