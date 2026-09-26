// src/pages/meters/MeterReadingPage.jsx
import { useEffect, useState } from 'react';
import {
  Select, Button, Table, InputNumber, Tag, Row, Col, App, Spin,
  DatePicker, Card, Statistic, Badge,
} from 'antd';
import { ThunderboltOutlined, SaveOutlined, InboxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { propertyApi } from '../../api/property.api';
import { meterApi } from '../../api/meter.api';

const currentPeriod = dayjs().format('YYYY-MM');

const MeterReadingPage = () => {
  const { message } = App.useApp();
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [billingPeriod, setBillingPeriod] = useState(currentPeriod);
  const [rooms, setRooms] = useState([]);
  const [readings, setReadings] = useState({}); // roomId → { electricity, water }
  const [existingReadings, setExistingReadings] = useState({}); // roomId → readings từ DB
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    propertyApi.getAll().then(res => {
      const list = res.data || [];
      setProperties(list);
      if (list.length) setSelectedPropertyId(list[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedPropertyId) return;
    setLoading(true);
    propertyApi.getRooms(selectedPropertyId, { status: 'OCCUPIED' })
      .then(res => setRooms(res.data || []))
      .finally(() => setLoading(false));
  }, [selectedPropertyId]);

  // Lấy chỉ số đã nhập (nếu có) khi đổi kỳ hoặc phòng
  useEffect(() => {
    if (!rooms.length || !billingPeriod) return;
    const fetchExisting = async () => {
      const map = {};
      const newReadings = {}; // Mới: để hiển thị sẵn giá trị vào input
      for (const room of rooms) {
        try {
          const res = await meterApi.getReadings(room._id, billingPeriod);
          const rList = res.data || [];
          map[room._id] = rList;
          
          const elec = rList.find(x => x.meterId?.type === 'ELECTRICITY');
          const water = rList.find(x => x.meterId?.type === 'WATER');
          
          if (elec || water) {
            newReadings[room._id] = {};
            if (elec && elec.currentReading !== undefined) newReadings[room._id].electricity = elec.currentReading;
            if (water && water.currentReading !== undefined) newReadings[room._id].water = water.currentReading;
          }
        } catch { /* ignore */ }
      }
      setExistingReadings(map);
      setReadings(newReadings);
    };
    fetchExisting();
  }, [rooms, billingPeriod]);

  const handleInputChange = (roomId, type, value) => {
    setReadings(prev => ({
      ...prev,
      [roomId]: { ...(prev[roomId] || {}), [type]: value },
    }));
  };

  const handleSaveRoom = async (room) => {
    const roomData = readings[room._id] || {};
    if (roomData.electricity === undefined && roomData.water === undefined) {
      message.warning('Nhập ít nhất một chỉ số điện hoặc nước');
      return;
    }
    setSaving(true);
    try {
      await meterApi.createReading({
        roomId: room._id,
        billingPeriod,
        electricityReading: roomData.electricity,
        waterReading: roomData.water,
      });
      message.success(`Đã lưu chỉ số phòng ${room.code}`);
      // Reload existing
      const res = await meterApi.getReadings(room._id, billingPeriod);
      setExistingReadings(prev => ({ ...prev, [room._id]: res.data || [] }));
    } catch (err) {
      message.error(err.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const getExistingVal = (roomId, meterType) => {
    const list = existingReadings[roomId] || [];
    const r = list.find(x => x.meterId?.type === meterType);
    return r ? { prev: r.previousReading, curr: r.currentReading, consumption: r.consumption } : null;
  };

  const inputCount  = Object.values(readings).filter(v => v.electricity !== undefined || v.water !== undefined).length;
  const savedCount  = Object.keys(existingReadings).filter(rid => (existingReadings[rid] || []).length > 0).length;

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Nhập chỉ số điện nước</h2>
          <p style={{ color: '#94a3b8', marginTop: 4 }}>Nhập chỉ số cho từng phòng đang thuê</p>
        </div>
      </div>

      {/* Toolbar */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px' }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Cơ sở</div>
            <Select
              value={selectedPropertyId || undefined}
              onChange={setSelectedPropertyId}
              style={{ width: '100%' }}
              options={properties.map(p => ({ value: p._id, label: p.name }))}
            />
          </div>
        </Col>
        <Col xs={24} md={6}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px' }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Kỳ thanh toán</div>
            <DatePicker
              picker="month" format="MM/YYYY"
              value={dayjs(billingPeriod, 'YYYY-MM')}
              onChange={d => d && setBillingPeriod(d.format('YYYY-MM'))}
              style={{ width: '100%' }}
            />
          </div>
        </Col>
        <Col xs={12} md={5}>
          <div style={{ background: '#ecfdf5', border: '1px solid #10b981', borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{savedCount}</div>
            <div style={{ fontSize: 12, color: '#065f46' }}>Đã nhập</div>
          </div>
        </Col>
        <Col xs={12} md={5}>
          <div style={{ background: '#fef2f2', border: '1px solid #ef4444', borderRadius: 12, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{rooms.length - savedCount}</div>
            <div style={{ fontSize: 12, color: '#991b1b' }}>Chưa nhập</div>
          </div>
        </Col>
      </Row>

      {/* Rooms list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>
      ) : rooms.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 60, textAlign: 'center' }}>
          <InboxOutlined style={{ fontSize: 48, color: '#cbd5e1' }} />
          <p style={{ color: '#94a3b8', marginTop: 12 }}>Không có phòng nào đang thuê</p>
        </div>
      ) : (
        <Row gutter={[12, 12]}>
          {rooms.map(room => {
            const elecData = getExistingVal(room._id, 'ELECTRICITY');
            const waterData = getExistingVal(room._id, 'WATER');
            const hasSaved = !!(elecData || waterData);

            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={room._id}>
                <div style={{
                  background: '#fff',
                  border: `1.5px solid ${hasSaved ? '#10b981' : '#e2e8f0'}`,
                  borderRadius: 14, padding: 16,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                  {/* Room header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{room.code}</span>
                    {hasSaved
                      ? <Tag color="success">Đã nhập</Tag>
                      : <Tag color="default">Chưa nhập</Tag>}
                  </div>

                  {/* Điện */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: '#f59e0b', fontWeight: 600, fontSize: 13 }}>
                      <ThunderboltOutlined /> Điện (kWh)
                    </div>
                    {elecData && (
                      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                        Kỳ trước: {elecData.prev} → Đã nhập: {elecData.curr} ({elecData.consumption} kWh)
                      </div>
                    )}
                    <InputNumber
                      style={{ width: '100%' }} min={0}
                      placeholder={elecData ? String(elecData.curr) : 'Chỉ số mới'}
                      value={readings[room._id]?.electricity}
                      onChange={v => handleInputChange(room._id, 'electricity', v)}
                    />
                  </div>

                  {/* Nước */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: '#06b6d4', fontWeight: 600, fontSize: 13 }}>
                      💧 Nước (m³)
                    </div>
                    {waterData && (
                      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                        Kỳ trước: {waterData.prev} → Đã nhập: {waterData.curr} ({waterData.consumption} m³)
                      </div>
                    )}
                    <InputNumber
                      style={{ width: '100%' }} min={0}
                      placeholder={waterData ? String(waterData.curr) : 'Chỉ số mới'}
                      value={readings[room._id]?.water}
                      onChange={v => handleInputChange(room._id, 'water', v)}
                    />
                  </div>

                  <Button
                    type="primary" block size="small"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={() => handleSaveRoom(room)}
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: 8 }}
                  >
                    Lưu chỉ số
                  </Button>
                </div>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default MeterReadingPage;
