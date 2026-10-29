const image = (name) => `/demo-media/${name}.png`;
const occasionCoverage = {
  'Event Planner': ['wedding', 'engagement', 'birthday', 'anniversary', 'corporate', 'cultural'],
  Photography: ['wedding', 'engagement', 'birthday', 'anniversary', 'corporate'],
  Videography: ['wedding', 'engagement', 'birthday', 'corporate', 'concert'],
  Catering: ['wedding', 'engagement', 'birthday', 'anniversary', 'corporate', 'cultural'],
  Venue: ['wedding', 'engagement', 'birthday', 'anniversary', 'corporate', 'cultural'],
  Decoration: ['wedding', 'engagement', 'birthday', 'anniversary', 'corporate'],
  'DJ & Sound': ['wedding', 'engagement', 'birthday', 'anniversary', 'concert'],
  'Orchestra & Melody': ['wedding', 'engagement', 'anniversary', 'concert', 'cultural'],
  'Celebrity & Artist': ['wedding', 'engagement', 'birthday', 'corporate', 'concert'],
  'Makeup & Styling': ['wedding', 'engagement', 'birthday', 'anniversary'],
  Other: ['wedding', 'engagement', 'birthday', 'anniversary', 'corporate', 'concert', 'cultural'],
};

const vendors = [
  {
    businessName: 'Amber Events', ownerName: 'Ananya Rao', email: 'planner@example.test', phone: '9000000001',
    vendorType: 'Event Planner', address: { city: 'Pune', state: 'Maharashtra' }, startingPrice: 35000,
    description: 'Wedding, birthday and corporate planning with modular decor, catering and lighting.',
    portfolioImages: [image('wedding-hero'), image('reception')],
    services: [
      { name: 'Event Planning', pricingType: 'per_event', price: 35000, description: 'Planning and on-site coordination.' },
      { name: 'Stage Decor', pricingType: 'fixed', price: 35000 },
      { name: 'Catering Buffet', pricingType: 'per_plate', price: 850 },
      { name: 'Event Lighting', pricingType: 'per_hour', price: 2500 },
    ],
  },
  {
    businessName: 'Frame & Light Studio', ownerName: 'Kabir Shah', email: 'camera@example.test', phone: '9000000002',
    vendorType: 'Photography', address: { city: 'Pune', state: 'Maharashtra' }, startingPrice: 12000,
    description: 'Candid portraits and full-day event photography for celebrations of every size.',
    portfolioImages: [image('celebration'), image('wedding-hero')],
    services: [
      { name: 'Candid Photographer', pricingType: 'per_day', price: 12000 },
      { name: 'Photo Album', pricingType: 'fixed', price: 8000 },
    ],
  },
  {
    businessName: 'Swar Ensemble', ownerName: 'Meera Iyer', email: 'orchestra@example.test', phone: '9000000003',
    vendorType: 'Orchestra & Melody', address: { city: 'Mumbai', state: 'Maharashtra' }, startingPrice: 80000,
    description: 'Live orchestra, acoustic sets and featured vocalists for concerts and receptions.',
    portfolioImages: [image('celebration'), image('reception')],
    services: [
      { name: 'Full Orchestra Troupe', pricingType: 'per_event', price: 80000 },
      { name: 'Acoustic Trio', pricingType: 'per_event', price: 30000 },
    ],
    artistsOrCelebrities: [
      { name: 'Meera Iyer', roleOrSkill: 'Lead Vocalist', pricePerPerformance: 25000, bio: 'Sample artist for booking flow tests.' },
      { name: 'Arjun Sen', roleOrSkill: 'Singer', pricePerPerformance: 40000, bio: 'Sample artist for booking flow tests.' },
    ],
  },
  {
    businessName: 'Motion Story Films', ownerName: 'Riya Desai', email: 'video@example.test', phone: '9000000004',
    vendorType: 'Videography', address: { city: 'Mumbai', state: 'Maharashtra' }, startingPrice: 22000,
    description: 'Event films, short highlights and multicamera coverage.',
    portfolioImages: [image('wedding-hero'), image('celebration')],
    services: [
      { name: 'Event Videography', pricingType: 'per_day', price: 22000 },
      { name: 'Highlight Film', pricingType: 'fixed', price: 14000 },
    ],
  },
  {
    businessName: 'Saffron Table Catering', ownerName: 'Farah Khan', email: 'catering@example.test', phone: '9000000005',
    vendorType: 'Catering', address: { city: 'Pune', state: 'Maharashtra' }, startingPrice: 650,
    description: 'Vegetarian and mixed menus with live counters for private and corporate events.',
    portfolioImages: [image('floral-table'), image('reception')],
    services: [
      { name: 'Vegetarian Buffet', pricingType: 'per_plate', price: 650 },
      { name: 'Mixed Buffet', pricingType: 'per_plate', price: 950 },
      { name: 'Live Dessert Counter', pricingType: 'per_event', price: 12000 },
    ],
  },
  {
    businessName: 'The Garden Pavilion', ownerName: 'Dev Menon', email: 'venue@example.test', phone: '9000000006',
    vendorType: 'Venue', address: { city: 'Pune', state: 'Maharashtra' }, startingPrice: 75000,
    description: 'Garden lawn and indoor hall for weddings, birthdays and company gatherings.',
    portfolioImages: [image('reception'), image('wedding-hero')],
    services: [
      { name: 'Garden Lawn', pricingType: 'per_day', price: 75000 },
      { name: 'Indoor Hall', pricingType: 'per_day', price: 60000 },
    ],
  },
  {
    businessName: 'Petal & Light Decor', ownerName: 'Nisha Patil', email: 'decor@example.test', phone: '9000000007',
    vendorType: 'Decoration', address: { city: 'Pune', state: 'Maharashtra' }, startingPrice: 18000,
    description: 'Floral backdrops, table settings and ceremony stages.',
    portfolioImages: [image('floral-table'), image('reception')],
    services: [
      { name: 'Floral Backdrop', pricingType: 'fixed', price: 18000 },
      { name: 'Table Styling', pricingType: 'fixed', price: 12000 },
    ],
  },
  {
    businessName: 'Pulse DJ & Sound', ownerName: 'Aman Kapoor', email: 'dj@example.test', phone: '9000000008',
    vendorType: 'DJ & Sound', address: { city: 'Mumbai', state: 'Maharashtra' }, startingPrice: 20000,
    description: 'DJ sets, sound systems and event lighting for parties and concerts.',
    portfolioImages: [image('celebration'), image('reception')],
    services: [
      { name: 'DJ Set', pricingType: 'per_event', price: 20000 },
      { name: 'PA System', pricingType: 'per_day', price: 12000 },
      { name: 'Dance Floor Lighting', pricingType: 'per_hour', price: 3000 },
    ],
  },
  {
    businessName: 'Spotlight Artists', ownerName: 'Tara Singh', email: 'artist@example.test', phone: '9000000009',
    vendorType: 'Celebrity & Artist', address: { city: 'Mumbai', state: 'Maharashtra' }, startingPrice: 25000,
    description: 'Hosts, dancers and live performers for celebrations and launches.',
    portfolioImages: [image('celebration'), image('wedding-hero')],
    services: [{ name: 'Artist Booking Coordination', pricingType: 'per_event', price: 25000 }],
    artistsOrCelebrities: [
      { name: 'Tara Singh', roleOrSkill: 'Event Host', pricePerPerformance: 30000, bio: 'Sample host for booking flow tests.' },
      { name: 'Zoya Malik', roleOrSkill: 'Dancer', pricePerPerformance: 45000, bio: 'Sample performer for booking flow tests.' },
    ],
  },
  {
    businessName: 'Blush Bridal Studio', ownerName: 'Pooja Kulkarni', email: 'makeup@example.test', phone: '9000000010',
    vendorType: 'Makeup & Styling', address: { city: 'Pune', state: 'Maharashtra' }, startingPrice: 9000,
    description: 'Bridal makeup, party styling and mehendi appointments.',
    portfolioImages: [image('wedding-hero'), image('floral-table')],
    services: [
      { name: 'Bridal Makeup', pricingType: 'fixed', price: 18000 },
      { name: 'Party Makeup', pricingType: 'fixed', price: 9000 },
      { name: 'Mehendi Artist', pricingType: 'per_hour', price: 2500 },
    ],
  },
  {
    businessName: 'Seamless Event Crew', ownerName: 'Rohit Naik', email: 'crew@example.test', phone: '9000000011',
    vendorType: 'Other', address: { city: 'Pune', state: 'Maharashtra' }, startingPrice: 3500,
    description: 'Event support staff, guest check-in and valet coordination.',
    portfolioImages: [image('reception'), image('celebration')],
    services: [
      { name: 'Event Coordinator', pricingType: 'per_day', price: 6000 },
      { name: 'Guest Check-in Staff', pricingType: 'per_day', price: 3500 },
      { name: 'Valet Team', pricingType: 'per_event', price: 12000 },
    ],
  },
];

