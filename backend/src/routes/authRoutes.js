const router = require('express').Router();
const { z } = require('zod');
const validate = require('../middleware/validate');
const controller = require('../controllers/authController');

const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const password = z.string().min(8).max(128);
const loginSchema = z.object({ email, password }).strict();
const userSchema = loginSchema.extend({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(30).optional(),
  city: z.string().trim().max(100).optional(),
}).strict();
const vendorSchema = loginSchema.extend({
  businessName: z.string().trim().min(1).max(150),
  ownerName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(30),
  vendorType: z.enum(['Event Planner', 'Photography', 'Videography', 'Catering', 'Venue', 'Decoration', 'DJ & Sound', 'Orchestra & Melody', 'Celebrity & Artist', 'Makeup & Styling', 'Other']),
  address: z.object({ city: z.string().trim().min(1), state: z.string().trim().optional(), pincode: z.string().trim().optional(), fullAddress: z.string().trim().optional() }).strict(),
}).strict();

router.post('/user/register', validate(userSchema), controller.registerUser);
router.post('/user/login', validate(loginSchema), controller.loginUser);
router.post('/vendor/register', validate(vendorSchema), controller.registerVendor);
router.post('/vendor/login', validate(loginSchema), controller.loginVendor);
module.exports = router;
