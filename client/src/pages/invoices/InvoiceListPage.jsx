// src/pages/invoices/InvoiceListPage.jsx
import { useEffect, useState } from 'react';
import {
  Table, Button, Select, Tag, Space, Tooltip, Popconfirm,
  Modal, Form, InputNumber, DatePicker, Input, Row, Col, App, Badge, Steps, QRCode
} from 'antd';
import {
  PlusOutlined, DollarOutlined, EyeOutlined,
  StopOutlined, CheckCircleOutlined, ThunderboltOutlined, QrcodeOutlined, PrinterOutlined,
  EditOutlined, MinusCircleOutlined, SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { invoiceApi } from '../../api/invoice.api';
import { propertyApi } from '../../api/property.api';
import { contractApi } from '../../api/contract.api';

const STATUS_CFG = {
  DRAFT:   { color: 'default',    label: 'Nháp',         badge: 'default' },
  ISSUED:  { color: 'processing', label: 'Đã phát hành', badge: 'processing' },
  PARTIAL: { color: 'warning',    label: 'Trả 1 phần',   badge: 'warning' },
  PAID:    { color: 'success',    label: 'Đã trả đủ',    badge: 'success' },
  OVERDUE: { color: 'error',      label: 'Quá hạn',      badge: 'error' },
  VOID:    { color: 'default',    label: 'Đã hủy',       badge: 'default' },
};

// ── Modal tạo hóa đơn đơn lẻ ──────────────────────────────
const CreateInvoiceModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const { message } = App.useApp();

  const watchContract = Form.useWatch('contractId', form);
  const watchPeriod = Form.useWatch('billingPeriod', form);
  const watchLines = Form.useWatch('lines', form);
  const watchDiscount = Form.useWatch('discount', form);

  useEffect(() => {
    if (open) {
      form.resetFields();
      contractApi.getAll({ status: 'ACTIVE' }).then(res => setContracts(res.data || []));
    }
  }, [open]);

  useEffect(() => {
    if (open && watchContract && watchPeriod) {
      setPreviewLoading(true);
      invoiceApi.preview({
        contractId: watchContract,
        billingPeriod: watchPeriod.format('YYYY-MM')
      }).then(res => {
        form.setFieldsValue({ lines: res.data?.lines || [] });
      }).catch(err => {
        message.warning('Chưa phát sinh chi phí hoặc hợp đồng đã có hóa đơn kỳ này.');
        form.setFieldsValue({ lines: [] });
      }).finally(() => {
        setPreviewLoading(false);
      });
    }
  }, [open, watchContract, watchPeriod]);

  const subtotal = (watchLines || []).reduce((sum, l) => sum + (Number(l?.quantity) || 0) * (Number(l?.unitPrice) || 0), 0);
  const totalAmount = Math.max(0, subtotal - (Number(watchDiscount) || 0));

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await invoiceApi.create({
        contractId: values.contractId,
        billingPeriod: values.billingPeriod.format('YYYY-MM'),
        discount: values.discount || 0,
        note: values.note,
        lines: values.lines,
      });
      message.success('Tạo hóa đơn thành công!');
      onSuccess();
      onClose();
    } catch (err) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={800} destroyOnClose
      title={<span style={{ fontWeight: 700 }}>Tạo hóa đơn</span>}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="contractId" label="Hợp đồng" rules={[{ required: true, message: 'Chọn hợp đồng' }]}>
              <Select
                showSearch placeholder="Tìm phòng / khách thuê..."
                filterOption={(input, opt) => opt.label?.toLowerCase().includes(input.toLowerCase())}
                options={contracts.map(c => ({
                  value: c._id,
                  label: `${c.roomId?.code} — ${c.primaryTenantId?.fullName}`,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="billingPeriod" label="Kỳ thanh toán" rules={[{ required: true }]} initialValue={dayjs()}>
              <DatePicker picker="month" format="MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ fontWeight: 600, marginBottom: 8 }}>Chi tiết các khoản phí {previewLoading && <span style={{ color: '#3b82f6', fontWeight: 'normal' }}>(Đang tính toán...)</span>}</div>
        <Form.List name="lines">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={8} style={{ marginBottom: 8 }}>
                  <Col span={7}>
                    <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: 'Nhập tên' }]} style={{ marginBottom: 0 }}>
                      <Input placeholder="Tên phí (VD: Tiền phòng)" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...restField} name={[name, 'type']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                      <Select placeholder="Loại">
                        <Select.Option value="RENT">Tiền phòng</Select.Option>
                        <Select.Option value="ELECTRICITY">Điện</Select.Option>
                        <Select.Option value="WATER">Nước</Select.Option>
                        <Select.Option value="SERVICE">Dịch vụ</Select.Option>
                        <Select.Option value="OTHER">Khác</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item {...restField} name={[name, 'quantity']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                      <InputNumber placeholder="Số lượng" min={0} step={0.01} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...restField} name={[name, 'unitPrice']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                      <InputNumber placeholder="Đơn giá" min={0} step={10000} style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>
                  </Col>
                  <Col span={1} style={{ display: 'flex', alignItems: 'center' }}>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ef4444' }} />
                  </Col>
                </Row>
              ))}
              <Form.Item style={{ marginTop: 8 }}>
                <Button type="dashed" onClick={() => add({ type: 'OTHER', quantity: 1, unitPrice: 0 })} block icon={<PlusOutlined />}>
                  Thêm chi phí
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="discount" label="Giảm trừ (₫)">
              <InputNumber style={{ width: '100%' }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="note" label="Ghi chú">
              <Input.TextArea rows={1} />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <Row justify="space-between" style={{ marginBottom: 4 }}>
            <Col><span style={{ color: '#64748b' }}>Tổng tiền các khoản:</span></Col>
            <Col><strong style={{ color: '#475569' }}>{subtotal.toLocaleString('vi-VN')} ₫</strong></Col>
          </Row>
          <Row justify="space-between" style={{ marginBottom: 4 }}>
            <Col><span style={{ color: '#64748b' }}>Giảm trừ:</span></Col>
            <Col><strong style={{ color: '#ef4444' }}>- {(Number(watchDiscount) || 0).toLocaleString('vi-VN')} ₫</strong></Col>
          </Row>
          <Row justify="space-between" style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, marginTop: 4 }}>
            <Col><strong style={{ fontSize: 16 }}>THÀNH TIỀN:</strong></Col>
            <Col><strong style={{ fontSize: 18, color: '#10b981' }}>{totalAmount.toLocaleString('vi-VN')} ₫</strong></Col>
          </Row>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading}
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: 8 }}>
            Tạo hóa đơn
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

