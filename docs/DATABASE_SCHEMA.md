# Database Schema & Data Models (MongoDB / Mongoose)

## 1. User Model (`models/User.js`)
Used for clients/customers planning events or booking individual services.
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function () { return !this.googleSub && !this.appleSub; }, select: false },
  googleSub: { type: String, unique: true, sparse: true, select: false },
  appleSub: { type: String, unique: true, sparse: true, select: false },
  resetPasswordHash: { type: String, select: false },
  resetPasswordExpiresAt: { type: Date, select: false },
  resetPasswordSentAt: { type: Date, select: false },
  savedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }],
  phone: { type: String },
  city: { type: String },
  avatar: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  fcmToken: { type: String },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 2. Vendor Model (`models/Vendor.js`)
Service providers, event planners, photographers, caterers, orchestra/melody troupes, and celebrity managers.
```javascript
{
  businessName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  vendorType: { 
    type: String, 
    required: true,
    enum: [
      "Event Planner",       // Full event organizer (Wedding, Birthday, etc.)
      "Photography",         // Standalone cameraman/photographer
      "Videography",
      "Catering",
      "Venue",
      "Decoration",
      "DJ & Sound",
      "Orchestra & Melody",  // Band, orchestra troupe, live music
      "Celebrity & Artist",  // Singers, actors, anchors, comedians
      "Makeup & Styling",
      "Other"
    ]
  },
  description: { type: String },
  address: {
    city: { type: String, required: true },
    state: { type: String },
    pincode: { type: String },
    fullAddress: { type: String }
  },
  portfolioImages: [{ type: String }],
  videoLinks: [{ type: String }],
  startingPrice: { type: Number, default: 0 },
  supportedOccasionKeys: [{ type: String }], // e.g. wedding, engagement; normalized aliases
  acceptsCustomOccasions: { type: Boolean, default: true },
  
  // Dynamic Services Offered (Can be selected individually by user)
  services: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      name: { type: String, required: true }, // e.g. "Candid Photography", "Catering Buffet", "Stage Light Setup"
      pricingType: { 
        type: String, 
        enum: ["fixed", "per_plate", "per_hour", "per_day", "per_event"], 
        default: "fixed" 
      },
      price: { type: Number, required: true },
      description: { type: String },
      isOptional: { type: Boolean, default: true },
      occasionKeys: [{ type: String }] // optional; an empty list follows vendor coverage
    }
  ],

  // Artists, Band Members & Celebrities (Especially for Orchestra/Melody/Celebrity agency vendors)
  artistsOrCelebrities: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      name: { type: String, required: true }, // e.g., "Star Singer Rahul", "Lead Violinist"
      roleOrSkill: { type: String },           // e.g., "Playback Singer", "Anchor", "Lead Guitarist"
      pricePerPerformance: { type: Number, required: true },
      photo: { type: String },
      sampleAudioVideoUrl: { type: String },
      bio: { type: String },
      isAvailable: { type: Boolean, default: true }
    }
  ],

  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  fcmToken: { type: String },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 3. Event Model (`models/Event.js`)
Events created by a user (e.g. Wedding, Birthday Party).
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  eventType: { type: String, required: true, maxlength: 100 }, // preserves customer's exact occasion name
  occasionKey: { type: String }, // normalized for known aliases and discovery
  eventDate: { type: Date, required: true },
  location: {
    city: { type: String, required: true },
    venueName: { type: String }
  },
  estimatedGuests: { type: Number, default: 0 },
  totalBudget: { type: Number, default: 0 },
  checklist: [{ title: String, completed: Boolean, dueDate: Date }],
  status: { type: String, enum: ["planning", "active", "completed", "cancelled"], default: "planning" },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 4. Booking & Dynamic Estimate Model (`models/Booking.js`)
Supports:
1. Full Event Planner package with selected modular services
2. Standalone single service (e.g., Cameraman only)
3. Orchestra + Selected Celebrity / Artists
```javascript
{
  bookingType: { 
    type: String, 
    enum: ["full_event_package", "single_service", "orchestra_celebrity"], 
    required: true 
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  requestKey: { type: String }, // optional idempotency key, unique with userId
  requestHash: { type: String },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }, // Optional for single or multiple services
  occasion: { type: String, maxlength: 100 }, // Also supported without an event container
  
  // Selected modular services with customized quantities/price
  selectedServices: [
    {
      serviceId: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String, required: true },
      pricingType: { type: String },
      unitPrice: { type: Number, required: true },
      quantity: { type: Number, default: 1 }, // e.g. 200 plates, 5 hours, or 1 package
      totalPrice: { type: Number, required: true },
      requirements: { /* optional customer preference strings; see below */ }
    }
  ],

  // Selected specific artists or celebrities from the troupe
  selectedCelebrities: [
    {
      artistId: { type: mongoose.Schema.Types.ObjectId },
      name: { type: String },
      roleOrSkill: { type: String },
      price: { type: Number },
      requirements: { /* optional customer preference strings; see below */ }
    }
  ],

  eventDate: { type: Date, required: true },
  eventTime: { type: String }, // e.g., "18:00 - 23:00"
  eventLocation: {
    city: { type: String, required: true },
    address: { type: String }
  },

  // Dynamic Estimate Calculations
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  advanceAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, required: true },

  status: { 
    type: String, 
    enum: ["estimate_requested", "pending", "accepted", "rejected", "in_progress", "completed", "cancelled"], 
    default: "estimate_requested" 
  },
  userNotes: { type: String },
  vendorNotes: { type: String },
  createdAt: { type: Date, default: Date.now }
}
```

---

Booking selection `requirements` accepts only `menu`, `meal`, `requests`, `theme`, `area`, `setup`, `start`, `coverage`, `format`, `look`, and `layout`. Values are trimmed customer preference strings, at most 500 characters each; `start` must use 24-hour `HH:mm`. Empty strings are omitted. The estimate and booking snapshot retain these values for the customer and vendor. They do not change prices or promise vendor inclusions. Existing bookings without requirements remain readable.

## 5. Review Model (`models/Review.js`)
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
}
```
