// src/controllers/tenant.controller.js
const tenantService = require('../services/tenant.service');
const { successResponse } = require('../utils/response.utils');

const getAll  = async (req, res) => successResponse(res, await tenantService.getAll(req.query));
const getById = async (req, res) => successResponse(res, await tenantService.getById(req.params.id));
const create  = async (req, res) => successResponse(res, await tenantService.create(req.body), 'Tạo khách thuê thành công', 201);
const update  = async (req, res) => successResponse(res, await tenantService.update(req.params.id, req.body), 'Cập nhật thành công');
const remove  = async (req, res) => { await tenantService.remove(req.params.id); successResponse(res, null, 'Đã xóa khách thuê'); };

module.exports = { getAll, getById, create, update, remove };
