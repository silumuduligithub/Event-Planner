const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
const env = require('../config/env');
const { HttpError } = require('../utils/http');

const money = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

async function calculateEstimate(input) {
  if (!mongoose.isValidObjectId(input.vendorId)) throw new HttpError(400, 'Invalid vendor ID');
  const vendor = await Vendor.findById(input.vendorId);
  if (!vendor) throw new HttpError(404, 'Vendor not found');
  const serviceIds = input.selectedServices.map((item) => item.serviceId);
  const artistIds = input.selectedCelebrities.map((item) => item.artistId);
  if (new Set(serviceIds).size !== serviceIds.length || new Set(artistIds).size !== artistIds.length) throw new HttpError(400, 'Duplicate selections are not allowed');
  if (serviceIds.length + artistIds.length === 0) throw new HttpError(400, 'Select at least one service or artist');
  if (input.bookingType === 'single_service' && (serviceIds.length !== 1 || artistIds.length)) throw new HttpError(400, 'A single-service booking requires exactly one service');
  if (input.bookingType === 'full_event_package' && !serviceIds.length) throw new HttpError(400, 'A package requires at least one service');
  if (input.bookingType === 'orchestra_celebrity' && !artistIds.length && !serviceIds.length) throw new HttpError(400, 'Select an orchestra service or artist');

  const selectedServices = input.selectedServices.map(({ serviceId, quantity }) => {
    const service = vendor.services.id(serviceId);
    if (!service) throw new HttpError(400, `Service ${serviceId} is unavailable`);
    if (['fixed', 'per_event'].includes(service.pricingType) && quantity !== 1) throw new HttpError(400, `${service.name} has a fixed quantity of one`);
    return {
      serviceId: service._id, name: service.name, pricingType: service.pricingType,
      unitPrice: service.price, quantity, totalPrice: money(service.price * quantity),
    };
  });
  const selectedCelebrities = input.selectedCelebrities.map(({ artistId }) => {
    const artist = vendor.artistsOrCelebrities.id(artistId);
    if (!artist || !artist.isAvailable) throw new HttpError(400, `Artist ${artistId} is unavailable`);
    return { artistId: artist._id, name: artist.name, roleOrSkill: artist.roleOrSkill, price: artist.pricePerPerformance };
  });
  const subtotal = money(selectedServices.reduce((sum, item) => sum + item.totalPrice, 0) + selectedCelebrities.reduce((sum, item) => sum + item.price, 0));
  const taxAmount = money(subtotal * env.ESTIMATE_TAX_RATE);
  const totalAmount = money(subtotal + taxAmount);
  const advanceAmount = money(totalAmount * env.ESTIMATE_ADVANCE_RATE);
  return {
    vendorId: vendor._id, bookingType: input.bookingType, selectedServices, selectedCelebrities,
    subtotal, discount: 0, taxAmount, totalAmount, advanceAmount,
    pendingAmount: money(totalAmount - advanceAmount), taxRate: env.ESTIMATE_TAX_RATE,
    advanceRate: env.ESTIMATE_ADVANCE_RATE,
  };
}

module.exports = { calculateEstimate };
