// src/services/tenant.service.js
const Tenant = require('../models/tenant.model');

const getAll = async (filters = {}) => {
  const query = { isActive: true };
  if (filters.search) {
    query.$or = [
      { fullName: { $regex: filters.search, $options: 'i' } },
      { phone: { $regex: filters.search, $options: 'i' } },
      { identityNumber: { $regex: filters.search, $options: 'i' } },
    ];
  }
  return Tenant.find(query).sort({ fullName: 1 });
};

const getById = async (id) => {
  const tenant = await Tenant.findById(id);
  if (!tenant || !tenant.isActive) {
    const err = new Error('Khách thuê không tồn tại.'); err.statusCode = 404; throw err;
  }
  return tenant;
};

const create = async (data) => Tenant.create(data);

const update = async (id, data) => {
  const tenant = await Tenant.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  if (!tenant) { const err = new Error('Khách thuê không tồn tại.'); err.statusCode = 404; throw err; }
  return tenant;
};

const remove = async (id) => {
  const tenant = await Tenant.findByIdAndUpdate(id, { isActive: false });
  if (!tenant) { const err = new Error('Khách thuê không tồn tại.'); err.statusCode = 404; throw err; }
};

module.exports = { getAll, getById, create, update, remove };
