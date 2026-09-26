// src/pages/auth/LoginPage.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, App } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined } from '@ant-design/icons';
import useAuthStore from '../../stores/auth.store';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (values) => {
    const result = await login(values.username, values.password);
    if (result.success) {
      message.success('Đăng nhập thành công!');
      navigate(from, { replace: true });
    } else {
      message.error(result.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card fade-in">
        {/* Logo */}
        <div className="login-logo">
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: 26,
          }}>
            <HomeOutlined style={{ color: '#fff' }} />
          </div>
          <h1>Swan Hostel</h1>
          <p>Hệ thống quản lý nhà trọ</p>
        </div>

        {/* Form */}
        <Form form={form} onFinish={handleSubmit} layout="vertical" size="large" autoComplete="off">
          <Form.Item
            name="username"
            label={<span style={{ fontWeight: 500, color: '#374151' }}>Tên đăng nhập</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập' },
              { min: 3, message: 'Tối thiểu 3 ký tự' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Nhập tên đăng nhập"
              style={{ borderRadius: 8, height: 44 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 500, color: '#374151' }}>Mật khẩu</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Tối thiểu 6 ký tự' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Nhập mật khẩu"
              style={{ borderRadius: 8, height: 44 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              style={{
                height: 46, borderRadius: 10,
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                border: 'none', fontSize: 15, fontWeight: 600,
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 12, marginTop: 24 }}>
          Swan Hostel Management &copy; 2026
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
