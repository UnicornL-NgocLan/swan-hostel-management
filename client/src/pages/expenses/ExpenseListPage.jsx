// src/pages/expenses/ExpenseListPage.jsx
import { useEffect, useState } from 'react';
import {
  Table, Button, Select, Tag, Space, Popconfirm,
  Modal, Form, InputNumber, DatePicker, Input, Row, Col, App, Radio
} from 'antd';
import { PlusOutlined, DeleteOutlined, FallOutlined, RiseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { expenseApi } from '../../api/expense.api';
import { propertyApi } from '../../api/property.api';

const CreateExpenseModal = ({ open, onClose, onSuccess, properties }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (properties.length) form.setFieldValue('propertyId', properties[0]._id);
    }
  }, [open, properties]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await expenseApi.create({
        ...values,
        expenseDate: values.expenseDate?.toISOString() || new Date().toISOString()
      });
      message.success('Tạo phiếu thành công');
      onSuccess();
      onClose();
    } catch (err) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} title={<span style={{ fontWeight: 700 }}>Tạo phiếu Thu / Chi</span>}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ type: 'EXPENSE', paymentMethod: 'CASH', expenseDate: dayjs() }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="propertyId" label="Cơ sở" rules={[{ required: true }]}>
              <Select options={properties.map(p => ({ value: p._id, label: p.name }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="type" label="Loại phiếu">
              <Radio.Group optionType="button" buttonStyle="solid">
                <Radio.Button value="INCOME">Thu</Radio.Button>
                <Radio.Button value="EXPENSE">Chi</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="amount" label="Số tiền (₫)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={1} formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="category" label="Danh mục (VD: Sửa chữa)" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="expenseDate" label="Ngày chứng từ">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="paymentMethod" label="Phương thức">
              <Select>
                <Select.Option value="CASH">Tiền mặt</Select.Option>
                <Select.Option value="TRANSFER">Chuyển khoản</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="description" label="Diễn giải" rules={[{ required: true }]}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading} style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none' }}>
            Xác nhận
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

const ExpenseListPage = () => {
  const { message } = App.useApp();
  const [expenses, setExpenses] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  
  const [filterType, setFilterType] = useState('');
  const [filterMonth, setFilterMonth] = useState(dayjs().format('YYYY-MM'));

  useEffect(() => {
    propertyApi.getAll().then(res => setProperties(res.data || []));
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterMonth) params.month = filterMonth;
      const res = await expenseApi.getAll(params);
      setExpenses(res.data || []);
    } catch {
      message.error('Không thể tải danh sách thu chi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, [filterType, filterMonth]);

  const handleDelete = async (id) => {
    try {
      await expenseApi.remove(id);
      message.success('Đã xóa phiếu');
      fetchExpenses();
    } catch (err) {
      message.error('Lỗi khi xóa');
    }
  };

  const columns = [
    {
      title: 'Ngày', dataIndex: 'expenseDate', key: 'expenseDate',
      render: v => dayjs(v).format('DD/MM/YYYY')
    },
    {
      title: 'Loại', dataIndex: 'type', key: 'type',
      render: v => v === 'INCOME' 
        ? <Tag color="success" icon={<RiseOutlined />}>Phiếu thu</Tag> 
        : <Tag color="error" icon={<FallOutlined />}>Phiếu chi</Tag>
    },
    { title: 'Danh mục', dataIndex: 'category', key: 'category', render: v => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Diễn giải', dataIndex: 'description', key: 'description' },
    {
      title: 'Số tiền', dataIndex: 'amount', key: 'amount', align: 'right',
      render: (v, record) => (
        <span style={{ fontWeight: 600, color: record.type === 'INCOME' ? '#10b981' : '#ef4444' }}>
          {record.type === 'INCOME' ? '+' : '-'}{(v || 0).toLocaleString('vi-VN')} ₫
        </span>
      )
    },
    { title: 'Người lập', dataIndex: 'createdBy', key: 'createdBy', render: v => v?.fullName },
    {
      title: '', key: 'action', width: 60,
      render: (_, record) => (
        <Popconfirm title="Xóa phiếu này?" onConfirm={() => handleDelete(record._id)} okButtonProps={{ danger: true }}>
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      )
    }
  ];

  const totalIncome = expenses.filter(e => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0);
  const totalExpense = expenses.filter(e => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Sổ Thu Chi</h2>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>Quản lý các khoản thu chi ngoài tiền phòng</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}
          style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: 8, height: 40, fontWeight: 600 }}>
          Lập phiếu
        </Button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <DatePicker picker="month" format="MM/YYYY" value={filterMonth ? dayjs(filterMonth, 'YYYY-MM') : null} onChange={d => setFilterMonth(d ? d.format('YYYY-MM') : '')} />
        <Select value={filterType || undefined} placeholder="Tất cả" allowClear onChange={v => setFilterType(v || '')} style={{ width: 120 }}>
          <Select.Option value="INCOME">Phiếu thu</Select.Option>
          <Select.Option value="EXPENSE">Phiếu chi</Select.Option>
        </Select>
        <span style={{ color: '#94a3b8' }}>|</span>
        <span style={{ color: '#10b981', fontWeight: 600 }}>Tổng thu: {totalIncome.toLocaleString('vi-VN')} ₫</span>
        <span style={{ color: '#ef4444', fontWeight: 600 }}>Tổng chi: {totalExpense.toLocaleString('vi-VN')} ₫</span>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
        <Table dataSource={expenses} columns={columns} rowKey="_id" loading={loading} pagination={{ pageSize: 15 }} locale={{ emptyText: 'Chưa có giao dịch' }} />
      </div>

      <CreateExpenseModal open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={fetchExpenses} properties={properties} />
    </div>
  );
};

export default ExpenseListPage;
