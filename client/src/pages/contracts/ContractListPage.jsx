// src/pages/contracts/ContractListPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Button, Select, Tag, Space, Tooltip, Modal, Form,
  DatePicker, InputNumber, Input, Row, Col, App, Descriptions, Badge,
} from 'antd';
import {
  PlusOutlined, EyeOutlined, FileTextOutlined,
  SyncOutlined, SwapOutlined, StopOutlined, EditOutlined, MinusCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { contractApi } from '../../api/contract.api';
import { propertyApi } from '../../api/property.api';
import { tenantApi } from '../../api/tenant.api';
import CheckoutModal from './CheckoutModal';

const STATUS_CFG = {
  ACTIVE:      { color: 'success',   label: 'Đang thuê' },
  TERMINATED:  { color: 'error',     label: 'Đã thanh lý' },
  VOID:        { color: 'default',   label: 'Đã hủy' },
};

// ── Modal tạo hợp đồng mới ─────────────────────────────────
const CreateContractModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const { message } = App.useApp();

  useEffect(() => {
    if (open) {
      form.resetFields();
      propertyApi.getAll().then(res => setProperties(res.data || []));
      tenantApi.getAll().then(res => setTenants(res.data || []));
    }
  }, [open]);

  const handlePropertyChange = async (pid) => {
    setSelectedProperty(pid);
    setRooms([]);
    form.setFieldValue('roomId', undefined);
    if (pid) {
      const res = await propertyApi.getRooms(pid, { status: 'AVAILABLE,RESERVED' });
      // Lọc chỉ AVAILABLE hoặc RESERVED
      setRooms((res.data || []).filter(r => ['AVAILABLE', 'RESERVED'].includes(r.status)));
    }
  };

  const handleRoomChange = (roomId) => {
    const room = rooms.find(r => r._id === roomId);
    if (room) form.setFieldValue('rentAmount', room.rentAmount);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        propertyId: selectedProperty,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate?.toISOString(),
        depositReceivedDate: values.depositReceivedDate?.toISOString() || new Date().toISOString(),
        paymentDueDay: Number(values.paymentDueDay) || 5,
      };
      await contractApi.create(payload);
      message.success('Tạo hợp đồng và cập nhật phòng thành công!');
      onSuccess();
      onClose();
    } catch (err) {
      const errData = err.response?.data;
      // Hiển thị chi tiết lỗi validation
      if (errData?.errors && errData.errors.length > 0) {
        const detail = errData.errors.map(e => `${e.field}: ${e.message}`).join(', ');
        message.error(`${errData.message} — ${detail}`);
      } else {
        message.error(errData?.message || 'Có lỗi xảy ra');
      }
      console.error('Contract create error:', errData || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open} onCancel={onClose} footer={null} width={680} destroyOnClose
      title={<span style={{ fontWeight: 700 }}>Tạo hợp đồng thuê phòng</span>}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
        {/* Cơ sở + Phòng */}
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="propertyId_select" label="Cơ sở">
              <Select
                placeholder="Chọn cơ sở"
                onChange={handlePropertyChange}
                options={properties.map(p => ({ value: p._id, label: p.name }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="roomId" label="Phòng" rules={[{ required: true, message: 'Chọn phòng' }]}>
              <Select
                placeholder="Chọn phòng trống"
                disabled={!selectedProperty}
                onChange={handleRoomChange}
                options={rooms.map(r => ({ value: r._id, label: `${r.code}${r.name ? ` — ${r.name}` : ''}` }))}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Khách thuê chính */}
        <Form.Item name="primaryTenantId" label="Khách thuê chính" rules={[{ required: true, message: 'Chọn khách thuê' }]}>
          <Select
            placeholder="Tìm khách thuê..."
            showSearch
            filterOption={(input, opt) => opt.label?.toLowerCase().includes(input.toLowerCase())}
            options={tenants.map(t => ({ value: t._id, label: `${t.fullName} — ${t.phone}` }))}
          />
        </Form.Item>

        {/* Ngày */}
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: 'Chọn ngày bắt đầu' }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="endDate" label="Ngày kết thúc (để trống = dài hạn)">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
            </Form.Item>
          </Col>
        </Row>

        {/* Tiền */}
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item name="rentAmount" label="Giá thuê (₫/tháng)" rules={[{ required: true, message: 'Nhập giá thuê' }]}>
              <InputNumber
                style={{ width: '100%' }} min={0} step={100000}
                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="depositAmount" label="Tiền cọc (₫)">
              <InputNumber
                style={{ width: '100%' }} min={0} step={500000}
                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="paymentDueDay" label="Ngày đóng tiền" initialValue={5}>
              <Select
                placeholder="Chọn ngày"
                options={[
                  ...[...Array(30).keys()].map(i => ({ value: i + 1, label: `Ngày ${i + 1} hàng tháng` })),
                  { value: 31, label: '📅 Ngày cuối tháng' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={2} placeholder="Ghi chú hợp đồng..." />
        </Form.Item>

        <div style={{ fontWeight: 600, marginBottom: 8, marginTop: 16 }}>Định phí cố định hàng tháng (Tuỳ chọn)</div>
        <Form.List name="customFees">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'name']}
                    rules={[{ required: true, message: 'Nhập tên phí' }]}
                  >
                    <Input placeholder="Tên (VD: Wifi, Rác)" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'amount']}
                    rules={[{ required: true, message: 'Nhập số tiền' }]}
                  >
                    <InputNumber placeholder="Số tiền" min={0} step={10000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ef4444' }} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm định phí (Wifi, Rác, Gửi xe...)
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary" htmlType="submit" loading={loading}
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: 8 }}
          >
            Ký hợp đồng
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

