// src/pages/payments/PaymentListPage.jsx
import { useEffect, useState } from 'react';
import { Table, Select, Tag, Space, DatePicker, App, Row, Col, Statistic } from 'antd';
import { DollarOutlined, CreditCardOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { paymentApi } from '../../api/payment.api';
import { propertyApi } from '../../api/property.api';

const PaymentListPage = () => {
  const { message } = App.useApp();
  const [payments, setPayments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterProperty, setFilterProperty] = useState('');
  const [filterMonth, setFilterMonth] = useState(dayjs().format('YYYY-MM'));

  useEffect(() => {
    propertyApi.getAll().then(res => setProperties(res.data || []));
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterProperty) params.propertyId = filterProperty;
      if (filterMonth) params.month = filterMonth;
      const res = await paymentApi.getAll(params);
      setPayments(res.data || []);
    } catch {
      message.error('Không thể tải danh sách thanh toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, [filterProperty, filterMonth]);

  const columns = [
    {
      title: 'Ngày thanh toán', dataIndex: 'paymentDate', key: 'paymentDate',
      render: v => dayjs(v).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Hóa đơn', dataIndex: 'invoiceId', key: 'invoiceId',
      render: v => <Tag color="blue">{v?.invoiceNo}</Tag>
    },
    {
      title: 'Phòng', dataIndex: 'roomId', key: 'roomId',
      render: v => <span style={{ fontWeight: 600 }}>{v?.code}</span>
    },
    {
      title: 'Khách hàng', dataIndex: 'tenantId', key: 'tenantId',
      render: v => v ? `${v.fullName} (${v.phone})` : '—'
    },
    {
      title: 'Phương thức', dataIndex: 'method', key: 'method',
      render: v => v === 'CASH' 
        ? <Tag color="orange" icon={<MoneyCollectOutlined />}>Tiền mặt</Tag> 
        : <Tag color="cyan" icon={<CreditCardOutlined />}>Chuyển khoản</Tag>
    },
    {
      title: 'Số tiền thu', dataIndex: 'amount', key: 'amount', align: 'right',
      render: v => <span style={{ fontWeight: 700, color: '#10b981' }}>+{(v || 0).toLocaleString('vi-VN')} ₫</span>
    },
    { title: 'Người thu', dataIndex: 'createdBy', key: 'createdBy', render: v => v?.fullName },
  ];

  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Lịch sử Thu tiền</h2>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>Danh sách các khoản thu từ khách thuê</p>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px', marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <DatePicker picker="month" format="MM/YYYY" value={filterMonth ? dayjs(filterMonth, 'YYYY-MM') : null} onChange={d => setFilterMonth(d ? d.format('YYYY-MM') : '')} />
          </Col>
          <Col>
            <Select value={filterProperty || undefined} placeholder="Tất cả cơ sở" allowClear onChange={v => setFilterProperty(v || '')} style={{ width: 200 }}>
              {properties.map(p => <Select.Option key={p._id} value={p._id}>{p.name}</Select.Option>)}
            </Select>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Statistic title="Tổng thu trong kỳ" value={totalCollected} suffix="₫" valueStyle={{ color: '#10b981', fontWeight: 700 }} />
          </Col>
        </Row>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
        <Table dataSource={payments} columns={columns} rowKey="_id" loading={loading} pagination={{ pageSize: 15 }} locale={{ emptyText: 'Chưa có giao dịch thu tiền' }} />
      </div>
    </div>
  );
};

export default PaymentListPage;
