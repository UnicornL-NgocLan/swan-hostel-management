// src/services/contract.service.js
const mongoose = require('mongoose');
const Contract = require('../models/contract.model');
const Deposit = require('../models/deposit.model');
const Room = require('../models/room.model');
const Tenant = require('../models/tenant.model');
const { nextCode } = require('../utils/counter.utils');
const { CONTRACT_STATUS, ROOM_STATUS, DEPOSIT_STATUS } = require('../constants');

/**
 * Lấy danh sách hợp đồng
 */
const getAll = async (filters = {}) => {
  const query = {};
  if (filters.propertyId) query.propertyId = filters.propertyId;
  if (filters.roomId)     query.roomId     = filters.roomId;
  if (filters.tenantId)   query.primaryTenantId = filters.tenantId;
  if (filters.status)     query.status     = filters.status;

  return Contract.find(query)
    .populate('roomId', 'code name')
    .populate('primaryTenantId', 'fullName phone')
    .populate('propertyId', 'name code')
    .sort({ createdAt: -1 });
};

/**
 * Lấy chi tiết hợp đồng
 */
const getById = async (id) => {
  const contract = await Contract.findById(id)
    .populate('roomId', 'code name rentAmount')
    .populate('primaryTenantId', 'fullName phone identityNumber')
    .populate('propertyId', 'name code')
    .populate('occupants.tenantId', 'fullName phone');

  if (!contract) {
    const err = new Error('Hợp đồng không tồn tại.'); err.statusCode = 404; throw err;
  }
  return contract;
};

/**
 * Tạo hợp đồng mới
 * Business flow:
 *   1. Validate room AVAILABLE hoặc RESERVED
 *   2. Tạo Contract
 *   3. Tạo Deposit (nếu có)
 *   4. Room → OCCUPIED
 * Tất cả trong một session để đảm bảo atomicity
 */
