const env = require('../config/env');
const { HttpError } = require('../utils/http');

let googleKeys;
let appleKeys;

async function verifyGoogle(identityToken) {
  const audiences = (env.GOOGLE_CLIENT_IDS || '').split(',').map((id) => id.trim()).filter(Boolean);
  if (!audiences.length) throw new HttpError(503, 'Google sign-in is not configured yet');
  try {
    const { createRemoteJWKSet, jwtVerify } = await import('jose');
    googleKeys ||= createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
    const { payload } = await jwtVerify(identityToken, googleKeys, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'], audience: audiences, algorithms: ['RS256'],
    });
    if (!payload.sub || !payload.email || payload.email_verified !== true) throw new Error('Unverified Google identity');
    return { sub: payload.sub, email: payload.email.toLowerCase(), name: payload.name };
  } catch { throw new HttpError(401, 'Google sign-in could not be verified. Please try again.'); }
}

async function verifyApple(identityToken, nonce) {
  if (!env.APPLE_CLIENT_ID) throw new HttpError(503, 'Apple sign-in is not configured yet');
  try {
    const { createRemoteJWKSet, jwtVerify } = await import('jose');
    appleKeys ||= createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));
    const { payload } = await jwtVerify(identityToken, appleKeys, {
      issuer: 'https://appleid.apple.com', audience: env.APPLE_CLIENT_ID, algorithms: ['RS256'],
    });
    if (!payload.sub || !payload.email || payload.nonce !== nonce || ![true, 'true'].includes(payload.email_verified)) throw new Error('Unverified Apple identity');
    return { sub: payload.sub, email: payload.email.toLowerCase() };
  } catch { throw new HttpError(401, 'Apple sign-in could not be verified. Please try again.'); }
}

module.exports = { verifyGoogle, verifyApple };
