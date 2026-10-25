function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found', data: null });
}

// Express recognizes error middleware by its four arguments.
function errorHandler(error, req, res, next) {
  const status = error.statusCode || (error.code === 11000 ? 409 : ['ValidationError', 'CastError', 'SyntaxError'].includes(error.name) ? 400 : 500);
  if (status >= 500) console.error(error);
  const message = error.code === 11000 ? 'A record with this value already exists'
    : error.name === 'SyntaxError' ? 'Invalid JSON request body'
      : status >= 500 ? 'Internal server error' : error.message;
  res.status(status).json({
    success: false,
    message,
    data: null,
  });
}

module.exports = { notFound, errorHandler };
