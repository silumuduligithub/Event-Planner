const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const env = require('../config/env');
const { connectDatabase } = require('../config/db');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Event = require('../models/Event');

async function seed() {
  if (env.NODE_ENV === 'production') throw new Error('Seed is disabled in production');
  if (!process.env.SEED_PASSWORD || process.env.SEED_PASSWORD.length < 12) throw new Error('Set SEED_PASSWORD to at least 12 characters');
  await connectDatabase();
  const password = await bcrypt.hash(process.env.SEED_PASSWORD, 10);
  const user = await User.findOneAndUpdate({ email: 'demo.client@example.test' }, {
    $setOnInsert: { name: 'Demo Client', email: 'demo.client@example.test', password, city: 'Pune' },
  }, { upsert: true, new: true, runValidators: true });
  const vendors = [
    {
      businessName: 'Amber Events', ownerName: 'Ananya Rao', email: 'planner@example.test', phone: '9000000001',
      vendorType: 'Event Planner', address: { city: 'Pune', state: 'Maharashtra' }, startingPrice: 35000,
      description: 'Wedding and celebration planning with modular services.',
      services: [
        { name: 'Stage Decor', pricingType: 'fixed', price: 35000 },
        { name: 'Catering Buffet', pricingType: 'per_plate', price: 850 },
        { name: 'Event Lighting', pricingType: 'per_hour', price: 2500 },
      ],
    },
    {
      businessName: 'Frame & Light Studio', ownerName: 'Kabir Shah', email: 'camera@example.test', phone: '9000000002',
      vendorType: 'Photography', address: { city: 'Pune', state: 'Maharashtra' }, startingPrice: 12000,
      description: 'Standalone event photography and cinematic coverage.',
      services: [
        { name: 'Candid Photographer', pricingType: 'per_day', price: 12000 },
        { name: 'Cinematographer', pricingType: 'per_day', price: 18000 },
      ],
    },
    {
      businessName: 'Swar Ensemble', ownerName: 'Meera Iyer', email: 'orchestra@example.test', phone: '9000000003',
      vendorType: 'Orchestra & Melody', address: { city: 'Mumbai', state: 'Maharashtra' }, startingPrice: 80000,
      description: 'Live orchestra and featured vocalist performances.',
      services: [{ name: 'Full Orchestra Troupe', pricingType: 'per_event', price: 80000 }],
      artistsOrCelebrities: [
        { name: 'Meera Iyer', roleOrSkill: 'Lead Vocalist', pricePerPerformance: 25000 },
        { name: 'Arjun Sen', roleOrSkill: 'Playback Singer', pricePerPerformance: 40000 },
      ],
    },
  ];
  for (const vendor of vendors) {
    await Vendor.updateOne({ email: vendor.email }, { $setOnInsert: { ...vendor, password } }, { upsert: true, runValidators: true });
  }
  await Event.updateOne({ userId: user._id, title: 'Demo Wedding' }, {
    $setOnInsert: { userId: user._id, title: 'Demo Wedding', eventType: 'Wedding', eventDate: new Date('2027-02-14T12:00:00Z'), location: { city: 'Pune' }, estimatedGuests: 200, totalBudget: 500000 },
  }, { upsert: true, runValidators: true });
  console.log('Seeded demo user, three vendors, and one event. Existing records were preserved.');
}

seed().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => mongoose.disconnect());