// ── Modal tạo hàng loạt ────────────────────────────────────
const BulkCreateModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [result, setResult] = useState(null);
  const { message } = App.useApp();

  useEffect(() => {
    if (open) { form.resetFields(); setResult(null); propertyApi.getAll().then(res => setProperties(res.data || [])); }
  }, [open]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await invoiceApi.bulkCreate({
        propertyId: values.propertyId,
        billingPeriod: values.billingPeriod.format('YYYY-MM'),
      });
      setResult(res.data);
      message.success(`Thành công: ${res.data.success?.length}, Lỗi: ${res.data.failed?.length}`);
      onSuccess();
    } catch (err) {
      message.error(err.response?.data?.message || 'Lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={520} destroyOnClose
      title={<span style={{ fontWeight: 700 }}>⚡ Tạo hóa đơn hàng loạt</span>}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Form.Item name="propertyId" label="Cơ sở" rules={[{ required: true }]}>
          <Select options={properties.map(p => ({ value: p._id, label: p.name }))} />
        </Form.Item>
        <Form.Item name="billingPeriod" label="Kỳ thanh toán" rules={[{ required: true }]} initialValue={dayjs()}>
          <DatePicker picker="month" format="MM/YYYY" style={{ width: '100%' }} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block
          style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: 8, marginBottom: 12 }}>
          Tạo hóa đơn cho tất cả phòng
        </Button>
        {result && (
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14 }}>
            <div style={{ color: '#10b981', fontWeight: 600 }}>✓ {result.success?.length} hóa đơn tạo thành công</div>
            {result.failed?.length > 0 && (
              <div style={{ color: '#ef4444', marginTop: 6 }}>
                ✗ {result.failed?.length} thất bại: {result.failed?.map(f => f.reason).join('; ')}
              </div>
            )}
          </div>
        )}
      </Form>
    </Modal>
  );
};

