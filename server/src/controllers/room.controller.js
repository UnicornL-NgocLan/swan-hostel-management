// src/controllers/room.controller.js
const roomService = require('../services/room.service');
const { successResponse } = require('../utils/response.utils');

const getByProperty     = async (req, res) => successResponse(res, await roomService.getByProperty(req.params.propertyId, req.query));
const getById           = async (req, res) => successResponse(res, await roomService.getById(req.params.id));
const create            = async (req, res) => successResponse(res, await roomService.create(req.params.propertyId, req.body), 'Tạo phòng thành công', 201);
const update            = async (req, res) => successResponse(res, await roomService.update(req.params.id, req.body), 'Cập nhật phòng thành công');
const remove            = async (req, res) => { await roomService.remove(req.params.id); successResponse(res, null, 'Đã xóa phòng'); };
const reserve           = async (req, res) => successResponse(res, await roomService.reserve(req.params.id), 'Đã giữ chỗ phòng');
const cancelReserve     = async (req, res) => successResponse(res, await roomService.cancelReserve(req.params.id), 'Đã hủy giữ chỗ');
const startMaintenance  = async (req, res) => successResponse(res, await roomService.startMaintenance(req.params.id), 'Phòng chuyển sang bảo trì');
const completeMaintenance = async (req, res) => successResponse(res, await roomService.completeMaintenance(req.params.id), 'Bảo trì hoàn tất, phòng đã sẵn sàng');

module.exports = { getByProperty, getById, create, update, remove, reserve, cancelReserve, startMaintenance, completeMaintenance };
