const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Vendor = require('../models/Vendor');
const { HttpError } = require('../utils/http');

async function listReviews(vendorId, page = 1, limit = 20) {
  if (!mongoose.isValidObjectId(vendorId)) throw new HttpError(400, 'Invalid vendor ID');
  if (!await Vendor.exists({ _id: vendorId })) throw new HttpError(404, 'Vendor not found');
  const [reviews, total] = await Promise.all([
    Review.find({ vendorId }).populate('userId', 'name avatar').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Review.countDocuments({ vendorId }),
  ]);
  return { reviews, total, page, limit };
}
async function createReview(userId, vendorId, input) {
  if (!mongoose.isValidObjectId(vendorId)) throw new HttpError(400, 'Invalid vendor ID');
  const booking = await Booking.findOne({ _id: input.bookingId, userId, vendorId, status: 'completed' });
  if (!booking) throw new HttpError(403, 'You can review a vendor after a completed booking');
  if (await Review.exists({ bookingId: booking._id })) throw new HttpError(409, 'This booking has already been reviewed');
  const review = await Review.create({ userId, vendorId, bookingId: booking._id, rating: input.rating, comment: input.comment });
  const [summary] = await Review.aggregate([
    { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
    { $group: { _id: '$vendorId', rating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
  ]);
  await Vendor.updateOne({ _id: vendorId }, { $set: { rating: summary.rating, reviewCount: summary.reviewCount } });
  return review;
}
module.exports = { listReviews, createReview };
