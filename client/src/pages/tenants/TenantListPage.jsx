// src/pages/tenants/TenantListPage.jsx
import { useEffect, useState } from 'react';
import {
  Table, Button, Input, Space, Tag, Tooltip, Popconfirm,
  Modal, Form, Select, DatePicker, Row, Col, App, Avatar,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  SearchOutlined, UserOutlined, PhoneOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { tenantApi } from '../../api/tenant.api';

const GENDER_LABEL = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };
const GENDER_COLOR = { MALE: 'blue', FEMALE: 'pink', OTHER: 'default' };

// ── Form Modal ─────────────────────────────────────────────
const TenantModal = ({ open, tenant, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (tenant) {
        form.setFieldsValue({
          ...tenant,
          dateOfBirth: tenant.dateOfBirth ? dayjs(tenant.dateOfBirth) : null,
          identityIssueDate: tenant.identityIssueDate ? dayjs(tenant.identityIssueDate) : null,
        });
      }
    }
  }, [open, tenant]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth?.toISOString(),
        identityIssueDate: values.identityIssueDate?.toISOString(),
      };
      if (tenant) {
        await tenantApi.update(tenant._id, payload);
        message.success('Cập nhật khách thuê thành công');
      } else {
        await tenantApi.create(payload);
        message.success('Thêm khách thuê thành công');
      }
      onSuccess();
      onClose();
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open} onCancel={onClose} footer={null} width={680} destroyOnClose
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)' }} icon={<UserOutlined />} />
          <span style={{ fontWeight: 700 }}>{tenant ? 'Cập nhật khách thuê' : 'Thêm khách thuê mới'}</span>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Row gutter={12}>
          <Col span={14}>
            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
              <Input placeholder="Nguyễn Văn A" prefix={<UserOutlined style={{ color: '#94a3b8' }} />} />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="gender" label="Giới tính">
              <Select placeholder="Chọn giới tính" allowClear>
                <Select.Option value="MALE">Nam</Select.Option>
                <Select.Option value="FEMALE">Nữ</Select.Option>
                <Select.Option value="OTHER">Khác</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Nhập số điện thoại' }]}>
              <Input placeholder="0901234567" prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="dateOfBirth" label="Ngày sinh">
              <DatePicker style={{ width: '100%' }} placeholder="dd/mm/yyyy" format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="identityNumber" label="Số CCCD/CMND">
              <Input placeholder="012345678901" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="identityIssueDate" label="Ngày cấp">
              <DatePicker style={{ width: '100%' }} placeholder="dd/mm/yyyy" format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={24}>
            <Form.Item name="identityIssuePlace" label="Nơi cấp">
              <Input placeholder="Cục Cảnh sát QLHC về TTXH" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="vehiclePlate" label="Biển số xe">
              <Input placeholder="51A-12345" style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="zalo" label="Zalo">
              <Input placeholder="SĐT Zalo" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="email" label="Email">
              <Input placeholder="example@gmail.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="hometown" label="Quê quán">
              <Input placeholder="Hà Nội" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="permanentAddress" label="Địa chỉ thường trú">
          <Input placeholder="123 Đường ABC, Quận 1, TP.HCM" />
        </Form.Item>

        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={2} placeholder="Ghi chú thêm..." />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary" htmlType="submit" loading={loading}
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: 8 }}
          >
            {tenant ? 'Lưu thay đổi' : 'Thêm khách thuê'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

// ── Main Page ──────────────────────────────────────────────────────
const TenantListPage = () => {
  const { message } = App.useApp();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);

  const fetchTenants = async (searchVal = '') => {
    setLoading(true);
    try {
      const params = searchVal ? { search: searchVal } : {};
      const res = await tenantApi.getAll(params);
      setTenants(res.data || []);
    } catch {
      message.error('Không thể tải danh sách khách thuê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenants(); }, []);

  const handleDelete = async (id) => {
    try {
      await tenantApi.remove(id);
      message.success('Đã xóa khách thuê');
      fetchTenants(search);
    } catch (err) {
      message.error(err.message || 'Xóa thất bại');
    }
  };

  const columns = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar
            size={36}
            style={{
              background: record.gender === 'FEMALE'
                ? 'linear-gradient(135deg, #f472b6, #db2777)'
                : 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              fontSize: 14, fontWeight: 600, flexShrink: 0,
            }}
          >
            {name?.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{name}</div>
            {record.email && <div style={{ fontSize: 12, color: '#94a3b8' }}>{record.email}</div>}
          </div>
        </div>
      ),
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 90,
      render: v => v ? <Tag color={GENDER_COLOR[v]}>{GENDER_LABEL[v]}</Tag> : '—',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: v => <span style={{ fontFamily: 'monospace' }}>{v}</span>,
    },
    {
      title: 'CCCD/CMND',
      dataIndex: 'identityNumber',
      key: 'identityNumber',
      render: v => v ? <span style={{ fontFamily: 'monospace', color: '#475569' }}>{v}</span> : '—',
    },
    {
      title: 'Biển số xe',
      dataIndex: 'vehiclePlate',
      key: 'vehiclePlate',
      render: v => v ? <Tag>{v.toUpperCase()}</Tag> : '—',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: v => v ? dayjs(v).format('DD/MM/YYYY') : '—',
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text" size="small" icon={<EditOutlined />}
              onClick={() => { setEditingTenant(record); setModalOpen(true); }}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa khách thuê này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" size="small" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Khách thuê</h2>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>Quản lý thông tin khách thuê</p>
        </div>
        <Button
          type="primary" icon={<PlusOutlined />}
          onClick={() => { setEditingTenant(null); setModalOpen(true); }}
          style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: 8, height: 40, fontWeight: 600 }}
        >
          Thêm khách thuê
        </Button>
      </div>

      {/* Search */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          placeholder="Tìm theo tên, SĐT, CCCD..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onPressEnter={() => fetchTenants(search)}
          allowClear
          onClear={() => { setSearch(''); fetchTenants(''); }}
          style={{ maxWidth: 340, borderRadius: 8 }}
        />
        <Button
          type="primary" ghost style={{ marginLeft: 8, borderRadius: 8 }}
          onClick={() => fetchTenants(search)}
        >
          Tìm kiếm
        </Button>
        <span style={{ marginLeft: 12, color: '#94a3b8', fontSize: 13 }}>
          {tenants.length} khách thuê
        </span>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
        <Table
          dataSource={tenants}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 15, showTotal: (t) => `${t} khách thuê`, showSizeChanger: false }}
          locale={{ emptyText: 'Chưa có khách thuê nào' }}
        />
      </div>

      <TenantModal
        open={modalOpen}
        tenant={editingTenant}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchTenants(search)}
      />
    </div>
  );
};

export default TenantListPage;
