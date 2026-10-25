const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  eventType: { type: String, required: true, enum: ['Wedding', 'Birthday', 'Corporate', 'Anniversary', 'Concert', 'Cultural', 'Other'] },
  eventDate: { type: Date, required: true },
  location: { city: { type: String, required: true }, venueName: String },
  estimatedGuests: { type: Number, default: 0, min: 0 },
  totalBudget: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['planning', 'active', 'completed', 'cancelled'], default: 'planning' },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
