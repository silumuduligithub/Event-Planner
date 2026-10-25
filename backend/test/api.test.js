const test = require('node:test');
const assert = require('node:assert/strict');

test('auth, catalog, estimates, booking workflow, and event ownership', { skip: !process.env.TEST_MONGO_URI }, async () => {
  process.env.MONGODB_URI = process.env.TEST_MONGO_URI;
  process.env.JWT_SECRET = 'test-only-secret-at-least-32-characters-long';
  process.env.CORS_ORIGINS = 'http://localhost:8081';
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
    const login = await call('POST', '/api/auth/user/login', { email: 'client@example.test', password: 'secure-pass-123' });
    assert.equal(login.status, 200);
    const profile = await call('PUT', '/api/vendors/profile', {
      startingPrice: 80000, services: [{ name: 'Orchestra', pricingType: 'per_event', price: 80000 }],
      artistsOrCelebrities: [{ name: 'Lead Singer', pricePerPerformance: 25000 }],
    }, vendorToken);
    assert.equal(profile.status, 200);
    const vendorId = profile.body.data._id;
    const serviceId = profile.body.data.services[0]._id;
    const artistId = profile.body.data.artistsOrCelebrities[0]._id;
    const catalog = await call('GET', '/api/vendors?city=Pune&minPrice=80000');
    assert.equal(catalog.status, 200);
    assert.equal(catalog.body.data.total, 1);
    assert.equal((await call('GET', `/api/vendors/${vendorId}`)).body.data.password, undefined);
    const selection = { vendorId, bookingType: 'orchestra_celebrity', selectedServices: [{ serviceId, quantity: 1 }], selectedCelebrities: [{ artistId }] };
    const estimate = await call('POST', '/api/bookings/calculate-estimate', selection, userToken);
    assert.equal(estimate.status, 200);
    assert.equal(estimate.body.data.subtotal, 105000);
    assert.equal(estimate.body.data.advanceAmount, 21000);
    assert.equal((await call('POST', '/api/bookings/calculate-estimate', { ...selection, selectedServices: [{ serviceId, quantity: 1, unitPrice: 1 }] }, userToken)).status, 400);
    assert.equal((await call('POST', '/api/bookings/calculate-estimate', { ...selection, selectedServices: [{ serviceId, quantity: 2 }] }, userToken)).status, 400);
    const event = await call('POST', '/api/events', { title: 'Concert', eventType: 'Concert', eventDate: '2027-06-01T12:00:00.000Z', location: { city: 'Pune' } }, userToken);
    assert.equal(event.status, 201);
    const booking = await call('POST', '/api/bookings', { ...selection, eventId: event.body.data._id, eventDate: '2027-06-01T12:00:00.000Z', eventLocation: { city: 'Pune' } }, userToken);
    assert.equal(booking.status, 201);
    assert.equal(booking.body.data.totalAmount, 105000);
    assert.equal((await call('GET', '/api/bookings/vendor', null, vendorToken)).body.data.length, 1);
    assert.equal((await call('PATCH', `/api/bookings/${booking.body.data._id}/status`, { status: 'accepted' }, vendorToken)).status, 200);
    assert.equal((await call('DELETE', `/api/events/${event.body.data._id}`, null, userToken)).status, 409);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});
