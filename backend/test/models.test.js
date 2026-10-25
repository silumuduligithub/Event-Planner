const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
const Event = require('../src/models/Event');
const Booking = require('../src/models/Booking');
const Review = require('../src/models/Review');

test('the documented models compile and reject invalid core data', () => {
  const id = new mongoose.Types.ObjectId();
  assert.equal(new User({ name: 'A', email: 'a@example.com', password: 'hash' }).validateSync(), undefined);
  assert.ok(new User({ email: 'a@example.com' }).validateSync());
  assert.ok(new Vendor({ businessName: 'Studio', ownerName: 'A', email: 'a@example.com', password: 'hash', phone: '1', vendorType: 'invalid', address: { city: 'Pune' } }).validateSync());
  assert.ok(new Event({ userId: id, title: 'Party', eventType: 'Birthday', eventDate: new Date() }).validateSync());
  assert.ok(new Booking({ bookingType: 'single_service', userId: id, vendorId: id, eventDate: new Date(), eventLocation: { city: 'Pune' }, subtotal: -1, totalAmount: 0, pendingAmount: 0 }).validateSync());
  assert.ok(new Review({ userId: id, vendorId: id, bookingId: id, rating: 6 }).validateSync());
});
