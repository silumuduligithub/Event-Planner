const jwt = require('jsonwebtoken');
const env = require('../config/env');

function generateToken(account) {
  return jwt.sign({ sub: String(account._id), accountType: account.accountType }, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
    issuer: 'event-planner-api',
    audience: 'event-planner-apps',
  });
}

module.exports = generateToken;
