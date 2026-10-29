const service = require('../services/checklistService');
const { asyncHandler, ok } = require('../utils/http');
const add = asyncHandler(async (req, res) => ok(res, 'Checklist item added', await service.addItem(req.auth.id, req.params.id, req.body), 201));
const update = asyncHandler(async (req, res) => ok(res, 'Checklist item updated', await service.updateItem(req.auth.id, req.params.id, req.params.itemId, req.body)));
const remove = asyncHandler(async (req, res) => ok(res, 'Checklist item removed', await service.deleteItem(req.auth.id, req.params.id, req.params.itemId)));
module.exports = { add, update, remove };