// ── Modal sửa hóa đơn ────────────────────────────────────────
const EditInvoiceModal = ({ open, invoice, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (open && invoice) {
      form.setFieldsValue({
        discount: invoice.discount || 0,
        note: invoice.note,
        lines: invoice.lines || [],
      });
    }
  }, [open, invoice]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await invoiceApi.update(invoice._id, {
        discount: values.discount,
        note: values.note,
        lines: values.lines,
      });
      message.success('Cập nhật hóa đơn thành công!');
      onSuccess();
      onClose();
    } catch (err) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const watchLines = Form.useWatch('lines', form);
  const watchDiscount = Form.useWatch('discount', form);

  const subtotal = (watchLines || []).reduce((sum, l) => sum + (Number(l?.quantity) || 0) * (Number(l?.unitPrice) || 0), 0);
  const totalAmount = Math.max(0, subtotal - (Number(watchDiscount) || 0));

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={800} destroyOnClose
      title={<span style={{ fontWeight: 700 }}>Chỉnh sửa hóa đơn {invoice?.invoiceNo}</span>}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
        
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Chi tiết các khoản phí</div>
        <Form.List name="lines">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={8} style={{ marginBottom: 8 }}>
                  <Col span={7}>
                    <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: 'Nhập tên' }]} style={{ marginBottom: 0 }}>
                      <Input placeholder="Tên phí (VD: Tiền phòng)" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...restField} name={[name, 'type']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                      <Select placeholder="Loại">
                        <Select.Option value="RENT">Tiền phòng</Select.Option>
                        <Select.Option value="ELECTRICITY">Điện</Select.Option>
                        <Select.Option value="WATER">Nước</Select.Option>
                        <Select.Option value="SERVICE">Dịch vụ</Select.Option>
                        <Select.Option value="OTHER">Khác</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item {...restField} name={[name, 'quantity']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                      <InputNumber placeholder="Số lượng" min={0} step={0.01} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...restField} name={[name, 'unitPrice']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                      <InputNumber placeholder="Đơn giá" min={0} step={10000} style={{ width: '100%' }} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>
                  </Col>
                  <Col span={1} style={{ display: 'flex', alignItems: 'center' }}>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ef4444' }} />
                  </Col>
                </Row>
              ))}
              <Form.Item style={{ marginTop: 8 }}>
                <Button type="dashed" onClick={() => add({ type: 'OTHER', quantity: 1, unitPrice: 0 })} block icon={<PlusOutlined />}>
                  Thêm chi phí
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="discount" label="Giảm trừ (₫)">
              <InputNumber style={{ width: '100%' }} min={0} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="note" label="Ghi chú">
              <Input.TextArea rows={1} />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <Row justify="space-between" style={{ marginBottom: 4 }}>
            <Col><span style={{ color: '#64748b' }}>Tổng tiền các khoản:</span></Col>
            <Col><strong style={{ color: '#475569' }}>{subtotal.toLocaleString('vi-VN')} ₫</strong></Col>
          </Row>
          <Row justify="space-between" style={{ marginBottom: 4 }}>
            <Col><span style={{ color: '#64748b' }}>Giảm trừ:</span></Col>
            <Col><strong style={{ color: '#ef4444' }}>- {(Number(watchDiscount) || 0).toLocaleString('vi-VN')} ₫</strong></Col>
          </Row>
          <Row justify="space-between" style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, marginTop: 4 }}>
            <Col><strong style={{ fontSize: 16 }}>THÀNH TIỀN:</strong></Col>
            <Col><strong style={{ fontSize: 18, color: '#10b981' }}>{totalAmount.toLocaleString('vi-VN')} ₫</strong></Col>
          </Row>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading}
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: 8 }}>
            Lưu thay đổi
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

