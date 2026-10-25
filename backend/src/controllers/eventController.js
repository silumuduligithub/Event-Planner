const mongoose = require('mongoose');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { HttpError, asyncHandler, ok } = require('../utils/http');

const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, userId: req.auth.id });
  ok(res, 'Event created', event, 201);
});
const listEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ userId: req.auth.id }).sort({ eventDate: 1 });
  ok(res, 'Events retrieved', events);
});
async function ownedEvent(req) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(400, 'Invalid event ID');
  const event = await Event.findOne({ _id: req.params.id, userId: req.auth.id });
  if (!event) throw new HttpError(404, 'Event not found');
  return event;
}
const getEvent = asyncHandler(async (req, res) => ok(res, 'Event retrieved', await ownedEvent(req)));
const updateEvent = asyncHandler(async (req, res) => {
  const event = await ownedEvent(req);
  for (const [key, value] of Object.entries(req.body)) event.set(key, value);
  await event.save();
  ok(res, 'Event updated', event);
});
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await ownedEvent(req);
  if (await Booking.exists({ eventId: event._id })) throw new HttpError(409, 'Event has bookings and cannot be deleted');
  await event.deleteOne();
  ok(res, 'Event deleted', { id: event._id });
});
module.exports = { createEvent, listEvents, getEvent, updateEvent, deleteEvent };
