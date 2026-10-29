const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const generateToken = require('../utils/generateToken');
const { verifyGoogle, verifyApple } = require('../services/socialAuthService');
const { requestPasswordReset, resetPassword } = require('../services/passwordResetService');
const { HttpError, asyncHandler, ok } = require('../utils/http');

function safeAccount(account) {
  const data = account.toObject();
  delete data.password;
  delete data.fcmToken;
  delete data.googleSub;
  delete data.appleSub;
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
    if (!account || !account.password || !(await bcrypt.compare(req.body.password, account.password))) throw new HttpError(401, 'Invalid credentials');
    ok(res, 'Logged in successfully', { account: safeAccount(account), token: generateToken({ _id: account._id, accountType }) });
  });
}

function socialLogin(provider, verify) {
  return asyncHandler(async (req, res) => {
    const identity = await verify(req.body.identityToken, req.body.nonce);
    const key = provider === 'google' ? 'googleSub' : 'appleSub';
    let account = await User.findOne({ [key]: identity.sub }).select(`+${key}`);
    if (!account) {
      const existing = await User.findOne({ email: identity.email });
      if (existing) throw new HttpError(409, 'An account already uses this email. Sign in with its original method.');
      account = await User.create({
        name: req.body.name || identity.name || identity.email.split('@')[0],
        email: identity.email,
        [key]: identity.sub,
      });
    }
    ok(res, 'Logged in successfully', { account: safeAccount(account), token: generateToken({ _id: account._id, accountType: 'user' }) });
  });
}

module.exports = {
  registerUser: register(User, 'user'), loginUser: login(User, 'user'),
  registerVendor: register(Vendor, 'vendor'), loginVendor: login(Vendor, 'vendor'),
  googleUser: socialLogin('google', verifyGoogle), appleUser: socialLogin('apple', verifyApple),
  forgotUserPassword: asyncHandler(async (req, res) => {
    await requestPasswordReset(req.body.email);
    ok(res, 'If an email account exists, a reset link has been sent.', null);
  }),
  resetUserPassword: asyncHandler(async (req, res) => {
    await resetPassword(req.body.token, req.body.password);
    ok(res, 'Password updated. You can now sign in.', null);
  }),
};
