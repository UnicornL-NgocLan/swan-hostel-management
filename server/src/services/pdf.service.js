// src/services/pdf.service.js
const PDFDocument = require('pdfkit');
const path = require('path');

const generateInvoicePdf = (invoice, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Load fonts
  const fontRegular = path.join(__dirname, '../assets/fonts/Roboto-Regular.ttf');
  const fontBold = path.join(__dirname, '../assets/fonts/Roboto-Bold.ttf');
  
  doc.registerFont('Roboto', fontRegular);
  doc.registerFont('Roboto-Bold', fontBold);

  // Handle stream
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice.invoiceNo}.pdf`);
  doc.pipe(res);

  // Header
  doc.font('Roboto-Bold').fontSize(20).text('HÓA ĐƠN THANH TOÁN', { align: 'center' });
  doc.moveDown();

  doc.font('Roboto').fontSize(12).text(`Cơ sở: ${invoice.propertyId?.name || '---'}`);
  doc.text(`Số hóa đơn: ${invoice.invoiceNo}`);
  doc.text(`Kỳ thanh toán: ${invoice.billingPeriod}`);
  doc.text(`Ngày phát hành: ${new Date(invoice.issueDate).toLocaleDateString('vi-VN')}`);
  doc.text(`Hạn thanh toán: ${new Date(invoice.dueDate).toLocaleDateString('vi-VN')}`);
  doc.moveDown();

  // Khách hàng
  doc.text(`Phòng: ${invoice.roomId?.code}`);
  doc.text(`Khách thuê: ${invoice.tenantId?.fullName}`);
  doc.text(`Số điện thoại: ${invoice.tenantId?.phone}`);
  doc.moveDown();

  // Bảng chi tiết
  doc.font('Roboto-Bold').text('CHI TIẾT CÁC KHOẢN THU:', { underline: true });
  doc.moveDown(0.5);

  doc.font('Roboto-Bold');
  let y = doc.y;
  
  // Header bảng
  doc.text('Tên khoản thu', 50, y, { width: 250 });
  doc.text('Số lượng', 300, y, { width: 80, align: 'right' });
  doc.text('Đơn giá', 390, y, { width: 80, align: 'right' });
  doc.text('Thành tiền', 480, y, { width: 80, align: 'right' });
  
  doc.moveTo(50, y + 15).lineTo(560, y + 15).stroke();
  y += 25;

  // Nội dung bảng
  doc.font('Roboto');
  for (const line of invoice.lines) {
    doc.text(line.name, 50, y, { width: 250 });
    doc.text(line.quantity.toString(), 300, y, { width: 80, align: 'right' });
    doc.text(line.unitPrice.toLocaleString('vi-VN'), 390, y, { width: 80, align: 'right' });
    doc.text(line.amount.toLocaleString('vi-VN'), 480, y, { width: 80, align: 'right' });
    y += 20;
  }

  doc.moveTo(50, y).lineTo(560, y).stroke();
  y += 15;

  // Tổng kết
  doc.font('Roboto-Bold');
  
  if (invoice.discount && invoice.discount > 0) {
    doc.text('Tổng các khoản:', 300, y);
    doc.text(`${(invoice.subtotal || invoice.totalAmount + invoice.discount).toLocaleString('vi-VN')} VND`, 450, y, { align: 'right' });
    
    y += 20;
    doc.text('Giảm trừ:', 350, y);
    doc.text(`- ${invoice.discount.toLocaleString('vi-VN')} VND`, 450, y, { align: 'right' });
    y += 20;
  }

  doc.text('THÀNH TIỀN:', 350, y);
  doc.text(`${invoice.totalAmount.toLocaleString('vi-VN')} VND`, 450, y, { align: 'right' });
  
  y += 20;
  doc.text('Đã thanh toán:', 350, y);
  doc.text(`${invoice.paidAmount.toLocaleString('vi-VN')} VND`, 450, y, { align: 'right' });
  
  y += 20;
  doc.text('Còn lại (Cần thanh toán):', 250, y);
  doc.text(`${invoice.balanceAmount.toLocaleString('vi-VN')} VND`, 450, y, { align: 'right' });

  if (invoice.note) {
    y += 30;
    doc.font('Roboto-Bold').text('Ghi chú:', 50, y);
    doc.font('Roboto').text(invoice.note, 50, y + 15, { width: 480 });
    y += doc.heightOfString(invoice.note, { width: 480 }) + 15;
  }

  doc.moveDown(3);
  doc.font('Roboto-Bold').text('Cảm ơn Quý khách!', 50, y + 40, { align: 'center', width: 480 });

  doc.end();
};

module.exports = { generateInvoicePdf };
