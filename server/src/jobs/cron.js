const cron = require('node-cron');
const Invoice = require('../models/invoice.model');
const Contract = require('../models/contract.model');
const Notification = require('../models/notification.model');
const { INVOICE_STATUS, CONTRACT_STATUS } = require('../constants');
const dayjs = require('dayjs');

const initCronJobs = () => {
  console.log('🕒 Khởi tạo các Cron Jobs...');

  // Chạy hàng ngày vào lúc 00:05
  cron.schedule('5 0 * * *', async () => {
    console.log('🔄 Bắt đầu chạy daily jobs...');
    try {
      // 1. Cập nhật trạng thái hóa đơn quá hạn
      const today = dayjs().startOf('day').toDate();
      const overdueResult = await Invoice.updateMany(
        { 
          dueDate: { $lt: today }, 
          status: { $in: [INVOICE_STATUS.ISSUED, INVOICE_STATUS.PARTIAL] } 
        },
        { $set: { status: INVOICE_STATUS.OVERDUE } }
      );
      
      if (overdueResult.modifiedCount > 0) {
        console.log(`- Đã cập nhật ${overdueResult.modifiedCount} hóa đơn sang QUÁ HẠN.`);
        await Notification.create({
          title: 'Hóa đơn quá hạn',
          content: `Có ${overdueResult.modifiedCount} hóa đơn mới vừa chuyển sang trạng thái QUÁ HẠN. Vui lòng kiểm tra và nhắc nhở khách.`,
          type: 'WARNING',
          link: '/invoices'
        });
      }

      // 2. Cảnh báo hợp đồng sắp hết hạn (còn <= 15 ngày)
      const warningDate = dayjs().add(15, 'day').endOf('day').toDate();
      const expiringContracts = await Contract.find({
        status: { $in: [CONTRACT_STATUS.ACTIVE, CONTRACT_STATUS.RENEWED] },
        endDate: { $lte: warningDate, $gte: today }
      }).populate('roomId', 'code');
      
      if (expiringContracts.length > 0) {
        console.log(`- CẢNH BÁO: Có ${expiringContracts.length} hợp đồng sắp hết hạn.`);
        
        const roomCodes = expiringContracts.map(c => c.roomId?.code).join(', ');
        await Notification.create({
          title: 'Hợp đồng sắp hết hạn',
          content: `Có ${expiringContracts.length} hợp đồng sắp hết hạn trong 15 ngày tới (Phòng: ${roomCodes}).`,
          type: 'INFO',
          link: '/contracts'
        });
      }

    } catch (err) {
      console.error('Lỗi khi chạy daily jobs:', err);
    }
  });
};

module.exports = { initCronJobs };
