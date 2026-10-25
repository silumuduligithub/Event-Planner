const router = require('express').Router();
const { z } = require('zod');
const validate = require('../middleware/validate');
const { protectUser, protectVendor } = require('../middleware/authMiddleware');
const controller = require('../controllers/bookingController');

const id = z.string().regex(/^[a-f\d]{24}$/i);
const selection = z.object({ serviceId: id, quantity: z.number().int().min(1).max(100000) }).strict();
const artistSelection = z.object({ artistId: id }).strict();
const estimateSchema = z.object({
  vendorId: id,
  bookingType: z.enum(['full_event_package', 'single_service', 'orchestra_celebrity']),
  selectedServices: z.array(selection).max(100).default([]),
  selectedCelebrities: z.array(artistSelection).max(100).default([]),
}).strict();
const bookingSchema = estimateSchema.extend({
  eventId: id.optional(),
  eventDate: z.coerce.date().refine((date) => date.getTime() > Date.now(), 'Event date must be in the future'),
  eventTime: z.string().trim().max(100).optional(),
  eventLocation: z.object({ city: z.string().trim().min(1).max(100), address: z.string().trim().max(500).optional() }).strict(),
  userNotes: z.string().trim().max(2000).optional(),
}).strict();

router.post('/calculate-estimate', protectUser, validate(estimateSchema), controller.estimate);
router.post('/', protectUser, validate(bookingSchema), controller.createBooking);
router.get('/user', protectUser, controller.listUserBookings);
router.get('/vendor', protectVendor, controller.listVendorBookings);
router.patch('/:id/status', protectVendor, validate(z.object({ status: z.enum(['accepted', 'rejected', 'in_progress', 'completed', 'cancelled']) }).strict()), controller.updateStatus);
module.exports = router;
