// src/controllers/meter.controller.js
const meterService = require('../services/meter.service');
const { successResponse } = require('../utils/response.utils');

const createReading = async (req, res) =>
  successResponse(res, await meterService.createReading(req.body), 'Nhập chỉ số thành công', 201);

const getReadings = async (req, res) =>
  successResponse(res, await meterService.getReadings(req.params.roomId, req.query.billingPeriod));

const getReadingsTable = async (req, res) =>
  successResponse(res, await meterService.getReadingsTable(req.query.propertyId, req.query.period));

const bulkCreateReadings = async (req, res) =>
  successResponse(res, await meterService.bulkCreateReadings(req.body.propertyId, req.body.billingPeriod, req.body.readings), 'Lưu chỉ số hàng loạt thành công', 201);

module.exports = { createReading, getReadings, getReadingsTable, bulkCreateReadings };
