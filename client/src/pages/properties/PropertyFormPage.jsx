// src/pages/properties/PropertyFormPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form, Input, Button, Card, Row, Col, Divider,
  Select, InputNumber, App, Spin, List, Popconfirm,
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined, PlusOutlined, MinusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { propertyApi } from '../../api/property.api';

const { TextArea } = Input;
const BANK_CODES = [
  'VCB', 'TCB', 'ACB', 'MB', 'BIDV', 'VTB', 'VPB', 'SHB', 'MSB', 'OCB', 'Khác'
];

const PropertyFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [floors, setFloors] = useState([]);
  const [floorName, setFloorName] = useState('');
  const [floorLoading, setFloorLoading] = useState(false);

  const fetchFloors = async () => {
    try {
      const res = await propertyApi.getFloors(id);
      setFloors(res.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    if (isEdit) {
      Promise.all([
        propertyApi.getById(id),
        propertyApi.getFloors(id)
      ])
        .then(([propRes, floorRes]) => {
          form.setFieldsValue(propRes.data);
          setFloors(floorRes.data || []);
        })
        .catch(() => message.error('Không thể tải thông tin cơ sở'))
        .finally(() => setFetching(false));
    }
  }, [id]);

  const handleAddFloor = async () => {
    if (!floorName.trim()) return;
    setFloorLoading(true);
    try {
      await propertyApi.createFloor(id, { name: floorName });
      message.success('Thêm tầng thành công');
      setFloorName('');
      fetchFloors();
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra');
    } finally {
      setFloorLoading(false);
    }
  };

  const handleDeleteFloor = async (floorId) => {
    try {
      await propertyApi.deleteFloor(id, floorId);
      message.success('Xóa tầng thành công');
      fetchFloors();
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra (Tầng có thể đang chứa phòng)');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (isEdit) {
        await propertyApi.update(id, values);
        message.success('Cập nhật cơ sở thành công!');
      } else {
        await propertyApi.create(values);
        message.success('Tạo cơ sở thành công!');
      }
      navigate('/properties');
    } catch (err) {
      const msg = err.message || 'Có lỗi xảy ra';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/properties')} />
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {isEdit ? 'Chỉnh sửa cơ sở' : 'Thêm cơ sở mới'}
          </h2>
          <p style={{ color: '#94a3b8', marginTop: 2 }}>Điền thông tin cơ sở nhà trọ</p>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit} scrollToFirstError>
        <Row gutter={[16, 0]}>
          {/* Thông tin cơ bản */}
          <Col xs={24} lg={16}>
            <Card
              title="Thông tin cơ sở"
              style={{ borderRadius: 14, marginBottom: 16 }}
              styles={{ header: { fontWeight: 700 } }}
            >
              <Row gutter={16}>
                <Col xs={24} md={16}>
                  <Form.Item name="name" label="Tên cơ sở" rules={[{ required: true, message: 'Nhập tên cơ sở' }]}>
                    <Input placeholder="VD: Nhà trọ Bình An" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="code" label="Mã cơ sở" rules={[{ required: true, message: 'Nhập mã cơ sở' }]}>
                    <Input placeholder="VD: BA01" style={{ textTransform: 'uppercase' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="address" label="Địa chỉ">
                <TextArea placeholder="Địa chỉ đầy đủ..." rows={2} />
              </Form.Item>

              <Form.Item name="note" label="Ghi chú">
                <TextArea rows={2} placeholder="Ghi chú thêm..." />
              </Form.Item>
            </Card>

            {/* Tài khoản ngân hàng */}
            <Card
              title="Tài khoản ngân hàng"
              style={{ borderRadius: 14, marginBottom: 16 }}
              styles={{ header: { fontWeight: 700 } }}
            >
              <Form.List name="bankAccounts">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...rest }) => (
                      <div key={key} style={{
                        background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 12,
                        border: '1px solid #e2e8f0', position: 'relative',
                      }}>
                        <Row gutter={12}>
                          <Col xs={24} md={8}>
                            <Form.Item {...rest} name={[name, 'bankCode']} label="Ngân hàng"
                              rules={[{ required: true, message: 'Chọn ngân hàng' }]}>
                              <Select placeholder="Chọn NH">
                                {BANK_CODES.map(b => <Select.Option key={b} value={b}>{b}</Select.Option>)}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={8}>
                            <Form.Item {...rest} name={[name, 'accountNumber']} label="Số tài khoản"
                              rules={[{ required: true, message: 'Nhập số TK' }]}>
                              <Input placeholder="1234567890" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={8}>
                            <Form.Item {...rest} name={[name, 'accountName']} label="Tên chủ TK"
                              rules={[{ required: true, message: 'Nhập tên chủ TK' }]}>
                              <Input placeholder="NGUYEN VAN A" style={{ textTransform: 'uppercase' }} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Button
                          type="text" danger size="small"
                          icon={<MinusCircleOutlined />}
                          style={{ position: 'absolute', top: 8, right: 8 }}
                          onClick={() => remove(name)}
                        />
                      </div>
                    ))}
                    <Button
                      type="dashed" block icon={<PlusOutlined />}
                      onClick={() => add()} style={{ borderRadius: 8 }}
                    >
                      Thêm tài khoản ngân hàng
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </Col>

          {/* Sidebar: Thông tin chủ & giá điện nước */}
          <Col xs={24} lg={8}>
            <Card
              title="Thông tin chủ nhà"
              style={{ borderRadius: 14, marginBottom: 16 }}
              styles={{ header: { fontWeight: 700 } }}
            >
              <Form.Item name={['owner', 'name']} label="Họ tên">
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
              <Form.Item name={['owner', 'phone']} label="Số điện thoại">
                <Input placeholder="0901234567" />
              </Form.Item>
              <Form.Item name={['owner', 'email']} label="Email">
                <Input placeholder="email@example.com" />
              </Form.Item>
            </Card>

            <Card
              title="Giá điện & nước mặc định"
              style={{ borderRadius: 14, marginBottom: 16 }}
              styles={{ header: { fontWeight: 700 } }}
            >
              <Form.Item name={['electricityPricing', 'fixedPrice']} label="Giá điện (₫/kWh)">
                <InputNumber
                  style={{ width: '100%' }} min={0} step={100}
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  placeholder="3,500"
                />
              </Form.Item>
              <Form.Item name={['waterPricing', 'fixedPrice']} label="Giá nước (₫/m³)">
                <InputNumber
                  style={{ width: '100%' }} min={0} step={1000}
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  placeholder="15,000"
                />
              </Form.Item>
            </Card>

            {/* Quản lý tầng (chỉ hiện khi sửa) */}
            {isEdit && (
              <Card
                title="Danh sách tầng"
                style={{ borderRadius: 14, marginBottom: 16 }}
                styles={{ header: { fontWeight: 700 } }}
              >
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <Input 
                    placeholder="VD: Tầng 1" 
                    value={floorName} 
                    onChange={e => setFloorName(e.target.value)} 
                    onPressEnter={handleAddFloor} 
                  />
                  <Button type="primary" onClick={handleAddFloor} loading={floorLoading}>
                    Thêm
                  </Button>
                </div>
                <List
                  size="small"
                  bordered
                  dataSource={floors}
                  locale={{ emptyText: 'Chưa có tầng nào' }}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Popconfirm title="Xóa tầng này?" onConfirm={() => handleDeleteFloor(item._id)}>
                          <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                        </Popconfirm>
                      ]}
                    >
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </Col>
        </Row>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button onClick={() => navigate('/properties')}>Hủy</Button>
          <Button
            type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: 8 }}
          >
            {isEdit ? 'Lưu thay đổi' : 'Tạo cơ sở'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default PropertyFormPage;
