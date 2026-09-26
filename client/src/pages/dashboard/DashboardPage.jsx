// src/pages/dashboard/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { Row, Col, Typography, Table, Tag, Badge, Spin, App, Button } from 'antd';
import {
  HomeOutlined, CheckCircleOutlined, ToolOutlined,
  WarningOutlined, DollarOutlined, AppstoreOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { dashboardApi } from '../../api/dashboard.api';
import { invoiceApi } from '../../api/invoice.api';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

const { Text } = Typography;

const DashboardPage = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [overdueInvoices, setOverdueInvoices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashRes, invRes] = await Promise.all([
          dashboardApi.getOverview(),
          invoiceApi.getAll({ status: 'OVERDUE' })
        ]);
        setData(dashRes.data);
        setOverdueInvoices(invRes.data || []);
      } catch (err) {
        message.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const overdueColumns = [
    { title: 'Phòng', dataIndex: 'roomId', key: 'roomId', render: v => <Tag color="blue">{v?.code}</Tag> },
    { title: 'Khách thuê', dataIndex: 'tenantId', key: 'tenantId', render: v => v?.fullName },
    { title: 'Số tiền nợ', dataIndex: 'balanceAmount', key: 'balanceAmount', align: 'right',
      render: v => <span style={{ fontWeight: 600, color: '#ef4444' }}>{v?.toLocaleString('vi-VN')} ₫</span> },
    { title: 'Hạn chót', dataIndex: 'dueDate', key: 'dueDate',
      render: v => {
        const days = dayjs().diff(dayjs(v), 'day');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span>{dayjs(v).format('DD/MM/YYYY')}</span>
            <Tag color="red" style={{ margin: 0, width: 'fit-content' }}>Quá hạn {days} ngày</Tag>
          </div>
        );
      } 
    },
  ];

  if (loading || !data) {
    return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>;
  }

  const statsData = [
    { title: 'Cơ sở quản lý',    value: data.propertyCount,        icon: <HomeOutlined />,         color: '#4f46e5', bg: '#eef2ff' },
    { title: 'Tổng số phòng',    value: data.roomCount,            icon: <AppstoreOutlined />,     color: '#6366f1', bg: '#e0e7ff' },
    { title: 'Đang thuê',        value: data.occupiedRoomCount,    icon: <CheckCircleOutlined />,  color: '#10b981', bg: '#ecfdf5' },
    { title: 'Đang bảo trì',     value: data.maintenanceRoomCount, icon: <ToolOutlined />,         color: '#f59e0b', bg: '#fffbeb' },
    { title: 'Hợp đồng active',  value: data.activeContracts,      icon: <CheckCircleOutlined />,  color: '#0ea5e9', bg: '#e0f2fe' },
    { title: 'Cọc đang giữ',     value: `${(data.totalDepositHeld / 1000000).toFixed(1)}M ₫`,   icon: <DollarOutlined />, color: '#14b8a6', bg: '#ccfbf1' },
  ];

  const financeData = [
    { title: 'Doanh thu tháng này', value: `${(data.currentMonthRevenue / 1000000).toFixed(1)}M ₫`, color: '#10b981', bg: '#ecfdf5' },
    { title: 'Tổng công nợ',        value: `${(data.totalDebt / 1000000).toFixed(1)}M ₫`, color: '#ef4444', bg: '#fef2f2' },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Dashboard</h2>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>Tổng quan hoạt động nhà trọ tháng {dayjs().format('MM/YYYY')}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/meter-readings"><Button icon={<ThunderboltOutlined />}>Chốt điện nước</Button></Link>
          <Link to="/invoices"><Button type="primary">Hóa đơn & Thu tiền</Button></Link>
        </div>
      </div>

      {/* Stats row 1: Finance */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {financeData.map((s, i) => (
          <Col xs={24} md={12} key={i}>
             <div style={{ background: s.bg, border: `1px solid ${s.color}40`, borderRadius: 14, padding: 20 }}>
               <div style={{ fontSize: 13, color: '#475569', fontWeight: 600, marginBottom: 8 }}>{s.title}</div>
               <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
             </div>
          </Col>
        ))}
      </Row>

      {/* Stats row 2: Rooms & Contracts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsData.map((s, i) => (
          <Col xs={12} sm={8} xl={4} key={i}>
            <div className="stat-card" style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text style={{ color: '#94a3b8', fontSize: 12, display: 'block', marginBottom: 6 }}>
                    {s.title}
                  </Text>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
                    {s.value}
                  </div>
                </div>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: s.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: s.color,
                }}>
                  {s.icon}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <div className="swan-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <WarningOutlined style={{ color: '#ef4444' }} />
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Hóa đơn quá hạn ({data.overdueInvoicesCount})</span>
            </div>
            <Table 
              dataSource={overdueInvoices} 
              columns={overdueColumns} 
              pagination={{ pageSize: 5 }} 
              size="small" 
              rowKey="_id"
              locale={{ emptyText: 'Không có hóa đơn quá hạn' }}
            />
          </div>
        </Col>

        <Col xs={24} xl={10}>
          <div className="swan-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <CheckCircleOutlined style={{ color: '#10b981' }} />
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Trạng thái phòng</span>
            </div>
            <div style={{ padding: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span>Đang thuê</span>
                <span style={{ fontWeight: 600 }}>{data.occupiedRoomCount} / {data.roomCount}</span>
              </div>
              <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
                <div style={{ width: `${(data.occupiedRoomCount / (data.roomCount || 1)) * 100}%`, height: '100%', background: '#10b981' }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span>Trống</span>
                <span style={{ fontWeight: 600 }}>{data.availableRoomCount} / {data.roomCount}</span>
              </div>
              <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(data.availableRoomCount / (data.roomCount || 1)) * 100}%`, height: '100%', background: '#0ea5e9' }}></div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
