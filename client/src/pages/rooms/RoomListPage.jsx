// src/pages/rooms/RoomListPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Row, Col, Select, Button, Tag, Tooltip, Modal, Form,
  Input, InputNumber, Popconfirm, Spin, Empty, App, Tabs, Badge, List,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ThunderboltOutlined, ToolOutlined, CloseCircleOutlined,
  CheckCircleOutlined, AppstoreOutlined, UnorderedListOutlined,
} from '@ant-design/icons';
import { propertyApi } from '../../api/property.api';
import { roomApi } from '../../api/room.api';

const STATUS_CFG = {
  AVAILABLE:   { color: '#10b981', bg: '#ecfdf5', border: '#10b981', label: 'Trống', icon: '✓' },
  OCCUPIED:    { color: '#4f46e5', bg: '#eef2ff', border: '#4f46e5', label: 'Đang thuê', icon: '🏠' },
  RESERVED:    { color: '#f59e0b', bg: '#fffbeb', border: '#f59e0b', label: 'Giữ chỗ', icon: '🔖' },
  MAINTENANCE: { color: '#ef4444', bg: '#fef2f2', border: '#ef4444', label: 'Bảo trì', icon: '🔧' },
};

const RoomCard = ({ room, onAction, onEdit }) => {
  const cfg = STATUS_CFG[room.status] || STATUS_CFG.AVAILABLE;

  const getActions = () => {
    switch (room.status) {
      case 'AVAILABLE':
        return [
          { key: 'reserve', label: 'Giữ chỗ',   icon: <ThunderboltOutlined />, color: '#f59e0b' },
          { key: 'maintenance', label: 'Bảo trì', icon: <ToolOutlined />,        color: '#ef4444' },
        ];
      case 'RESERVED':
        return [
          { key: 'cancel-reserve', label: 'Hủy giữ chỗ', icon: <CloseCircleOutlined />, color: '#6b7280' },
        ];
      case 'MAINTENANCE':
        return [
          { key: 'maintenance-complete', label: 'Hoàn thành', icon: <CheckCircleOutlined />, color: '#10b981' },
        ];
      default:
        return [];
    }
  };

  return (
    <div style={{
      background: cfg.bg,
      border: `1.5px solid ${cfg.border}`,
      borderRadius: 12,
      padding: 14,
      cursor: 'pointer',
      transition: 'all 0.18s ease',
      position: 'relative',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Room number */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: cfg.color, lineHeight: 1 }}>
            {room.code}
          </div>
          {room.name && (
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{room.name}</div>
          )}
        </div>
        <div style={{
          background: cfg.color, color: '#fff',
          fontSize: 10, fontWeight: 600, borderRadius: 6,
          padding: '2px 7px', lineHeight: 1.8,
        }}>
          {cfg.label}
        </div>
      </div>

      {/* Info */}
      <div style={{ marginTop: 10, fontSize: 12, color: '#475569' }}>
        <div>{(room.rentAmount || 0).toLocaleString('vi-VN')} ₫/tháng</div>
        {room.area && <div>{room.area} m² · {room.capacity} người</div>}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
        <Tooltip title="Chỉnh sửa">
          <Button
            type="text" size="small" icon={<EditOutlined />}
            style={{ color: '#64748b', padding: '0 6px' }}
            onClick={e => { e.stopPropagation(); onEdit(room); }}
          />
        </Tooltip>
        {getActions().map(action => (
          <Tooltip key={action.key} title={action.label}>
            <Button
              type="text" size="small" icon={action.icon}
              style={{ color: action.color, padding: '0 6px' }}
              onClick={e => { e.stopPropagation(); onAction(room, action.key); }}
            />
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

// Modal tạo/sửa phòng
const RoomModal = ({ open, room, floors, propertyId, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (room) form.setFieldsValue({ ...room, floorId: room.floorId?._id || room.floorId });
    }
  }, [open, room]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (room) {
        await roomApi.update(room._id, values);
        message.success('Cập nhật phòng thành công');
      } else {
        await propertyApi.createRoom(propertyId, values);
        message.success('Tạo phòng thành công');
      }
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
      open={open} onCancel={onClose}
      title={<span style={{ fontWeight: 700 }}>{room ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}</span>}
      footer={null} width={520} destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Row gutter={12}>
          <Col span={10}>
            <Form.Item name="code" label="Mã phòng" rules={[{ required: true, message: 'Nhập mã phòng' }]}>
              <Input placeholder="P101" style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          </Col>
          <Col span={14}>
            <Form.Item name="name" label="Tên phòng (tuỳ chọn)">
              <Input placeholder="Phòng góc tầng 1" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="rentAmount" label="Giá thuê (₫/tháng)" rules={[{ required: true, message: 'Nhập giá thuê' }]}>
              <InputNumber
                style={{ width: '100%' }} min={0} step={100000}
                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                placeholder="2,000,000"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="floorId" label="Tầng">
              <Select placeholder="Chọn tầng" allowClear>
                {floors.map(f => <Select.Option key={f._id} value={f._id}>{f.name}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="area" label="Diện tích (m²)">
              <InputNumber style={{ width: '100%' }} min={0} placeholder="25" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="capacity" label="Sức chứa (người)">
              <InputNumber style={{ width: '100%' }} min={1} placeholder="2" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={2} placeholder="Ghi chú thêm..." />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary" htmlType="submit" loading={loading}
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: 8 }}
          >
            {room ? 'Lưu thay đổi' : 'Tạo phòng'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

// Modal quản lý tầng
const FloorManagementModal = ({ open, propertyId, floors, onClose, refreshFloors }) => {
  const [loading, setLoading] = useState(false);
  const [floorName, setFloorName] = useState('');
  const { message } = App.useApp();

  const handleAdd = async () => {
    if (!floorName.trim()) return;
    setLoading(true);
    try {
      await propertyApi.createFloor(propertyId, { name: floorName });
      message.success('Thêm tầng thành công');
      setFloorName('');
      refreshFloors();
    } catch (err) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (floorId) => {
    try {
      await propertyApi.deleteFloor(propertyId, floorId);
      message.success('Xóa tầng thành công');
      refreshFloors();
    } catch (err) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra (Tầng có thể đang chứa phòng)');
    }
  };

  return (
    <Modal
      open={open} onCancel={onClose}
      title={<span style={{ fontWeight: 700 }}>Quản lý tầng</span>}
      footer={null} width={400}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, marginTop: 12 }}>
        <Input placeholder="Tên tầng (VD: Tầng 1)" value={floorName} onChange={e => setFloorName(e.target.value)} onPressEnter={handleAdd} />
        <Button type="primary" onClick={handleAdd} loading={loading}>Thêm</Button>
      </div>
      <List
        size="small"
        bordered
        dataSource={floors}
        locale={{ emptyText: 'Chưa có tầng nào' }}
        renderItem={item => (
          <List.Item
            actions={[
              <Popconfirm title="Xóa tầng này?" onConfirm={() => handleDelete(item._id)}>
                <Button type="text" danger size="small" icon={<DeleteOutlined />} />
              </Popconfirm>
            ]}
          >
            <span style={{ fontWeight: 600 }}>{item.name}</span>
          </List.Item>
        )}
      />
    </Modal>
  );
};

// ── Main Page ──────────────────────────────────────────────────────
const RoomListPage = () => {
  const { message } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(searchParams.get('propertyId') || '');
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [floorModalOpen, setFloorModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  // Load properties
  useEffect(() => {
    propertyApi.getAll().then(res => {
      const list = res.data || [];
      setProperties(list);
      if (!selectedPropertyId && list.length > 0) {
        setSelectedPropertyId(list[0]._id);
      }
    });
  }, []);

  // Load floors + rooms khi đổi property
  useEffect(() => {
    if (!selectedPropertyId) return;
    setSearchParams({ propertyId: selectedPropertyId });

    Promise.all([
      propertyApi.getFloors(selectedPropertyId),
      propertyApi.getRooms(selectedPropertyId),
    ]).then(([fRes, rRes]) => {
      setFloors(fRes.data || []);
      setRooms(rRes.data || []);
    }).catch(() => message.error('Không thể tải dữ liệu phòng'));
  }, [selectedPropertyId]);

  const refreshRooms = async () => {
    if (!selectedPropertyId) return;
    setLoading(true);
    try {
      const res = await propertyApi.getRooms(selectedPropertyId);
      setRooms(res.data || []);
    } finally { setLoading(false); }
  };

  const refreshFloors = async () => {
    if (!selectedPropertyId) return;
    try {
      const res = await propertyApi.getFloors(selectedPropertyId);
      setFloors(res.data || []);
    } catch (e) {}
  };

  const handleAction = async (room, actionKey) => {
    try {
      switch (actionKey) {
        case 'reserve':            await roomApi.reserve(room._id);            break;
        case 'cancel-reserve':     await roomApi.cancelReserve(room._id);      break;
        case 'maintenance':        await roomApi.startMaintenance(room._id);   break;
        case 'maintenance-complete': await roomApi.completeMaintenance(room._id); break;
      }
      message.success('Cập nhật trạng thái thành công');
      refreshRooms();
    } catch (err) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Group phòng theo tầng
  const filteredRooms = filterStatus ? rooms.filter(r => r.status === filterStatus) : rooms;
  const floorGroups = floors.length > 0
    ? floors.map(f => ({
        floor: f,
        rooms: filteredRooms.filter(r => r.floorId?._id === f._id || r.floorId === f._id),
      })).filter(g => g.rooms.length > 0)
    : [{ floor: null, rooms: filteredRooms }];

  // Tóm tắt trạng thái
  const summary = Object.keys(STATUS_CFG).reduce((acc, s) => {
    acc[s] = rooms.filter(r => r.status === s).length;
    return acc;
  }, {});

  const selectedProperty = properties.find(p => p._id === selectedPropertyId);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Quản lý phòng</h2>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>Sơ đồ và quản lý trạng thái phòng</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            type="default" icon={<AppstoreOutlined />}
            onClick={() => setFloorModalOpen(true)}
            disabled={!selectedPropertyId}
            style={{ borderRadius: 8, height: 40, fontWeight: 600 }}
          >
            Quản lý tầng
          </Button>
          <Button
            type="primary" icon={<PlusOutlined />}
            onClick={() => { setEditingRoom(null); setModalOpen(true); }}
            disabled={!selectedPropertyId}
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: 8, height: 40, fontWeight: 600, color: '#fff' }}
          >
            Thêm phòng
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
        padding: '12px 16px', marginBottom: 16,
        display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
      }}>
        <Select
          value={selectedPropertyId || undefined}
          placeholder="Chọn cơ sở"
          onChange={setSelectedPropertyId}
          style={{ width: 220 }}
          options={properties.map(p => ({ value: p._id, label: p.name }))}
        />

        <Select
          value={filterStatus || undefined}
          placeholder="Tất cả trạng thái"
          allowClear
          onChange={v => setFilterStatus(v || '')}
          style={{ width: 180 }}
        >
          {Object.entries(STATUS_CFG).map(([k, v]) => (
            <Select.Option key={k} value={k}>
              <span style={{ color: v.color }}>● </span>{v.label}
            </Select.Option>
          ))}
        </Select>

        {/* Summary badges */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {Object.entries(STATUS_CFG).map(([status, cfg]) => (
            <div key={status} style={{
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              borderRadius: 8, padding: '4px 10px',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ fontWeight: 700, color: cfg.color, fontSize: 15 }}>{summary[status]}</span>
              <span style={{ fontSize: 12, color: '#64748b' }}>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Room grid by floor */}
      {!selectedPropertyId ? (
        <div style={{ background: '#fff', borderRadius: 14, padding: 60, textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <Empty description={<span style={{ color: '#94a3b8' }}>Chọn cơ sở để xem phòng</span>} />
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
      ) : rooms.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, padding: 60, textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <Empty description={<span style={{ color: '#94a3b8' }}>Cơ sở chưa có phòng nào</span>}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingRoom(null); setModalOpen(true); }} style={{ color: '#fff' }}>
              Thêm phòng đầu tiên
            </Button>
          </Empty>
        </div>
      ) : (
        floorGroups.map(({ floor, rooms: floorRooms }) => (
          <div key={floor?._id || 'no-floor'} style={{ marginBottom: 20 }}>
            {/* Floor label */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
              paddingBottom: 8, borderBottom: '2px solid #e2e8f0',
            }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                {floor ? floor.name : '📋 Chưa phân tầng'}
              </span>
              <Badge count={floorRooms.length} color="#94a3b8" showZero />
            </div>

            <Row gutter={[12, 12]}>
              {floorRooms.map(room => (
                <Col key={room._id} xs={12} sm={8} md={6} lg={4} xl={3}>
                  <RoomCard
                    room={room}
                    onAction={handleAction}
                    onEdit={(r) => { setEditingRoom(r); setModalOpen(true); }}
                  />
                </Col>
              ))}
            </Row>
          </div>
        ))
      )}

      {/* Room modal */}
      <RoomModal
        open={modalOpen}
        room={editingRoom}
        floors={floors}
        propertyId={selectedPropertyId}
        onClose={() => setModalOpen(false)}
        onSuccess={refreshRooms}
      />

      {/* Floor modal */}
      <FloorManagementModal
        open={floorModalOpen}
        propertyId={selectedPropertyId}
        floors={floors}
        onClose={() => setFloorModalOpen(false)}
        refreshFloors={refreshFloors}
      />
    </div>
  );
};

export default RoomListPage;
