// src/pages/properties/PropertyListPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row, Col, Button, Tag, Tooltip, Popconfirm,
  Spin, Empty, App, Typography, Space,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  HomeOutlined, EyeOutlined, AppstoreOutlined,
} from '@ant-design/icons';
import { propertyApi } from '../../api/property.api';

const { Text } = Typography;

const statusColors = {
  AVAILABLE:   { color: '#10b981', bg: '#ecfdf5', label: 'Trống' },
  OCCUPIED:    { color: '#4f46e5', bg: '#eef2ff', label: 'Thuê' },
  RESERVED:    { color: '#f59e0b', bg: '#fffbeb', label: 'Giữ' },
  MAINTENANCE: { color: '#ef4444', bg: '#fef2f2', label: 'Sửa' },
};

const PropertyCard = ({ property, onEdit, onDelete, onViewRooms }) => {
  const { roomStats = {} } = property;

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 14,
      padding: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      transition: 'all 0.18s ease',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: '#4f46e5', flexShrink: 0,
          }}>
            <HomeOutlined />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', lineHeight: 1.3 }}>
              {property.name}
            </div>
            <Tag color="blue" style={{ marginTop: 3, fontSize: 11 }}>{property.code}</Tag>
          </div>
        </div>

        <Space>
          <Tooltip title="Xem phòng">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => onViewRooms(property._id)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(property._id)} />
          </Tooltip>
          <Popconfirm
            title="Xóa cơ sở này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => onDelete(property._id)}
            okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" size="small" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      </div>

      {/* Address */}
      {property.address && (
        <div style={{ color: '#64748b', fontSize: 13, marginBottom: 14 }}>📍 {property.address}</div>
      )}

      {/* Room stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
        padding: '12px 0',
        borderTop: '1px solid #f1f5f9',
      }}>
        {Object.entries(statusColors).map(([status, cfg]) => (
          <div key={status} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 20, fontWeight: 700, color: cfg.color,
              lineHeight: 1,
            }}>
              {roomStats[status] || 0}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{cfg.label}</div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 10, borderTop: '1px solid #f1f5f9',
      }}>
        <span style={{ fontSize: 13, color: '#64748b' }}>
          <AppstoreOutlined style={{ marginRight: 5 }} />
          Tổng cộng: <strong>{roomStats.total || 0}</strong> phòng
        </span>
        {property.owner?.name && (
          <span style={{ fontSize: 12, color: '#94a3b8' }}>👤 {property.owner.name}</span>
        )}
      </div>
    </div>
  );
};

const PropertyListPage = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await propertyApi.getAll();
      setProperties(res.data || []);
    } catch {
      message.error('Không thể tải danh sách cơ sở');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  const handleDelete = async (id) => {
    try {
      await propertyApi.remove(id);
      message.success('Đã xóa cơ sở');
      fetchProperties();
    } catch (err) {
      message.error(err.message || 'Xóa thất bại');
    }
  };

  return (
    <div className="fade-in">
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Cơ sở</h2>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>Quản lý danh sách cơ sở nhà trọ</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/properties/new')}
          style={{
            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
            border: 'none', borderRadius: 8, height: 40, fontWeight: 600,
          }}
        >
          Thêm cơ sở
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : properties.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
          padding: '80px 20px', textAlign: 'center',
        }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span style={{ color: '#94a3b8' }}>Chưa có cơ sở nào. Hãy tạo cơ sở đầu tiên!</span>}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/properties/new')}>
              Tạo cơ sở
            </Button>
          </Empty>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {properties.map(p => (
            <Col xs={24} md={12} xl={8} key={p._id}>
              <PropertyCard
                property={p}
                onEdit={(id) => navigate(`/properties/${id}/edit`)}
                onDelete={handleDelete}
                onViewRooms={(id) => navigate(`/rooms?propertyId=${id}`)}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default PropertyListPage;
