const test = require('node:test');
const assert = require('node:assert/strict');

test('auth, catalog, estimates, booking workflow, and event ownership', { skip: !process.env.TEST_MONGO_URI }, async () => {
  process.env.MONGODB_URI = process.env.TEST_MONGO_URI;
  process.env.JWT_SECRET = 'test-only-secret-at-least-32-characters-long';
  process.env.CORS_ORIGINS = 'http://localhost:8081';
  process.env.GOOGLE_CLIENT_IDS = '';
  process.env.APPLE_CLIENT_ID = '';
  process.env.SMTP_HOST = '';
  process.env.SMTP_USER = '';
  process.env.SMTP_PASSWORD = '';
  process.env.SMTP_FROM = '';
  const mongoose = require('mongoose');
  const app = require('../src/app');
  const User = require('../src/models/User');
  await mongoose.connect(process.env.TEST_MONGO_URI);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (method, path, body, token) => {
    const response = await fetch(`${base}${path}`, {
      method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: response.status, body: await response.json() };
  };
  try {
    const user = await call('POST', '/api/auth/user/register', { name: 'Client', email: 'client@example.test', password: 'secure-pass-123' });
    assert.equal(user.status, 201);
    assert.equal((await call('POST', '/api/auth/user/google', { identityToken: 'a'.repeat(24) })).status, 503);
    assert.equal((await call('POST', '/api/auth/user/apple', { identityToken: 'a'.repeat(24), nonce: 'b'.repeat(24) })).status, 503);
    assert.equal((await call('POST', '/api/auth/user/forgot-password', { email: 'client@example.test' })).status, 503);
    assert.equal((await call('POST', '/api/auth/user/reset-password', { token: 'a'.repeat(64), password: 'new-password-123' })).status, 400);
    const resetToken = 'b'.repeat(64);
    const resetHash = require('node:crypto').createHash('sha256').update(resetToken).digest('hex');
    await User.updateOne({ email: 'client@example.test' }, { $set: { resetPasswordHash: resetHash, resetPasswordExpiresAt: new Date(Date.now() + 60000) } });
    assert.equal((await call('POST', '/api/auth/user/reset-password', { token: resetToken, password: 'new-password-123' })).status, 200);
    assert.equal((await call('POST', '/api/auth/user/reset-password', { token: resetToken, password: 'new-password-123' })).status, 400);
    assert.equal((await call('POST', '/api/auth/user/login', { email: 'client@example.test', password: 'secure-pass-123' })).status, 401);
    assert.equal(user.body.data.account.password, undefined);
    const storedUser = await User.findOne({ email: 'client@example.test' }).select('+password');
    assert.notEqual(storedUser.password, 'secure-pass-123');
    assert.match(storedUser.password, /^\$2[aby]\$10\$/);
    const vendor = await call('POST', '/api/auth/vendor/register', {
      businessName: 'The Band', ownerName: 'Owner', email: 'band@example.test', password: 'secure-pass-123', phone: '1234567890',
      vendorType: 'Orchestra & Melody', address: { city: 'Pune' },
    });
    assert.equal(vendor.status, 201);
    const userToken = user.body.data.token;
    const vendorToken = vendor.body.data.token;
    assert.equal((await call('GET', '/api/bookings/user')).status, 401);
    assert.equal((await call('GET', '/api/bookings/vendor', null, userToken)).status, 403);
    const login = await call('POST', '/api/auth/user/login', { email: 'client@example.test', password: 'new-password-123' });
    assert.equal(login.status, 200);
    const profile = await call('PUT', '/api/vendors/profile', {
      startingPrice: 80000, services: [{ name: 'Orchestra', pricingType: 'per_event', price: 80000 }],
      artistsOrCelebrities: [{ name: 'Lead Singer', pricePerPerformance: 25000 }],
      supportedOccasionKeys: ['Wedding', 'Ring Ceremony'], acceptsCustomOccasions: true,
    }, vendorToken);
    assert.equal(profile.status, 200);
    const vendorId = profile.body.data._id;
    assert.equal((await call('PATCH', '/api/users/me', { city: 'Pune' }, userToken)).body.data.city, 'Pune');
    assert.equal((await call('PUT', `/api/users/me/saved-vendors/${vendorId}`, null, userToken)).body.data.length, 1);
    assert.equal((await call('GET', '/api/users/me/saved-vendors', null, userToken)).body.data[0]._id, vendorId);
    const serviceId = profile.body.data.services[0]._id;
    const artistId = profile.body.data.artistsOrCelebrities[0]._id;
    const catalog = await call('GET', '/api/vendors?city=Pune&minPrice=80000');
    assert.equal(catalog.status, 200);
    assert.equal(catalog.body.data.total, 1);
    const ringVendors = await call('GET', '/api/vendors?occasion=Engagement&city=Pune');
    assert.equal(ringVendors.status, 200);
    assert.equal(ringVendors.body.data.total, 1);
    assert.equal((await call('GET', '/api/vendors?search=Ring%20Ceremony%20Event&city=Pune')).body.data.total, 1);
    assert.equal((await call('GET', '/api/vendors?occasion=School%20Function&city=Pune')).body.data.total, 1);
    assert.equal((await call('GET', `/api/vendors/${vendorId}`)).body.data.password, undefined);
    const selection = { vendorId, bookingType: 'orchestra_celebrity', selectedServices: [{ serviceId, quantity: 1, requirements: { requests: 'Acoustic opening set' } }], selectedCelebrities: [{ artistId, requirements: { start: '18:00', requests: 'Marathi songs' } }] };
    const estimate = await call('POST', '/api/bookings/calculate-estimate', selection, userToken);
    assert.equal(estimate.status, 200);
    assert.equal(estimate.body.data.subtotal, 105000);
    assert.equal(estimate.body.data.advanceAmount, 21000);
    assert.match(estimate.body.data.quoteFingerprint, /^[a-f\d]{64}$/);
    assert.equal((await call('POST', '/api/bookings/calculate-estimate', { ...selection, selectedServices: [{ serviceId, quantity: 1, unitPrice: 1 }] }, userToken)).status, 400);
    assert.equal((await call('POST', '/api/bookings/calculate-estimate', { ...selection, selectedServices: [{ serviceId, quantity: 2 }] }, userToken)).status, 400);
    const event = await call('POST', '/api/events', { title: 'Concert', eventType: 'Concert', eventDate: '2027-06-01T12:00:00.000Z', location: { city: 'Pune' } }, userToken);
    assert.equal(event.status, 201);
    const customEvent = await call('POST', '/api/events', { title: 'Family Ring Ceremony', eventType: 'Ring Ceremony', eventDate: '2027-08-01T12:00:00.000Z', location: { city: 'Pune' } }, userToken);
    assert.equal(customEvent.status, 201);
    assert.equal(customEvent.body.data.occasionKey, 'engagement');
    assert.equal(customEvent.body.data.eventType, 'Ring Ceremony');
    const checklist = await call('POST', `/api/events/${event.body.data._id}/checklist`, { title: 'Confirm venue' }, userToken);
    assert.equal(checklist.status, 201);
    const itemId = checklist.body.data.checklist[0]._id;
    assert.equal((await call('PATCH', `/api/events/${event.body.data._id}/checklist/${itemId}`, { completed: true }, userToken)).body.data.checklist[0].completed, true);
    const requestKey = '1f570e7d-4f84-4d2c-9e92-44d8a57cf6e2';
    const bookingInput = { ...selection, eventId: event.body.data._id, eventDate: '2027-06-01T12:00:00.000Z', eventLocation: { city: 'Pune' }, requestKey, expectedQuoteFingerprint: estimate.body.data.quoteFingerprint };
    assert.equal((await call('POST', '/api/bookings', { ...bookingInput, eventLocation: { city: 'Mumbai' } }, userToken)).status, 400);
    assert.equal((await call('PUT', '/api/vendors/profile', { services: [{ _id: serviceId, name: 'Orchestra', pricingType: 'per_event', price: 90000 }] }, vendorToken)).status, 200);
    const changedPrice = await call('POST', '/api/bookings', bookingInput, userToken);
    assert.equal(changedPrice.status, 409);
    assert.equal(changedPrice.body.data.totalAmount, 115000);
    assert.equal((await call('PUT', '/api/vendors/profile', { services: [{ _id: serviceId, name: 'Orchestra', pricingType: 'per_event', price: 80000 }] }, vendorToken)).status, 200);
    const booking = await call('POST', '/api/bookings', bookingInput, userToken);
    assert.equal(booking.status, 201);
    const retry = await call('POST', '/api/bookings', bookingInput, userToken);
    assert.equal(retry.status, 200);
    assert.equal(retry.body.data._id, booking.body.data._id);
    assert.equal((await call('POST', '/api/bookings', { ...bookingInput, userNotes: 'Changed request' }, userToken)).status, 409);
    assert.equal(booking.body.data.totalAmount, 105000);
    assert.equal(booking.body.data.selectedServices[0].requirements.requests, 'Acoustic opening set');
    assert.equal(booking.body.data.selectedCelebrities[0].requirements.start, '18:00');
    assert.equal((await call('GET', '/api/bookings/vendor', null, vendorToken)).body.data.length, 1);
    assert.equal((await call('PATCH', `/api/bookings/${booking.body.data._id}/status`, { status: 'accepted' }, vendorToken)).status, 200);
    assert.equal((await call('GET', `/api/bookings/user/${booking.body.data._id}`, null, userToken)).body.data.vendorId.businessName, 'The Band');
    assert.equal((await call('POST', `/api/vendors/${vendorId}/reviews`, { bookingId: booking.body.data._id, rating: 5 }, userToken)).status, 403);
    assert.equal((await call('PATCH', `/api/bookings/${booking.body.data._id}/status`, { status: 'in_progress' }, vendorToken)).status, 200);
    assert.equal((await call('PATCH', `/api/bookings/${booking.body.data._id}/status`, { status: 'completed' }, vendorToken)).status, 200);
    assert.equal((await call('POST', `/api/vendors/${vendorId}/reviews`, { bookingId: booking.body.data._id, rating: 5, comment: 'Excellent performance' }, userToken)).status, 201);
    assert.equal((await call('GET', `/api/vendors/${vendorId}/reviews`)).body.data.total, 1);
    const secondBooking = await call('POST', '/api/bookings', { ...selection, eventDate: '2027-06-01T12:00:00.000Z', eventLocation: { city: 'Pune' } }, userToken);
    assert.equal((await call('PATCH', `/api/bookings/user/${secondBooking.body.data._id}/cancel`, null, userToken)).body.data.status, 'cancelled');
    assert.equal((await call('DELETE', `/api/users/me/saved-vendors/${vendorId}`, null, userToken)).body.data.length, 0);
    assert.equal((await call('DELETE', `/api/events/${event.body.data._id}`, null, userToken)).status, 409);

    const expandedCatalog = await call('PUT', '/api/vendors/profile', { services: [
      { name: 'Buffet', pricingType: 'per_plate', price: 850 },
      { name: 'Stage Decor', pricingType: 'fixed', price: 35000 },
    ] }, vendorToken);
    assert.equal(expandedCatalog.status, 200);
    const [buffet, decor] = expandedCatalog.body.data.services;
    const multiple = { vendorId, bookingType: 'full_event_package', occasion: 'School Celebration', selectedCelebrities: [], selectedServices: [
      { serviceId: buffet._id, quantity: 60, requirements: { menu: ' Vegetarian ', meal: 'Dinner', requests: 'Nut-free options' } },
      { serviceId: decor._id, quantity: 1, requirements: { theme: 'Galaxy blue', area: 'Indoor' } },
    ] };
    const customEstimate = await call('POST', '/api/bookings/calculate-estimate', multiple, userToken);
    assert.equal(customEstimate.status, 200);
    assert.equal(customEstimate.body.data.subtotal, 86000);
    assert.equal(customEstimate.body.data.selectedServices[0].requirements.menu, 'Vegetarian');
    assert.equal(customEstimate.body.data.selectedServices[1].requirements.theme, 'Galaxy blue');
    const malformed = (requirements) => ({ ...multiple, selectedServices: [{ serviceId: buffet._id, quantity: 60, requirements }] });
    for (const requirements of [{ unknown: 'value' }, { requests: 42 }, { requests: 'x'.repeat(501) }, { start: '25:00' }]) {
      assert.equal((await call('POST', '/api/bookings/calculate-estimate', malformed(requirements), userToken)).status, 400);
    }
    const configuredInput = { ...multiple, requestKey: 'f3d34248-1d13-4ec5-87eb-7e60428c70a8', expectedQuoteFingerprint: customEstimate.body.data.quoteFingerprint,
      eventDate: '2027-09-01T12:00:00.000Z', eventLocation: { city: 'Pune' }, userNotes: 'Please confirm the final menu.' };
    const configured = await call('POST', '/api/bookings', configuredInput, userToken);
    assert.equal(configured.status, 201);
    assert.equal(configured.body.data.eventId, undefined); // multiple services need no event container
    assert.equal(configured.body.data.occasion, 'School Celebration');
    assert.equal(configured.body.data.selectedServices[0].requirements.requests, 'Nut-free options');
    const stored = await call('GET', `/api/bookings/user/${configured.body.data._id}`, null, userToken);
    assert.equal(stored.body.data.selectedServices[1].requirements.theme, 'Galaxy blue');
    const vendorLeads = await call('GET', '/api/bookings/vendor', null, vendorToken);
    assert.equal(vendorLeads.body.data.find(item => item._id === configured.body.data._id).selectedServices[0].requirements.menu, 'Vegetarian');
    assert.equal((await call('POST', '/api/bookings', configuredInput, userToken)).body.data._id, configured.body.data._id);
    const edited = { ...configuredInput, selectedServices: [{ ...multiple.selectedServices[0], requirements: { menu: 'Mixed menu' } }, multiple.selectedServices[1]] };
    assert.equal((await call('POST', '/api/bookings', edited, userToken)).status, 409);
    const needsReview = await call('POST', '/api/bookings', { ...edited, requestKey: '1a2b3c4d-1d13-4ec5-87eb-7e60428c70a8' }, userToken);
    assert.equal(needsReview.status, 409);
    assert.notEqual(needsReview.body.data.quoteFingerprint, customEstimate.body.data.quoteFingerprint);
    assert.equal(needsReview.body.data.selectedServices[0].requirements.menu, 'Mixed menu');
    const otherUser = await call('POST', '/api/auth/user/register', { name: 'Other client', email: 'other@example.test', password: 'secure-pass-123' });
    assert.equal((await call('GET', `/api/bookings/user/${configured.body.data._id}`, null, otherUser.body.data.token)).status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});