// ── Modal thu tiền ─────────────────────────────────────────
const PayModal = ({ open, invoice, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (open && invoice) {
      form.setFieldsValue({ amount: invoice.balanceAmount, method: 'CASH', paymentDate: dayjs() });
    }
  }, [open, invoice]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await invoiceApi.pay(invoice._id, {
        ...values,
        paymentDate: values.paymentDate?.toISOString(),
      });
      message.success('Thu tiền thành công!');
      onSuccess();
      onClose();
    } catch (err) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={420} destroyOnClose
      title={<span style={{ fontWeight: 700, color: '#10b981' }}>💰 Thu tiền hóa đơn</span>}>
      {invoice && (
        <div style={{ background: '#ecfdf5', borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <div style={{ fontWeight: 600, color: '#065f46' }}>
            {invoice.roomId?.code} — {invoice.tenantId?.fullName}
          </div>
          <div style={{ color: '#047857', fontSize: 13 }}>
            Còn lại: <strong>{(invoice.balanceAmount || 0).toLocaleString('vi-VN')} ₫</strong>
          </div>
        </div>
      )}
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="amount" label="Số tiền thu (₫)" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={1} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
        </Form.Item>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="method" label="Phương thức">
              <Select>
                <Select.Option value="CASH">Tiền mặt</Select.Option>
                <Select.Option value="TRANSFER">Chuyển khoản</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="paymentDate" label="Ngày thu">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="reference" label="Mã GD (chuyển khoản)">
          <Input placeholder="FT2026XXXX" />
        </Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading}
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: 8 }}>
            Xác nhận thu tiền
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

