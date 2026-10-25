# Database Schema & Data Models (MongoDB / Mongoose)

## 1. User Model (`models/User.js`)
Used for regular clients/customers who plan events and book vendors.
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  fcmToken: { type: String }, // For push notifications
  createdAt: { type: Date, default: Date.now }
}
```

---

## 2. Vendor Model (`models/Vendor.js`)
Used for event service providers (caterers, photographers, venue owners, decorators, etc.).
```javascript
{
  businessName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: [
      "Venue", 
      "Catering", 
      "Photography", 
      "Decoration", 
      "DJ & Music", 
      "Makeup & Styling", 
      "Planner", 
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
  startingPrice: { type: Number, default: 0 },
  services: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      description: { type: String }
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
Events created by users (Wedding, Birthday Party, Corporate Meetup, etc.).
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  eventType: { 
    type: String, 
    enum: ["Wedding", "Birthday", "Corporate", "Anniversary", "Concert", "Other"],
    required: true 
  },
  date: { type: Date, required: true },
  location: {
    city: { type: String },
    venueName: { type: String }
  },
  estimatedGuests: { type: Number, default: 0 },
  totalBudget: { type: Number, default: 0 },
  status: { type: String, enum: ["planning", "active", "completed", "cancelled"], default: "planning" },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 4. Booking Model (`models/Booking.js`)
Connects a User, an Event, and a Vendor.
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  servicePackage: {
    name: { type: String },
    price: { type: Number }
  },
  eventDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "rejected", "in_progress", "completed", "cancelled"], 
    default: "pending" 
  },
  quotedPrice: { type: Number, required: true },
  advancePaid: { type: Number, default: 0 },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 5. Review Model (`models/Review.js`)
Reviews given by users to vendors upon completion of bookings.
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