// ── Modal sửa hợp đồng ─────────────────────────────────────
const EditContractModal = ({ open, contract, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (open && contract) {
      form.setFieldsValue({
        rentAmount: contract.rentAmount,
        depositAmount: contract.depositAmount,
        paymentDueDay: contract.paymentDueDay,
        startDate: dayjs(contract.startDate),
        endDate: contract.endDate ? dayjs(contract.endDate) : undefined,
        note: contract.note,
        customFees: contract.customFees || [],
      });
    }
  }, [open, contract]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate?.toISOString() || null,
      };
      await contractApi.update(contract._id, payload);
      message.success('Cập nhật hợp đồng thành công!');
      onSuccess();
      onClose();
    } catch (err) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open} onCancel={onClose} footer={null} width={500} destroyOnClose
      title={<span style={{ fontWeight: 700 }}>Chỉnh sửa hợp đồng</span>}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: 'Chọn ngày bắt đầu' }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="endDate" label="Ngày kết thúc (để trống = dài hạn)">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="dd/mm/yyyy" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item name="rentAmount" label="Giá thuê" rules={[{ required: true, message: 'Nhập giá thuê' }]}>
              <InputNumber style={{ width: '100%' }} min={0} step={100000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="depositAmount" label="Tiền cọc">
              <InputNumber style={{ width: '100%' }} min={0} step={500000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="paymentDueDay" label="Ngày thu tiền" rules={[{ required: true, message: 'Nhập ngày' }]} tooltip="Nhập 31 nếu muốn luôn lấy ngày cuối cùng của tháng">
              <InputNumber style={{ width: '100%' }} min={1} max={31} placeholder="1-31" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={2} placeholder="Ghi chú hợp đồng..." />
        </Form.Item>

        <div style={{ fontWeight: 600, marginBottom: 8, marginTop: 16 }}>Định phí cố định hàng tháng (Tuỳ chọn)</div>
        <Form.List name="customFees">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: 'Nhập tên' }]}>
                    <Input placeholder="Tên (VD: Wifi, Rác)" />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, 'amount']} rules={[{ required: true, message: 'Nhập tiền' }]}>
                    <InputNumber placeholder="Số tiền" min={0} step={10000} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ef4444' }} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm định phí</Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading} style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none' }}>
            Lưu thay đổi
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

// ── Modal thanh lý ─────────────────────────────────────────
const TerminateModal = ({ open, contract, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await contractApi.terminate(contract._id, {
        terminationDate: values.terminationDate?.toISOString() || new Date().toISOString(),
        terminationNote: values.terminationNote,
      });
      message.success('Đã thanh lý hợp đồng. Phòng chuyển về AVAILABLE.');
      onSuccess();
      onClose();
    } catch (err) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open} onCancel={onClose} footer={null} width={440} destroyOnClose
      title={<span style={{ fontWeight: 700, color: '#ef4444' }}>⚠️ Thanh lý hợp đồng</span>}
    >
      {contract && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <div style={{ color: '#991b1b', fontWeight: 600 }}>
            Phòng {contract.roomId?.code} — {contract.primaryTenantId?.fullName}
          </div>
          <div style={{ color: '#b91c1c', fontSize: 13 }}>
            Hành động này sẽ kết thúc hợp đồng và giải phóng phòng.
          </div>
        </div>
      )}
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="terminationDate" label="Ngày thanh lý">
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" defaultValue={dayjs()} />
        </Form.Item>
        <Form.Item name="terminationNote" label="Lý do / Ghi chú">
          <Input.TextArea rows={3} placeholder="Khách tự nguyện chuyển đi, phòng sạch sẽ..." />
        </Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button danger type="primary" htmlType="submit" loading={loading}>
            Xác nhận thanh lý
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

