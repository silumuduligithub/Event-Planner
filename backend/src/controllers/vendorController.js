const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
const { HttpError, asyncHandler, ok } = require('../utils/http');

const publicFields = '-password -fcmToken';

const listVendors = asyncHandler(async (req, res) => {
  const { category, vendorType, city, minPrice, maxPrice, search, page, limit } = req.query;
  const filter = {};
  if (vendorType || category) filter.vendorType = vendorType || category;
  if (city) filter['address.city'] = new RegExp(`^${escapeRegex(city)}$`, 'i');
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.startingPrice = {};
    if (minPrice !== undefined) filter.startingPrice.$gte = minPrice;
    if (maxPrice !== undefined) filter.startingPrice.$lte = maxPrice;
  }
  if (search) filter.$or = ['businessName', 'description', 'vendorType'].map((field) => ({ [field]: new RegExp(escapeRegex(search), 'i') }));
  const [vendors, total] = await Promise.all([
    Vendor.find(filter).select(publicFields).sort({ rating: -1, _id: 1 }).skip((page - 1) * limit).limit(limit),
    Vendor.countDocuments(filter),
  ]);
  ok(res, 'Vendors retrieved', { vendors, total, page, limit });
});

function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

const getVendor = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(400, 'Invalid vendor ID');
  const vendor = await Vendor.findById(req.params.id).select(publicFields);
  if (!vendor) throw new HttpError(404, 'Vendor not found');
  ok(res, 'Vendor retrieved', vendor);
});

const updateProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.auth.id);
  if (!vendor) throw new HttpError(404, 'Vendor not found');
  for (const [key, value] of Object.entries(req.body)) vendor.set(key, value);
  await vendor.save();
  ok(res, 'Vendor profile updated', vendor.toObject({ transform: (_, data) => { delete data.password; delete data.fcmToken; return data; } }));
});

module.exports = { listVendors, getVendor, updateProfile };
