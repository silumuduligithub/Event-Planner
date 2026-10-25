const { HttpError } = require('../utils/http');

const validate = (schema, source = 'body') => (req, res, next) => {
  const parsed = schema.safeParse(req[source]);
  if (!parsed.success) return next(new HttpError(400, parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')));
  req[source] = parsed.data;
  next();
};

module.exports = validate;
