// src/controllers/property.controller.js
const propertyService = require('../services/property.service');
const floorService = require('../services/floor.service');
const { successResponse } = require('../utils/response.utils');

const getAll   = async (req, res) => successResponse(res, await propertyService.getAll());
const getById  = async (req, res) => successResponse(res, await propertyService.getById(req.params.id));
const create   = async (req, res) => successResponse(res, await propertyService.create(req.body), 'Tạo cơ sở thành công', 201);
const update   = async (req, res) => successResponse(res, await propertyService.update(req.params.id, req.body), 'Cập nhật thành công');
const remove   = async (req, res) => { await propertyService.remove(req.params.id); successResponse(res, null, 'Đã xóa cơ sở'); };

// Floors
const getFloors    = async (req, res) => successResponse(res, await floorService.getByProperty(req.params.id));
const createFloor  = async (req, res) => successResponse(res, await floorService.create(req.params.id, req.body), 'Tạo tầng thành công', 201);
const updateFloor  = async (req, res) => successResponse(res, await floorService.update(req.params.floorId, req.body), 'Cập nhật tầng thành công');
const removeFloor  = async (req, res) => { await floorService.remove(req.params.floorId); successResponse(res, null, 'Đã xóa tầng'); };

module.exports = { getAll, getById, create, update, remove, getFloors, createFloor, updateFloor, removeFloor };
