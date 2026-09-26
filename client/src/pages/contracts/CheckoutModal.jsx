// src/pages/contracts/CheckoutModal.jsx
import { useEffect, useState } from 'react';
import {
  Modal, Form, DatePicker, InputNumber, Button, App, Steps,
  Card, Statistic, Row, Col, Divider, Alert, Space
} from 'antd';
import { ExportOutlined, CalculatorOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { contractApi } from '../../api/contract.api';

const { Step } = Steps;

const CheckoutModal = ({ open, contract, onClose, onSuccess }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    if (open && contract) {
      setCurrentStep(0);
      setPreviewData(null);
      form.setFieldsValue({
        checkoutDate: dayjs(),
      });
    }
  }, [open, contract]);

  const handlePreview = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await contractApi.checkoutPreview(contract._id, {
        checkoutDate: values.checkoutDate.toISOString(),
        finalMeterReadings: {
          electricity: values.electricity,
          water: values.water
        }
      });
      setPreviewData(res.data);
      setCurrentStep(1);
    } catch (err) {
      if (err.name === 'ValidationError') return;
      message.error(err.response?.data?.message || 'Lỗi khi tính toán');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const values = form.getFieldsValue();
      await contractApi.checkout(contract._id, {
        checkoutDate: values.checkoutDate.toISOString(),
        finalMeterReadings: {
          electricity: values.electricity,
          water: values.water
        },
        deductAmount: previewData.totalDepositHeld > 0 && previewData.finalBalance > 0 
          ? Math.min(previewData.totalDepositHeld, previewData.finalBalance) : 0,
        refundAmount: previewData.totalDepositHeld > 0 && previewData.finalBalance < 0 
          ? Math.abs(previewData.finalBalance) : 0,
        note: `Checkout trên hệ thống`
      });
      message.success('Trả phòng thành công! Hợp đồng đã hoàn tất.');
      onSuccess();
      onClose();
    } catch (err) {
      message.error(err.response?.data?.message || 'Có lỗi khi trả phòng');
    } finally {
      setLoading(false);
    }
  };

  if (!contract) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExportOutlined style={{ color: '#f59e0b', fontSize: 20 }} />
          <span style={{ fontWeight: 700 }}>Trả phòng: {contract.roomId?.code}</span>
        </div>
      }
    >
      <Steps current={currentStep} style={{ marginBottom: 24, marginTop: 16 }}>
        <Step title="Chốt chỉ số" icon={<CalculatorOutlined />} />
        <Step title="Quyết toán" icon={<CheckCircleOutlined />} />
      </Steps>

      {currentStep === 0 && (
        <Form form={form} layout="vertical">
          <Alert 
            message="Khách thuê muốn trả phòng" 
            description={`Hợp đồng của ${contract.primaryTenantId?.fullName}. Vui lòng chốt chỉ số điện nước cuối cùng để tính tiền.`}
            type="info" showIcon style={{ marginBottom: 16 }} 
          />
          <Form.Item name="checkoutDate" label="Ngày trả phòng" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="electricity" label="Chỉ số Điện cuối">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập nếu có sử dụng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="water" label="Chỉ số Nước cuối">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập nếu có sử dụng" />
              </Form.Item>
            </Col>
          </Row>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <Button onClick={onClose}>Hủy</Button>
            <Button type="primary" onClick={handlePreview} loading={loading}>
              Tính toán & Xem trước
            </Button>
          </div>
        </Form>
      )}

      {currentStep === 1 && previewData && (
        <div>
          <Card size="small" title="Chi phí phát sinh (chưa gồm nợ cũ)" style={{ marginBottom: 16, background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Tiền phòng (tính đến {dayjs(previewData?.checkoutDate).format('DD/MM')}):</span>
              <span style={{ fontWeight: 600 }}>{(previewData?.rentAmount || 0).toLocaleString('vi-VN')} ₫</span>
            </div>
            {previewData?.meterDetails?.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>{m.type === 'ELECTRICITY' ? 'Điện' : 'Nước'} ({m.previous} - {m.current}):</span>
                <span style={{ fontWeight: 600 }}>{(m.amount || 0).toLocaleString('vi-VN')} ₫</span>
              </div>
            ))}
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Tổng chi phí cuối kỳ:</strong>
              <strong style={{ color: '#ef4444' }}>{(previewData?.finalInvoiceSubtotal || 0).toLocaleString('vi-VN')} ₫</strong>
            </div>
          </Card>

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center', borderColor: '#ef4444' }}>
                <Statistic title="Nợ cũ chưa trả" value={previewData?.totalDebt || 0} valueStyle={{ color: '#ef4444', fontSize: 18 }} suffix="₫" />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center', borderColor: '#10b981' }}>
                <Statistic title="Cọc đang giữ" value={previewData?.totalDepositHeld || 0} valueStyle={{ color: '#10b981', fontSize: 18 }} suffix="₫" />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center', background: (previewData?.finalBalance || 0) > 0 ? '#fef2f2' : '#ecfdf5', borderColor: (previewData?.finalBalance || 0) > 0 ? '#fecaca' : '#a7f3d0' }}>
                <Statistic 
                  title={(previewData?.finalBalance || 0) > 0 ? "Khách cần đóng thêm" : "Cần hoàn trả khách"} 
                  value={Math.abs(previewData?.finalBalance || 0)} 
                  valueStyle={{ color: (previewData?.finalBalance || 0) > 0 ? '#ef4444' : '#10b981', fontSize: 18, fontWeight: 800 }} 
                  suffix="₫" 
                />
              </Card>
            </Col>
          </Row>
          
          <Alert 
            type="warning" 
            message="Lưu ý" 
            description="Bấm 'Hoàn tất Trả phòng' sẽ lập tức kết thúc hợp đồng này, giải phóng phòng thành TRỐNG, và cập nhật trạng thái tiền cọc. Mọi số tiền thu thêm/hoàn trả bạn sẽ tự giao dịch bên ngoài." 
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <Button onClick={() => setCurrentStep(0)}>Quay lại sửa chỉ số</Button>
            <Space>
              <Button onClick={onClose}>Hủy</Button>
              <Button type="primary" danger onClick={handleCheckout} loading={loading}>
                Hoàn tất Trả phòng
              </Button>
            </Space>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CheckoutModal;
