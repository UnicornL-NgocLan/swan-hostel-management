// src/controllers/contract.controller.js
const contractService = require('../services/contract.service');
const Deposit = require('../models/deposit.model');
const { successResponse } = require('../utils/response.utils');

const getAll   = async (req, res) => successResponse(res, await contractService.getAll(req.query));
const getById  = async (req, res) => successResponse(res, await contractService.getById(req.params.id));
const create   = async (req, res) => successResponse(res, await contractService.create(req.body), 'Tạo hợp đồng thành công', 201);
const renew    = async (req, res) => successResponse(res, await contractService.renew(req.params.id, req.body), 'Gia hạn hợp đồng thành công');
const update   = async (req, res) => successResponse(res, await contractService.update(req.params.id, req.body), 'Cập nhật hợp đồng thành công');
const transfer = async (req, res) => successResponse(res, await contractService.transferRoom(req.params.id, req.body), 'Chuyển phòng thành công');
const terminate = async (req, res) => successResponse(res, await contractService.terminate(req.params.id, req.body), 'Thanh lý hợp đồng thành công');
const voidContract = async (req, res) => successResponse(res, await contractService.voidContract(req.params.id, req.body.reason), 'Hủy hợp đồng thành công');

// Lấy tiền cọc của hợp đồng
const getDeposit = async (req, res) => {
  const deposits = await Deposit.find({ contractId: req.params.id });
  return successResponse(res, deposits);
};

module.exports = { getAll, getById, create, renew, update, transfer, terminate, voidContract, getDeposit };
