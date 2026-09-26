// src/controllers/dashboard.controller.js
const dashboardService = require('../services/dashboard.service');
const { successResponse } = require('../utils/response.utils');

const getOverview = async (req, res) => 
  successResponse(res, await dashboardService.getOverview());

module.exports = { getOverview };
