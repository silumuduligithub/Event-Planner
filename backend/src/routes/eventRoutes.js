const router = require('express').Router();
const { z } = require('zod');
const validate = require('../middleware/validate');
const { protectUser } = require('../middleware/authMiddleware');
const controller = require('../controllers/eventController');

const shape = {
  title: z.string().trim().min(1).max(150),
  eventType: z.enum(['Wedding', 'Birthday', 'Corporate', 'Anniversary', 'Concert', 'Cultural', 'Other']),
  eventDate: z.coerce.date(),
  location: z.object({ city: z.string().trim().min(1).max(100), venueName: z.string().trim().max(150).optional() }).strict(),
  estimatedGuests: z.number().int().nonnegative(),
  totalBudget: z.number().finite().nonnegative(),
  status: z.enum(['planning', 'active', 'completed', 'cancelled']),
};
const createSchema = z.object({
  title: shape.title, eventType: shape.eventType, eventDate: shape.eventDate, location: shape.location,
  estimatedGuests: shape.estimatedGuests.optional(), totalBudget: shape.totalBudget.optional(),
}).strict();
const updateSchema = z.object(shape).partial().strict().refine((value) => Object.keys(value).length > 0, 'At least one field is required');

router.use(protectUser);
router.post('/', validate(createSchema), controller.createEvent);
router.get('/', controller.listEvents);
router.get('/:id', controller.getEvent);
router.put('/:id', validate(updateSchema), controller.updateEvent);
router.delete('/:id', controller.deleteEvent);
module.exports = router;
