const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const env = require('../config/env');
const User = require('../models/User');
const { HttpError } = require('../utils/http');

function configured() {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD && env.SMTP_FROM);
}

async function requestPasswordReset(email) {
  if (!configured()) throw new HttpError(503, 'Password recovery is not available yet. Please contact support.');
  const account = await User.findOne({ email }).select('+password +resetPasswordSentAt');
  if (!account?.password) return;
  if (account.resetPasswordSentAt && Date.now() - account.resetPasswordSentAt.getTime() < 60000) return;
  const token = crypto.randomBytes(32).toString('hex');
  const resetPasswordHash = crypto.createHash('sha256').update(token).digest('hex');
  account.resetPasswordHash = resetPasswordHash;
  account.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  account.resetPasswordSentAt = new Date();
  await account.save();
  const url = `${env.APP_RESET_URL}?token=${encodeURIComponent(token)}`;
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  });
  try {
    await transport.sendMail({
      from: env.SMTP_FROM, to: account.email, subject: 'Reset your Evently password',
      text: `Open this link to reset your Evently password. It expires in 15 minutes: ${url}`,
    });
  } catch {
    await User.updateOne({ _id: account._id, resetPasswordHash }, { $unset: { resetPasswordHash: 1, resetPasswordExpiresAt: 1 } });
    throw new HttpError(503, 'We could not send a reset email right now. Please try again later.');
  } finally { transport.close(); }
}

async function resetPassword(token, password) {
  const resetPasswordHash = crypto.createHash('sha256').update(token).digest('hex');
  const hashedPassword = await bcrypt.hash(password, 10);
  const account = await User.findOneAndUpdate(
    { resetPasswordHash, resetPasswordExpiresAt: { $gt: new Date() } },
    { $set: { password: hashedPassword }, $unset: { resetPasswordHash: 1, resetPasswordExpiresAt: 1, resetPasswordSentAt: 1 } },
    { new: true },
  );
  if (!account) throw new HttpError(400, 'This reset link is invalid or has expired. Request a new one.');
}

module.exports = { requestPasswordReset, resetPassword };
