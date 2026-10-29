const mongoose = require('mongoose');
const Event = require('../models/Event');
const { HttpError } = require('../utils/http');
async function ownedEvent(userId, eventId) {
  if (!mongoose.isValidObjectId(eventId)) throw new HttpError(400, 'Invalid event ID');
  const event = await Event.findOne({ _id: eventId, userId });
  if (!event) throw new HttpError(404, 'Event not found');
  return event;
}
async function addItem(userId, eventId, input) {
  const event = await ownedEvent(userId, eventId);
  event.checklist.push(input);
  await event.save();
  return event;
}
async function updateItem(userId, eventId, itemId, input) {
  const event = await ownedEvent(userId, eventId);
  const item = event.checklist.id(itemId);
  if (!item) throw new HttpError(404, 'Checklist item not found');
  item.set(input);
  await event.save();
  return event;
}
async function deleteItem(userId, eventId, itemId) {
  const event = await ownedEvent(userId, eventId);
  const item = event.checklist.id(itemId);
  if (!item) throw new HttpError(404, 'Checklist item not found');
  item.deleteOne();
  await event.save();
  return event;
}
module.exports = { addItem, updateItem, deleteItem };
