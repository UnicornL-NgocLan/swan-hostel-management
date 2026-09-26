// src/services/meter.service.js
const Meter = require('../models/meter.model');
const MeterReading = require('../models/meter-reading.model');
const Room = require('../models/room.model');
const Property = require('../models/property.model');
const { METER_TYPE } = require('../constants');

/**
 * Lấy/tạo đồng hồ cho phòng (auto-create nếu chưa có)
 */
const ensureMeters = async (roomId) => {
  for (const type of Object.values(METER_TYPE)) {
    const exists = await Meter.findOne({ roomId, type, isActive: true });
    if (!exists) await Meter.create({ roomId, type });
  }
  return Meter.find({ roomId, isActive: true });
};

/**
 * Lấy chỉ số kỳ trước để tự điền previousReading
 */
const getPreviousReading = async (meterId, billingPeriod) => {
  // Tìm reading gần nhất trước billingPeriod
  const prev = await MeterReading.findOne({ meterId, billingPeriod: { $lt: billingPeriod } })
    .sort({ billingPeriod: -1 });
  return prev ? prev.currentReading : 0;
};

/**
 * Nhập chỉ số điện/nước cho một phòng
 */
const createReading = async (data) => {
  const { roomId, billingPeriod, electricityReading, waterReading } = data;

  const room = await Room.findById(roomId).populate('propertyId');
  if (!room) throw Object.assign(new Error('Phòng không tồn tại.'), { statusCode: 404 });

  // room.propertyId đã được populate → dùng trực tiếp (fixed: avoid double-lookup)
  const property = room.propertyId;
  const meters = await ensureMeters(roomId);

  const results = [];

  for (const meter of meters) {
    const isElec = meter.type === METER_TYPE.ELECTRICITY;
    const currentReading = isElec ? electricityReading : waterReading;
    if (currentReading === undefined || currentReading === null) continue;

    const previousReading = await getPreviousReading(meter._id, billingPeriod);
    if (currentReading < previousReading) {
      throw Object.assign(
        new Error(`Chỉ số ${isElec ? 'điện' : 'nước'} mới (${currentReading}) không được nhỏ hơn chỉ số cũ (${previousReading}).`),
        { statusCode: 400 }
      );
    }

    const pricing = isElec ? property.electricityPricing : property.waterPricing;
    const unitPrice = pricing?.fixedPrice || 0;

    // Upsert: nếu đã có reading cho kỳ này thì update
    const existing = await MeterReading.findOne({ meterId: meter._id, billingPeriod });
    if (existing) {
      existing.currentReading = currentReading;
      existing.previousReading = previousReading;
      existing.type = meter.type;
      existing.readingDate = data.readingDate || new Date();
      existing.note = data.note;
      await existing.save();
      results.push(existing);
    } else {
      const reading = await MeterReading.create({
        roomId,
        meterId: meter._id,
        billingPeriod,
        type: meter.type,
        previousReading,
        currentReading,
        readingDate: data.readingDate || new Date(),
        note: data.note,
      });
      results.push(reading);
    }
  }

  return results;
};

/**
 * Lấy chỉ số theo phòng + kỳ
 */
const getReadings = async (roomId, billingPeriod) => {
  const query = { roomId };
  if (billingPeriod) query.billingPeriod = billingPeriod;
  return MeterReading.find(query)
    .populate('meterId', 'type code')
    .sort({ billingPeriod: -1 });
};

/**
 * Lấy danh sách phòng chưa nhập chỉ số trong kỳ
 */
const getUnreadRooms = async (propertyId, billingPeriod) => {
  const occupiedRooms = await Room.find({ propertyId, status: 'OCCUPIED', isActive: true }).select('_id code');
  const meters = await Meter.find({ roomId: { $in: occupiedRooms.map(r => r._id) }, isActive: true });
  const readings = await MeterReading.find({
    meterId: { $in: meters.map(m => m._id) },
    billingPeriod,
  });
  const readMeterIds = new Set(readings.map(r => r.meterId.toString()));
  const unreadMeterIds = meters.filter(m => !readMeterIds.has(m._id.toString()));
  const unreadRoomIds = [...new Set(unreadMeterIds.map(m => m.roomId.toString()))];
  return occupiedRooms.filter(r => unreadRoomIds.includes(r._id.toString()));
};

/**
 * Lấy bảng ghi chỉ số cho toàn bộ phòng trong cơ sở
 */
const getReadingsTable = async (propertyId, billingPeriod) => {
  const rooms = await Room.find({ propertyId, isActive: true }).select('_id code name status');
  
  const results = [];
  for (const room of rooms) {
    const meters = await ensureMeters(room._id);
    const roomData = {
      roomId: room._id,
      roomCode: room.code,
      status: room.status,
      electricity: { previous: 0, current: null, consumption: 0 },
      water: { previous: 0, current: null, consumption: 0 },
    };

    for (const meter of meters) {
      const isElec = meter.type === METER_TYPE.ELECTRICITY;
      const key = isElec ? 'electricity' : 'water';
      
      const reading = await MeterReading.findOne({ meterId: meter._id, billingPeriod });
      if (reading) {
        roomData[key].previous = reading.previousReading;
        roomData[key].current = reading.currentReading;
        roomData[key].consumption = reading.consumption;
      } else {
        const prevReadingValue = await getPreviousReading(meter._id, billingPeriod);
        roomData[key].previous = prevReadingValue;
      }
    }
    results.push(roomData);
  }
  return results;
};

/**
 * Lưu hàng loạt chỉ số
 */
const bulkCreateReadings = async (propertyId, billingPeriod, readings) => {
  const results = { success: [], failed: [] };
  for (const item of readings) {
    try {
      await createReading({
        roomId: item.roomId,
        billingPeriod,
        electricityReading: item.electricity,
        waterReading: item.water,
      });
      results.success.push(item.roomId);
    } catch (err) {
      results.failed.push({ roomId: item.roomId, reason: err.message });
    }
  }
  return results;
};

module.exports = { ensureMeters, createReading, getReadings, getPreviousReading, getUnreadRooms, getReadingsTable, bulkCreateReadings };
