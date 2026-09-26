// src/controllers/checkout.controller.js
const checkoutService = require('../services/checkout.service');
const { successResponse } = require('../utils/response.utils');

const preview = async (req, res) => 
  successResponse(res, await checkoutService.previewCheckout(req.params.id, req.body.checkoutDate, req.body.finalMeterReadings));

const checkout = async (req, res) => 
  successResponse(res, await checkoutService.performCheckout(req.params.id, req.body, req.user._id), 'Trả phòng thành công');

module.exports = { preview, checkout };
