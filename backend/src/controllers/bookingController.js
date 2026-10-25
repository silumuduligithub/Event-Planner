const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { calculateEstimate } = require('../services/estimateService');
const { HttpError, asyncHandler, ok } = require('../utils/http');

const estimate = asyncHandler(async (req, res) => {
  ok(res, 'Estimate calculated', await calculateEstimate(req.body));
});

const createBooking = asyncHandler(async (req, res) => {
  const { eventId, eventDate, eventTime, eventLocation, userNotes } = req.body;
  if (eventId) {
    const event = await Event.findOne({ _id: eventId, userId: req.auth.id });
    if (!event) throw new HttpError(404, 'Event not found');
  }
  const pricing = await calculateEstimate(req.body);
  const booking = await Booking.create({
    ...pricing, taxRate: undefined, advanceRate: undefined,
    userId: req.auth.id, eventId, eventDate, eventTime, eventLocation, userNotes,
    status: 'estimate_requested',
  });
  ok(res, 'Booking request submitted', booking, 201);
});

const listUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.auth.id }).sort({ createdAt: -1 }).populate('vendorId', 'businessName vendorType');
  ok(res, 'Bookings retrieved', bookings);
});

const listVendorBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ vendorId: req.auth.id }).sort({ createdAt: -1 }).populate('userId', 'name city');
  ok(res, 'Leads retrieved', bookings);
});

const transitions = {
  estimate_requested: ['accepted', 'rejected', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
};
const updateStatus = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(400, 'Invalid booking ID');
  const booking = await Booking.findOne({ _id: req.params.id, vendorId: req.auth.id });
  if (!booking) throw new HttpError(404, 'Booking not found');
  if (!transitions[booking.status]?.includes(req.body.status)) throw new HttpError(400, 'Invalid booking status transition');
  booking.status = req.body.status;
  await booking.save();
  ok(res, 'Booking status updated', booking);
});

module.exports = { estimate, createBooking, listUserBookings, listVendorBookings, updateStatus };
