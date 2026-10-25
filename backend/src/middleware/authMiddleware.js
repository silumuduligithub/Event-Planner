const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const { HttpError, asyncHandler } = require('../utils/http');

function protect(accountType, Model) {
  return asyncHandler(async (req, res, next) => {
    const authorization = req.get('authorization') || '';
    if (!authorization.startsWith('Bearer ')) throw new HttpError(401, 'Authentication required');
    let claims;
    try {
      claims = jwt.verify(authorization.slice(7), env.JWT_SECRET, {
        algorithms: ['HS256'], issuer: 'event-planner-api', audience: 'event-planner-apps',
      });
    } catch {
      throw new HttpError(401, 'Invalid or expired token');
    }
    if (claims.accountType !== accountType) throw new HttpError(403, 'Account type not permitted');
    if (!mongoose.isValidObjectId(claims.sub)) throw new HttpError(401, 'Invalid token subject');
    const account = await Model.findById(claims.sub);
    if (!account) throw new HttpError(401, 'Account no longer exists');
    req.auth = { id: account._id, accountType };
    next();
  });
}

const protectUser = protect('user', User);
const protectVendor = protect('vendor', Vendor);
module.exports = { protectUser, protectVendor };
