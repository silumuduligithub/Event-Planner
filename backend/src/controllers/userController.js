const service = require('../services/userService');
const { asyncHandler, ok } = require('../utils/http');
const { publicVendor } = require('../utils/demoMedia');

const getMe = asyncHandler(async (req, res) => ok(res, 'Account retrieved', await service.getAccount(req.auth.id)));
const updateMe = asyncHandler(async (req, res) => ok(res, 'Account updated', await service.updateAccount(req.auth.id, req.body)));
const listSaved = asyncHandler(async (req, res) => ok(res, 'Saved vendors retrieved', (await service.listSaved(req.auth.id)).map((vendor) => publicVendor(req, vendor))));
const saveVendor = asyncHandler(async (req, res) => ok(res, 'Vendor saved', (await service.saveVendor(req.auth.id, req.params.vendorId)).map((vendor) => publicVendor(req, vendor))));
const unsaveVendor = asyncHandler(async (req, res) => ok(res, 'Vendor removed', (await service.unsaveVendor(req.auth.id, req.params.vendorId)).map((vendor) => publicVendor(req, vendor))));
module.exports = { getMe, updateMe, listSaved, saveVendor, unsaveVendor };