const events = [
  { title: 'Demo Wedding', eventType: 'Wedding', eventDate: '2027-02-14T12:00:00Z', location: { city: 'Pune', venueName: 'The Garden Pavilion' }, estimatedGuests: 200, totalBudget: 500000, checklist: [{ title: 'Confirm venue' }, { title: 'Compare caterers' }, { title: 'Book photography' }] },
  { title: 'Demo Birthday', eventType: 'Birthday', eventDate: '2027-03-20T12:00:00Z', location: { city: 'Pune', venueName: 'Garden Lawn' }, estimatedGuests: 60, totalBudget: 90000, checklist: [{ title: 'Choose cake and menu' }, { title: 'Book DJ' }] },
  { title: 'Demo Corporate Launch', eventType: 'Corporate', eventDate: '2027-04-17T10:00:00Z', location: { city: 'Mumbai', venueName: 'City Conference Hall' }, estimatedGuests: 150, totalBudget: 300000, checklist: [{ title: 'Confirm AV requirements' }, { title: 'Arrange guest check-in' }] },
  { title: 'Demo Anniversary', eventType: 'Anniversary', eventDate: '2027-05-08T18:00:00Z', location: { city: 'Pune', venueName: 'Indoor Hall' }, estimatedGuests: 80, totalBudget: 120000, checklist: [{ title: 'Select flowers' }, { title: 'Book photographer' }] },
  { title: 'Demo Concert', eventType: 'Concert', eventDate: '2027-06-12T18:00:00Z', location: { city: 'Mumbai', venueName: 'Open Air Stage' }, estimatedGuests: 500, totalBudget: 800000, checklist: [{ title: 'Confirm performers' }, { title: 'Book sound system' }] },
  { title: 'Demo Cultural Festival', eventType: 'Cultural', eventDate: '2027-07-10T12:00:00Z', location: { city: 'Pune', venueName: 'Community Grounds' }, estimatedGuests: 300, totalBudget: 350000, checklist: [{ title: 'Plan stage program' }, { title: 'Arrange catering' }] },
  { title: 'Demo Community Gathering', eventType: 'Other', eventDate: '2027-08-21T12:00:00Z', location: { city: 'Pune', venueName: 'Garden Lawn' }, estimatedGuests: 100, totalBudget: 110000, checklist: [{ title: 'Confirm venue' }, { title: 'Arrange support staff' }] },
];

for (const vendor of vendors) vendor.supportedOccasionKeys = occasionCoverage[vendor.vendorType];

module.exports = { vendors, events };
