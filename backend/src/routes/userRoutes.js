const router = require('express').Router();
const { z } = require('zod');
const validate = require('../middleware/validate');
const { protectUser } = require('../middleware/authMiddleware');
const controller = require('../controllers/userController');
const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  phone: z.string().trim().max(30).optional(),
  city: z.string().trim().max(100).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, 'At least one field is required');
router.use(protectUser);
router.get('/me', controller.getMe);
router.patch('/me', validate(updateSchema), controller.updateMe);
router.get('/me/saved-vendors', controller.listSaved);
router.put('/me/saved-vendors/:vendorId', controller.saveVendor);
router.delete('/me/saved-vendors/:vendorId', controller.unsaveVendor);
module.exports = router;
