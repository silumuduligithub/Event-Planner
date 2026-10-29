const mongoose = require('mongoose');
const { occasionKey } = require('../utils/occasion');

const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  eventType: { type: String, required: true, trim: true, maxlength: 100 },
  occasionKey: { type: String, index: true },
  eventDate: { type: Date, required: true },
  location: { city: { type: String, required: true }, venueName: String },
  estimatedGuests: { type: Number, default: 0, min: 0 },
  totalBudget: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['planning', 'active', 'completed', 'cancelled'], default: 'planning' },
  checklist: [{ title: { type: String, required: true, trim: true }, completed: { type: Boolean, default: false }, dueDate: Date }],
}, { timestamps: true });

eventSchema.pre('validate', function setOccasionKey() {
  if (this.isModified('eventType') || !this.occasionKey) this.occasionKey = occasionKey(this.eventType);
});

module.exports = mongoose.model('Event', eventSchema);
