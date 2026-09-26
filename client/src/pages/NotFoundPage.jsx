// src/pages/NotFoundPage.jsx
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
    }}>
      <Result
        status="404"
        title={<span style={{ color: '#f1f5f9' }}>404</span>}
        subTitle={<span style={{ color: '#64748b' }}>Trang không tồn tại</span>}
        extra={
          <Button
            type="primary"
            onClick={() => navigate('/dashboard')}
            style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
          >
            Về Dashboard
          </Button>
        }
      />
    </div>
  );
};

export default NotFoundPage;
