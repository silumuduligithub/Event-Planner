/** Convert bundled demo media paths to URLs reachable through the same API host. */
function publicVendor(req, vendor) {
  if (!vendor) return vendor;
  const data = typeof vendor.toObject === 'function' ? vendor.toObject() : { ...vendor };
  data.portfolioImages = (data.portfolioImages || []).map((value) =>
    value.startsWith('/demo-media/') ? `${req.protocol}://${req.get('host')}${value}` : value);
  return data;
}

module.exports = { publicVendor };