// ── Main Page ──────────────────────────────────────────────
const ContractListPage = () => {
  const { message } = App.useApp();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ACTIVE');
  const [createOpen, setCreateOpen] = useState(false);
  const [editContract, setEditContract] = useState(null);
  const [checkoutContract, setCheckoutContract] = useState(null);

  const fetchContracts = async (status = '') => {
    setLoading(true);
    try {
      const params = status ? { status } : {};
      const res = await contractApi.getAll(params);
      setContracts(res.data || []);
    } catch {
      message.error('Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContracts(filterStatus); }, [filterStatus]);

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
      const reason = window.prompt('Nhập lý do hủy hợp đồng:', 'Tạo nhầm');
      if (!reason) return;
      
      await contractApi.void(id, { reason });
      message.success('Đã hủy hợp đồng thành công');
      fetchContracts(filterStatus);
    } catch (err) {
      message.error(err.response?.data?.message || 'Lỗi khi hủy hợp đồng');
    }
  };

  const columns = [
    {
      title: 'Số HĐ',
      dataIndex: 'contractNo',
      key: 'contractNo',
      ...getColumnSearchProps('contractNo'),
      render: v => <Tag color="blue" style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v}</Tag>,
    },
    {
      title: 'Phòng',
      dataIndex: 'roomId',
      key: 'roomId',
      ...getColumnSearchProps('roomId', 'code'),
      render: v => v ? <Tag>{v.code}</Tag> : '—',
    },
    {
      title: 'Khách thuê chính',
      dataIndex: 'primaryTenantId',
      key: 'primaryTenantId',
      ...getColumnSearchProps('primaryTenantId', 'fullName'),
      render: v => v ? (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{v.fullName}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{v.phone}</div>
        </div>
      ) : '—',
    },
    {
      title: 'Cơ sở',
      dataIndex: 'propertyId',
      key: 'propertyId',
      ...getColumnSearchProps('propertyId', 'name'),
      render: v => v ? <span style={{ color: '#475569' }}>{v.name}</span> : '—',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      ...getColumnDateRangeProps('startDate'),
      render: v => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      ...getColumnDateRangeProps('endDate'),
      render: v => v ? (
        <span style={{ color: dayjs(v).diff(dayjs(), 'day') < 30 ? '#f59e0b' : '#475569' }}>
          {dayjs(v).format('DD/MM/YYYY')}
        </span>
      ) : <span style={{ color: '#94a3b8' }}>Dài hạn</span>,
    },
    {
      title: 'Giá thuê',
      dataIndex: 'rentAmount',
      key: 'rentAmount',
      align: 'right',
      render: v => <span style={{ fontWeight: 600 }}>{(v || 0).toLocaleString('vi-VN')} ₫</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: v => {
        const cfg = STATUS_CFG[v] || {};
        return <Badge status={cfg.color} text={<span style={{ fontWeight: 500 }}>{cfg.label}</span>} />;
      },
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Space>
          {record.status === 'ACTIVE' && (
            <>
              <Tooltip title="Chỉnh sửa">
                <Button type="text" size="small" icon={<EditOutlined style={{ color: '#3b82f6' }}/>} onClick={() => setEditContract(record)} />
              </Tooltip>
              <Tooltip title="Trả phòng / Thanh lý">
                <Button type="text" size="small" danger icon={<StopOutlined />} onClick={() => setCheckoutContract(record)} />
              </Tooltip>
              <Tooltip title="Hủy hợp đồng (Xóa nháp)">
                <Button type="text" size="small" danger icon={<MinusCircleOutlined />} onClick={() => handleVoid(record._id)} />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Hợp đồng</h2>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>Quản lý hợp đồng thuê phòng</p>
        </div>
        <Button
          type="primary" icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
          style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: 8, height: 40, fontWeight: 600 }}
        >
          Ký hợp đồng mới
        </Button>
      </div>

      {/* Filter */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <Select
          value={filterStatus || undefined}
          placeholder="Tất cả trạng thái"
          allowClear
          onChange={v => setFilterStatus(v || '')}
          style={{ width: 200 }}
          options={Object.entries(STATUS_CFG).map(([k, v]) => ({ value: k, label: v.label }))}
        />
        <span style={{ color: '#94a3b8', fontSize: 13 }}>{contracts.length} hợp đồng</span>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
        <Table
          dataSource={contracts}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 15, showTotal: (t) => `${t} hợp đồng`, showSizeChanger: false }}
          locale={{ emptyText: 'Chưa có hợp đồng nào' }}
        />
      </div>

      <CreateContractModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => fetchContracts(filterStatus)}
      />

      <EditContractModal
        open={!!editContract}
        contract={editContract}
        onClose={() => setEditContract(null)}
        onSuccess={() => fetchContracts(filterStatus)}
      />

      <CheckoutModal
        open={!!checkoutContract}
        contract={checkoutContract}
        onClose={() => setCheckoutContract(null)}
        onSuccess={() => fetchContracts(filterStatus)}
      />
    </div>
  );
};

export default ContractListPage;
