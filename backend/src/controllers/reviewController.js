const service = require('../services/reviewService');
const { asyncHandler, ok } = require('../utils/http');
const list = asyncHandler(async (req, res) => ok(res, 'Reviews retrieved', await service.listReviews(req.params.id, req.query.page, req.query.limit)));
const create = asyncHandler(async (req, res) => ok(res, 'Review added', await service.createReview(req.auth.id, req.params.id, req.body), 201));
module.exports = { list, create };
