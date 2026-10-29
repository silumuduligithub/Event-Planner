const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const env = require('../config/env');
const { connectDatabase } = require('../config/db');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Event = require('../models/Event');
const { vendors, events } = require('./demoData');

async function seed() {
  if (env.NODE_ENV === 'production') throw new Error('Seed is disabled in production');
  if (!process.env.SEED_PASSWORD || process.env.SEED_PASSWORD.length < 12) throw new Error('Set SEED_PASSWORD to at least 12 characters');
  await connectDatabase();
  const password = await bcrypt.hash(process.env.SEED_PASSWORD, 10);
  const user = await User.findOneAndUpdate({ email: 'demo.client@example.test' }, {
    $set: { password },
    $setOnInsert: { name: 'Demo Client', email: 'demo.client@example.test', city: 'Pune' },
  }, { upsert: true, new: true, runValidators: true });
  for (const vendor of vendors) {
    await Vendor.updateOne({ email: vendor.email }, { $set: { password }, $setOnInsert: vendor }, { upsert: true, runValidators: true });
    await Vendor.updateOne({ email: vendor.email, portfolioImages: { $size: 0 } }, { $set: { portfolioImages: vendor.portfolioImages } });
    await Vendor.updateOne({ email: vendor.email, $or: [{ supportedOccasionKeys: { $exists: false } }, { supportedOccasionKeys: { $size: 0 } }] }, { $set: { supportedOccasionKeys: vendor.supportedOccasionKeys } });
  }
  for (const event of events) {
    await Event.updateOne({ userId: user._id, title: event.title }, {
      $setOnInsert: { ...event, userId: user._id, eventDate: new Date(event.eventDate) },
    }, { upsert: true, runValidators: true });
  }
  console.log(`Seeded demo user, ${vendors.length} vendors, and ${events.length} events. Demo passwords were refreshed; existing catalog edits and events were preserved.`);
}

seed().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => mongoose.disconnect());
