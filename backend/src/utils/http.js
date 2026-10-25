class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const ok = (res, message, data, status = 200) => res.status(status).json({ success: true, message, data });

module.exports = { HttpError, asyncHandler, ok };
