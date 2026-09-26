// src/controllers/invoice.controller.js
const invoiceService = require('../services/invoice.service');
const { successResponse } = require('../utils/response.utils');

const getAll     = async (req, res) => successResponse(res, await invoiceService.getAll(req.query));
const getById    = async (req, res) => successResponse(res, await invoiceService.getById(req.params.id));
const create     = async (req, res) => successResponse(res, await invoiceService.createForRoom(req.body.contractId, req.body.billingPeriod, req.body), 'Tạo hóa đơn thành công', 201);
const bulkCreate = async (req, res) => successResponse(res, await invoiceService.bulkCreate(req.body.propertyId, req.body.billingPeriod), 'Tạo hóa đơn hàng loạt thành công');
const pay        = async (req, res) => successResponse(res, await invoiceService.recordPayment(req.params.id, req.body, req.user._id), 'Thu tiền thành công');
const voidInv    = async (req, res) => successResponse(res, await invoiceService.voidInvoice(req.params.id), 'Đã hủy hóa đơn');
const update     = async (req, res) => successResponse(res, await invoiceService.update(req.params.id, req.body), 'Cập nhật thành công');
const preview    = async (req, res) => successResponse(res, await invoiceService.previewInvoice(req.body.contractId, req.body.billingPeriod));

const downloadPdf = async (req, res) => {
  const { generateInvoicePdf } = require('../services/pdf.service');
  const invoice = await invoiceService.getById(req.params.id);
  generateInvoicePdf(invoice, res);
};

module.exports = { getAll, getById, create, bulkCreate, pay, voidInv, downloadPdf, update, preview };
