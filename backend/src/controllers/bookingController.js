const mongoose = require('mongoose');
const { createHash } = require('node:crypto');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { calculateEstimate } = require('../services/estimateService');
const { HttpError, asyncHandler, ok } = require('../utils/http');
const { publicVendor } = require('../utils/demoMedia');

function publicBooking(req, booking) {
  const data = booking.toObject();
  if (data.vendorId && typeof data.vendorId === 'object') data.vendorId = publicVendor(req, data.vendorId);
  return data;
}

const estimate = asyncHandler(async (req, res) => {
  ok(res, 'Estimate calculated', await calculateEstimate(req.body));
});

const createBooking = asyncHandler(async (req, res) => {
  const { eventId, eventDate, eventTime, eventLocation, userNotes, requestKey, expectedQuoteFingerprint } = req.body;
  const requestHash = createHash('sha256').update(JSON.stringify({ ...req.body, requestKey: undefined })).digest('hex');
  if (requestKey) {
    const previous = await Booking.findOne({ userId: req.auth.id, requestKey });
    if (previous) {
      if (previous.requestHash !== requestHash) throw new HttpError(409, 'This request key was used for different booking details');
      return ok(res, 'Booking request already submitted', previous);
    }
  }
  if (eventId) {
    const event = await Event.findOne({ _id: eventId, userId: req.auth.id });
    if (!event) throw new HttpError(404, 'Event not found');
    if (event.eventDate.toISOString().slice(0, 10) !== new Date(eventDate).toISOString().slice(0, 10) || event.location.city.trim().toLowerCase() !== eventLocation.city.trim().toLowerCase()) {
      throw new HttpError(400, 'Booking date and city must match the linked event');
    }
  }
  const pricing = await calculateEstimate(req.body);
  if (expectedQuoteFingerprint && pricing.quoteFingerprint !== expectedQuoteFingerprint) {
    return res.status(409).json({ success: false, message: 'Estimate changed. Review the updated total before requesting.', data: pricing });
  }
  let booking;
  try {
    booking = await Booking.create({
      ...pricing, quoteFingerprint: undefined, taxRate: undefined, advanceRate: undefined,
      userId: req.auth.id, eventId, eventDate, eventTime, eventLocation, userNotes,
      requestKey, requestHash: requestKey ? requestHash : undefined,
      status: 'estimate_requested',
    });
  } catch (error) {
    if (error.code !== 11000 || !requestKey) throw error;
    booking = await Booking.findOne({ userId: req.auth.id, requestKey });
    if (!booking || booking.requestHash !== requestHash) throw new HttpError(409, 'This request key was used for different booking details');
    return ok(res, 'Booking request already submitted', booking);
  }
  ok(res, 'Booking request submitted', booking, 201);
});

const listUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.auth.id }).sort({ createdAt: -1 }).populate('vendorId', 'businessName vendorType portfolioImages phone address');
  ok(res, 'Bookings retrieved', bookings.map((booking) => publicBooking(req, booking)));
});

const getUserBooking = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(400, 'Invalid booking ID');
  const booking = await Booking.findOne({ _id: req.params.id, userId: req.auth.id }).populate('vendorId', 'businessName vendorType portfolioImages phone address');
  if (!booking) throw new HttpError(404, 'Booking not found');
  ok(res, 'Booking retrieved', publicBooking(req, booking));
});

const cancelUserBooking = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(400, 'Invalid booking ID');
  const booking = await Booking.findOne({ _id: req.params.id, userId: req.auth.id });
  if (!booking) throw new HttpError(404, 'Booking not found');
  if (!['estimate_requested', 'pending', 'accepted'].includes(booking.status)) throw new HttpError(400, 'This booking cannot be cancelled');
  booking.status = 'cancelled';
  await booking.save();
  ok(res, 'Booking cancelled', booking);
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

module.exports = { estimate, createBooking, listUserBookings, getUserBooking, cancelUserBooking, listVendorBookings, updateStatus };