// ── Main Page ──────────────────────────────────────────────
const InvoiceListPage = () => {
  const { message } = App.useApp();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [editInvoice, setEditInvoice] = useState(null);
  const [qrInvoice, setQrInvoice] = useState(null);

  const fetchInvoices = async (status = '') => {
    setLoading(true);
    try {
      const params = status ? { status } : {};
      const res = await invoiceApi.getAll(params);
      setInvoices(res.data || []);
    } catch {
      message.error('Không thể tải hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(filterStatus); }, [filterStatus]);

  const getColumnSearchProps = (dataIndex, nestedKey = null) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
        <Input
          placeholder={`Tìm kiếm`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
            Tìm
          </Button>
          <Button onClick={() => { clearFilters(); confirm(); }} size="small" style={{ width: 90 }}>
            Xóa
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
    onFilter: (value, record) => {
      let recordValue = record[dataIndex];
      if (nestedKey && recordValue) recordValue = recordValue[nestedKey];
      return recordValue ? recordValue.toString().toLowerCase().includes(value.toLowerCase()) : '';
    },
  });

  const getColumnDateRangeProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={e => e.stopPropagation()}>
        <DatePicker.RangePicker
          format="DD/MM/YYYY"
          value={selectedKeys[0] || null}
          onChange={dates => setSelectedKeys(dates ? [dates] : [])}
          style={{ marginBottom: 8, display: 'flex' }}
        />
        <Space>
          <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
            Lọc
          </Button>
          <Button onClick={() => { clearFilters(); confirm(); }} size="small" style={{ width: 90 }}>
            Xóa
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
    onFilter: (value, record) => {
      if (!record[dataIndex] || !value || value.length !== 2) return false;
      const recordDate = dayjs(record[dataIndex]);
      const start = value[0].startOf('day');
      const end = value[1].endOf('day');
      return (recordDate.isAfter(start) || recordDate.isSame(start)) && 
             (recordDate.isBefore(end) || recordDate.isSame(end));
    },
  });

  const handleVoid = async (id) => {
    try {
      await invoiceApi.void(id);
      message.success('Đã hủy hóa đơn');
      fetchInvoices(filterStatus);
    } catch (err) {
      message.error(err.response?.data?.message || 'Hủy thất bại');
    }
  };

  const handleDownloadPdf = async (id, invoiceNo) => {
    try {
      const blob = await invoiceApi.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      message.error('Lỗi khi tải PDF');
    }
  };

  const columns = [
    {
      title: 'Số HĐ',
      dataIndex: 'invoiceNo',
      key: 'invoiceNo',
      ...getColumnSearchProps('invoiceNo'),
      render: v => <Tag color="purple" style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v}</Tag>,
    },
    {
      title: 'Phòng',
      dataIndex: 'roomId',
      key: 'roomId',
      ...getColumnSearchProps('roomId', 'code'),
      render: v => v ? <Tag>{v.code}</Tag> : '—',
    },
    {
      title: 'Khách thuê',
      dataIndex: 'tenantId',
      key: 'tenantId',
      ...getColumnSearchProps('tenantId', 'fullName'),
      render: v => v ? (
        <div>
          <div style={{ fontWeight: 600 }}>{v.fullName}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{v.phone}</div>
        </div>
      ) : '—',
    },
    {
      title: 'Kỳ',
      dataIndex: 'billingPeriod',
      key: 'billingPeriod',
      ...getColumnSearchProps('billingPeriod'),
      render: v => {
        const [y, m] = v.split('-');
        return <Tag>{`T${m}/${y}`}</Tag>;
      },
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: v => <span style={{ fontWeight: 600 }}>{(v || 0).toLocaleString('vi-VN')} ₫</span>,
    },
    {
      title: 'Còn lại',
      dataIndex: 'balanceAmount',
      key: 'balanceAmount',
      align: 'right',
      render: v => (
        <span style={{ fontWeight: 600, color: v > 0 ? '#ef4444' : '#10b981' }}>
          {(v || 0).toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
    {
      title: 'Đến hạn',
      dataIndex: 'dueDate',
      key: 'dueDate',
      ...getColumnDateRangeProps('dueDate'),
      render: v => {
        const isOverdue = dayjs(v).isBefore(dayjs(), 'day');
        return (
          <span style={{ color: isOverdue ? '#ef4444' : '#475569' }}>
            {dayjs(v).format('DD/MM/YYYY')}
            {isOverdue && <Tag color="error" style={{ marginLeft: 6 }}>Quá hạn</Tag>}
          </span>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: v => {
        const cfg = STATUS_CFG[v] || {};
        return <Badge status={cfg.badge} text={<span style={{ fontWeight: 500 }}>{cfg.label}</span>} />;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          {['ISSUED', 'PARTIAL', 'OVERDUE'].includes(record.status) && (
            <>
              <Tooltip title="Sửa chi tiết">
                <Button type="text" size="small" icon={<EditOutlined />}
                  style={{ color: '#3b82f6' }}
                  onClick={() => setEditInvoice(record)} />
              </Tooltip>
              <Tooltip title="Mã QR Thanh toán">
                <Button type="text" size="small" icon={<QrcodeOutlined />}
                  style={{ color: '#0ea5e9' }}
                  onClick={() => setQrInvoice(record)} />
              </Tooltip>
              <Tooltip title="Thu tiền">
                <Button type="text" size="small" icon={<DollarOutlined />}
                  style={{ color: '#10b981' }}
                  onClick={() => setPayingInvoice(record)} />
              </Tooltip>
            </>
          )}
          {record.status === 'DRAFT' && (
            <Tooltip title="Sửa chi tiết">
              <Button type="text" size="small" icon={<EditOutlined />}
                style={{ color: '#3b82f6' }}
                onClick={() => setEditInvoice(record)} />
            </Tooltip>
          )}
          {record.status !== 'DRAFT' && record.status !== 'VOID' && (
            <Tooltip title="In hóa đơn">
              <Button type="text" size="small" icon={<PrinterOutlined />}
                style={{ color: '#6366f1' }}
                onClick={() => handleDownloadPdf(record._id, record.invoiceNo)} />
            </Tooltip>
          )}
          {['ISSUED', 'PARTIAL', 'DRAFT'].includes(record.status) && (
            <Popconfirm title="Hủy hóa đơn này?" onConfirm={() => handleVoid(record._id)}
              okText="Hủy HĐ" cancelText="Thôi" okButtonProps={{ danger: true }}>
              <Tooltip title="Hủy"><Button type="text" size="small" danger icon={<StopOutlined />} /></Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const totalBalance = invoices.filter(i => i.status !== 'VOID').reduce((s, i) => s + (i.balanceAmount || 0), 0);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Hóa đơn</h2>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>Quản lý và thu tiền hóa đơn</p>
        </div>
        <Space>
          <Button icon={<ThunderboltOutlined />} onClick={() => setBulkOpen(true)}
            style={{ borderRadius: 8, height: 40 }}>
            Tạo hàng loạt
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: 8, height: 40, fontWeight: 600 }}>
            Tạo hóa đơn
          </Button>
        </Space>
      </div>

      {/* Summary + Filter */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <Select
          value={filterStatus || undefined} placeholder="Tất cả trạng thái" allowClear
          onChange={v => setFilterStatus(v || '')} style={{ width: 180 }}
          options={Object.entries(STATUS_CFG).map(([k, v]) => ({ value: k, label: v.label }))}
        />
        <span style={{ color: '#94a3b8' }}>|</span>
        <span style={{ color: '#475569', fontSize: 13 }}>
          Tổng còn lại:{' '}
          <strong style={{ color: totalBalance > 0 ? '#ef4444' : '#10b981' }}>
            {totalBalance.toLocaleString('vi-VN')} ₫
          </strong>
        </span>
        <span style={{ color: '#94a3b8', fontSize: 13, marginLeft: 'auto' }}>
          {invoices.length} hóa đơn
        </span>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
        <Table
          dataSource={invoices} columns={columns} rowKey="_id" loading={loading}
          pagination={{ pageSize: 15, showTotal: t => `${t} hóa đơn`, showSizeChanger: false }}
          locale={{ emptyText: 'Chưa có hóa đơn nào' }}
        />
      </div>

      <CreateInvoiceModal open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={() => fetchInvoices(filterStatus)} />
      <BulkCreateModal open={bulkOpen} onClose={() => setBulkOpen(false)} onSuccess={() => fetchInvoices(filterStatus)} />
      <EditInvoiceModal open={!!editInvoice} invoice={editInvoice} onClose={() => setEditInvoice(null)} onSuccess={() => fetchInvoices(filterStatus)} />
      <PayModal open={!!payingInvoice} invoice={payingInvoice} onClose={() => setPayingInvoice(null)} onSuccess={() => fetchInvoices(filterStatus)} />
      
      <Modal open={!!qrInvoice} onCancel={() => setQrInvoice(null)} footer={null} width={380} title={<span style={{ fontWeight: 700 }}>Thanh toán chuyển khoản</span>}>
        {qrInvoice && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
              Hóa đơn {qrInvoice.invoiceNo} — Phòng {qrInvoice.roomId?.code}
            </div>
            <div style={{ padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', display: 'inline-block' }}>
              <img 
                src={`https://img.vietqr.io/image/MB-035222333444-compact.png?amount=${qrInvoice.balanceAmount}&addInfo=${qrInvoice.invoiceNo}&accountName=NGUYEN VAN CHU NHA`} 
                alt="VietQR" 
                style={{ width: 250, height: 250, objectFit: 'contain' }} 
              />
            </div>
            <div style={{ marginTop: 16, color: '#64748b' }}>
              Sử dụng App Ngân hàng để quét mã QR
            </div>
            <div style={{ marginTop: 8, fontSize: 18, fontWeight: 700, color: '#ef4444' }}>
              {(qrInvoice.balanceAmount || 0).toLocaleString('vi-VN')} ₫
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoiceListPage;
