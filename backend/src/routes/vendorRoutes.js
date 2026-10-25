const router = require('express').Router();
const { z } = require('zod');
const validate = require('../middleware/validate');
const { protectVendor } = require('../middleware/authMiddleware');
const controller = require('../controllers/vendorController');

const nonnegative = z.number().finite().nonnegative();
const service = z.object({
  _id: z.string().regex(/^[a-f\d]{24}$/i).optional(), name: z.string().trim().min(1),
  pricingType: z.enum(['fixed', 'per_plate', 'per_hour', 'per_day', 'per_event']),
  price: nonnegative, description: z.string().max(2000).optional(), isOptional: z.boolean().optional(),
}).strict();
const artist = z.object({
  _id: z.string().regex(/^[a-f\d]{24}$/i).optional(), name: z.string().trim().min(1),
  roleOrSkill: z.string().optional(), pricePerPerformance: nonnegative,
  photo: z.string().url().optional(), sampleAudioVideoUrl: z.string().url().optional(),
  bio: z.string().max(2000).optional(), isAvailable: z.boolean().optional(),
}).strict();
const updateSchema = z.object({
  businessName: z.string().trim().min(1).optional(), ownerName: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(), description: z.string().max(5000).optional(),
  address: z.object({ city: z.string().trim().min(1), state: z.string().optional(), pincode: z.string().optional(), fullAddress: z.string().optional() }).strict().optional(),
  portfolioImages: z.array(z.string().url()).max(50).optional(), videoLinks: z.array(z.string().url()).max(50).optional(),
  startingPrice: nonnegative.optional(), services: z.array(service).max(100).optional(),
  artistsOrCelebrities: z.array(artist).max(100).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, 'At least one field is required');
const querySchema = z.object({
  category: z.string().optional(), vendorType: z.string().optional(), city: z.string().max(100).optional(),
  search: z.string().max(100).optional(), minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(), page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
}).strict().refine((q) => q.minPrice === undefined || q.maxPrice === undefined || q.minPrice <= q.maxPrice, 'Invalid price range');

router.get('/', validate(querySchema, 'query'), controller.listVendors);
router.put('/profile', protectVendor, validate(updateSchema), controller.updateProfile);
router.get('/:id', controller.getVendor);
module.exports = router;