const create = async (data) => {
  const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    // 1. Kiểm tra phòng
    const room = await Room.findById(data.roomId).session(session);
    if (!room) throw Object.assign(new Error('Phòng không tồn tại.'), { statusCode: 404 });
    if (![ROOM_STATUS.AVAILABLE, ROOM_STATUS.RESERVED].includes(room.status)) {
      throw Object.assign(
        new Error(`Phòng đang ở trạng thái ${room.status}, không thể tạo hợp đồng.`),
        { statusCode: 400 }
      );
    }

    // 2. Kiểm tra không có hợp đồng ACTIVE nào cho phòng này
    const existingContract = await Contract.findOne({
      roomId: data.roomId,
      status: CONTRACT_STATUS.ACTIVE,
    }).session(session);
    if (existingContract) {
      throw Object.assign(new Error('Phòng này đã có hợp đồng đang hoạt động.'), { statusCode: 409 });
    }

    // 3. Kiểm tra khách thuê
    const tenant = await Tenant.findById(data.primaryTenantId).session(session);
    if (!tenant || !tenant.isActive) {
      throw Object.assign(new Error('Khách thuê không tồn tại.'), { statusCode: 404 });
    }

    // 4. Tạo contractNo
    const contractNo = await nextCode('contractNo', 'HD', 5);

    // 5. Tạo Contract
    const [contract] = await Contract.create(
      [{ ...data, contractNo, status: CONTRACT_STATUS.ACTIVE }],
      { session }
    );

    // 6. Tạo Deposit nếu có
    if (data.depositAmount && data.depositAmount > 0) {
      await Deposit.create(
        [{
          contractId:   contract._id,
          roomId:       data.roomId,
          tenantId:     data.primaryTenantId,
          amount:       data.depositAmount,
          receivedDate: data.depositReceivedDate || new Date(),
          status:       DEPOSIT_STATUS.HELD,
          note:         data.depositNote,
        }],
        { session }
      );
    }

    // 7. Cập nhật phòng → OCCUPIED
    await Room.findByIdAndUpdate(
      data.roomId,
      { status: ROOM_STATUS.OCCUPIED },
      { session }
    );

    // await session.commitTransaction();
    return contract;
  } catch (err) {
    // await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/**
 * Gia hạn hợp đồng
 */
const renew = async (id, data) => {
  const contract = await Contract.findById(id);
  if (!contract) throw Object.assign(new Error('Hợp đồng không tồn tại.'), { statusCode: 404 });
  if (contract.status !== CONTRACT_STATUS.ACTIVE) {
    throw Object.assign(new Error('Chỉ có thể gia hạn hợp đồng đang ACTIVE.'), { statusCode: 400 });
  }

  contract.endDate    = data.newEndDate;
  contract.rentAmount = data.newRentAmount ?? contract.rentAmount;
  contract.status     = CONTRACT_STATUS.RENEWED;
  contract.note       = data.note ?? contract.note;
  return contract.save();
};

/**
 * Cập nhật thông tin hợp đồng (Ví dụ: thêm phụ phí, thay đổi giá, ngày tháng)
 */
const update = async (id, data) => {
  const contract = await Contract.findById(id);
  if (!contract) throw Object.assign(new Error('Hợp đồng không tồn tại.'), { statusCode: 404 });
  if (contract.status !== CONTRACT_STATUS.ACTIVE) {
    throw Object.assign(new Error('Chỉ có thể sửa hợp đồng đang hoạt động.'), { statusCode: 400 });
  }

  // Update allowed fields
  if (data.rentAmount !== undefined) contract.rentAmount = data.rentAmount;
  if (data.depositAmount !== undefined) contract.depositAmount = data.depositAmount;
  if (data.paymentDueDay !== undefined) contract.paymentDueDay = data.paymentDueDay;
  if (data.startDate !== undefined) contract.startDate = data.startDate;
  if (data.endDate !== undefined) contract.endDate = data.endDate;
  if (data.note !== undefined) contract.note = data.note;
  if (data.customFees !== undefined) contract.customFees = data.customFees;

  return contract.save();
};

/**
 * Chuyển phòng
 */
const transferRoom = async (id, data) => {
  const session = await mongoose.startSession();
  // session.startTransaction();
  try {
    const contract = await Contract.findById(id).session(session);
    if (!contract) throw Object.assign(new Error('Hợp đồng không tồn tại.'), { statusCode: 404 });
    if (![CONTRACT_STATUS.ACTIVE, CONTRACT_STATUS.RENEWED].includes(contract.status)) {
      throw Object.assign(new Error('Hợp đồng không ở trạng thái có thể chuyển phòng.'), { statusCode: 400 });
    }

    const newRoom = await Room.findById(data.newRoomId).session(session);
    if (!newRoom) throw Object.assign(new Error('Phòng mới không tồn tại.'), { statusCode: 404 });
    if (newRoom.status !== ROOM_STATUS.AVAILABLE) {
      throw Object.assign(new Error('Phòng mới không ở trạng thái AVAILABLE.'), { statusCode: 400 });
    }

    // Phòng cũ → AVAILABLE
    await Room.findByIdAndUpdate(contract.roomId, { status: ROOM_STATUS.AVAILABLE }, { session });
    // Phòng mới → OCCUPIED
    await Room.findByIdAndUpdate(data.newRoomId, { status: ROOM_STATUS.OCCUPIED }, { session });

    // Cập nhật hợp đồng
    contract.roomId     = data.newRoomId;
    contract.rentAmount = data.newRentAmount ?? newRoom.rentAmount;
    contract.status     = CONTRACT_STATUS.TRANSFERRED;
    await contract.save({ session });

    // await session.commitTransaction();
    return contract;
  } catch (err) {
    // await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/**
 * Thanh lý hợp đồng (terminate)
 * NOTE: Việc tính quyết toán chi tiết thuộc Phase 8 (Checkout).
 * Ở đây chỉ là terminate đơn giản (admin tự xử lý tiền bên ngoài).
 */
const terminate = async (id, data) => {
  const session = await mongoose.startSession();
  // session.startTransaction();
  try {
    const contract = await Contract.findById(id).session(session);
    if (!contract) throw Object.assign(new Error('Hợp đồng không tồn tại.'), { statusCode: 404 });
    if (contract.status !== CONTRACT_STATUS.ACTIVE) {
      throw Object.assign(new Error('Hợp đồng không thể thanh lý ở trạng thái hiện tại.'), { statusCode: 400 });
    }

    contract.status          = CONTRACT_STATUS.TERMINATED;
    contract.terminationDate = data.terminationDate || new Date();
    contract.terminationNote = data.terminationNote;
    await contract.save({ session });

    // Phòng → AVAILABLE
    await Room.findByIdAndUpdate(contract.roomId, { status: ROOM_STATUS.AVAILABLE }, { session });

    // await session.commitTransaction();
    return contract;
  } catch (err) {
    // await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/**
 * Hủy hợp đồng (void) - Trường hợp tạo nhầm
 */
const voidContract = async (id, reason) => {
  const session = await mongoose.startSession();
  try {
    const contract = await Contract.findById(id).session(session);
    if (!contract) throw Object.assign(new Error('Hợp đồng không tồn tại.'), { statusCode: 404 });
    if (contract.status !== CONTRACT_STATUS.ACTIVE) {
      throw Object.assign(new Error('Chỉ có thể hủy hợp đồng đang hoạt động.'), { statusCode: 400 });
    }

    contract.status = CONTRACT_STATUS.VOID;
    contract.note = contract.note ? `${contract.note}\n[HỦY]: ${reason}` : `[HỦY]: ${reason}`;
    await contract.save({ session });

    // Trả lại phòng về AVAILABLE
    await Room.findByIdAndUpdate(contract.roomId, { status: ROOM_STATUS.AVAILABLE }, { session });

    return contract;
  } finally {
    session.endSession();
  }
};

module.exports = { getAll, getById, create, renew, update, transferRoom, terminate, voidContract };
