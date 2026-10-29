const mongoose = require('mongoose');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const { HttpError } = require('../utils/http');

function publicAccount(user) {
  const data = user.toObject();
  delete data.password;
  delete data.fcmToken;
  return data;
}
async function getAccount(id) {
  const user = await User.findById(id);
  if (!user) throw new HttpError(404, 'Account not found');
  return publicAccount(user);
}
async function updateAccount(id, input) {
  const user = await User.findByIdAndUpdate(id, { $set: input }, { new: true, runValidators: true });
  if (!user) throw new HttpError(404, 'Account not found');
  return publicAccount(user);
}
async function listSaved(id) {
  const user = await User.findById(id).populate({ path: 'savedVendors', select: '-password -fcmToken' });
  if (!user) throw new HttpError(404, 'Account not found');
  return user.savedVendors;
}
async function saveVendor(id, vendorId) {
  if (!mongoose.isValidObjectId(vendorId)) throw new HttpError(400, 'Invalid vendor ID');
  if (!await Vendor.exists({ _id: vendorId })) throw new HttpError(404, 'Vendor not found');
  await User.updateOne({ _id: id }, { $addToSet: { savedVendors: vendorId } });
  return listSaved(id);
}
async function unsaveVendor(id, vendorId) {
  if (!mongoose.isValidObjectId(vendorId)) throw new HttpError(400, 'Invalid vendor ID');
  await User.updateOne({ _id: id }, { $pull: { savedVendors: vendorId } });
  return listSaved(id);
}
module.exports = { getAccount, updateAccount, listSaved, saveVendor, unsaveVendor };
