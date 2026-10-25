const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const generateToken = require('../utils/generateToken');
const { HttpError, asyncHandler, ok } = require('../utils/http');

function safeAccount(account) {
  const data = account.toObject();
  delete data.password;
  delete data.fcmToken;
  return data;
}

function register(Model, accountType) {
  return asyncHandler(async (req, res) => {
    const email = req.body.email.toLowerCase();
    if (await Model.exists({ email })) throw new HttpError(409, 'Email already registered');
    const password = await bcrypt.hash(req.body.password, 10);
    const account = await Model.create({ ...req.body, email, password });
    ok(res, 'Registered successfully', { account: safeAccount(account), token: generateToken({ _id: account._id, accountType }) }, 201);
  });
}

function login(Model, accountType) {
  return asyncHandler(async (req, res) => {
    const account = await Model.findOne({ email: req.body.email.toLowerCase() }).select('+password');
    if (!account || !(await bcrypt.compare(req.body.password, account.password))) throw new HttpError(401, 'Invalid credentials');
    ok(res, 'Logged in successfully', { account: safeAccount(account), token: generateToken({ _id: account._id, accountType }) });
  });
}

module.exports = {
  registerUser: register(User, 'user'), loginUser: login(User, 'user'),
  registerVendor: register(Vendor, 'vendor'), loginVendor: login(Vendor, 'vendor'),
};
