// src/layouts/MainLayout.jsx
import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Badge, List, Typography } from 'antd';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import {
  DashboardOutlined,
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  KeyOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { App } from 'antd';
import useAuthStore from '../stores/auth.store';
import { notificationApi } from '../api/notification.api';
import dayjs from 'dayjs';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  {
    key: 'management',
    icon: <AppstoreOutlined />,
    label: 'Quản lý',
    children: [
      { key: '/properties', icon: <HomeOutlined />,    label: 'Cơ sở' },
      { key: '/rooms',      icon: <AppstoreOutlined />, label: 'Phòng' },
      { key: '/tenants',    icon: <TeamOutlined />,     label: 'Khách thuê' },
      { key: '/contracts',  icon: <FileTextOutlined />, label: 'Hợp đồng' },
    ],
  },
  {
    key: 'utilities',
    icon: <ThunderboltOutlined />,
    label: 'Điện nước',
    children: [
      { key: '/meter-readings', icon: <ThunderboltOutlined />, label: 'Nhập chỉ số' },
    ],
  },
  {
    key: 'billing',
    icon: <DollarOutlined />,
    label: 'Thu tiền',
    children: [
      { key: '/invoices', icon: <FileTextOutlined />, label: 'Hóa đơn' },
    ],
  },
];

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { message } = App.useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const [resList, resCount] = await Promise.all([
          notificationApi.getAll(),
          notificationApi.getUnreadCount()
        ]);
        setNotifications(resList.data || []);
        setUnreadCount(resCount.data?.count || 0);
      } catch (err) {}
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleReadNotification = async (id, link) => {
    try {
      await notificationApi.markAsRead(id);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      if (link) navigate(link);
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAsRead('all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {}
  };

  const handleMenuClick = ({ key }) => navigate(key);

  const handleLogout = async () => {
    await logout();
    message.success('Đã đăng xuất');
    navigate('/login');
  };

  const selectedKeys = [location.pathname];
  const defaultOpenKeys = menuItems
    .filter((item) => item.children?.some((c) => location.pathname.startsWith(c.key)))
    .map((item) => item.key);

  const userMenuItems = [
    { key: 'profile',          icon: <UserOutlined />,   label: 'Hồ sơ',       onClick: () => navigate('/profile') },
    { key: 'change-password',  icon: <KeyOutlined />,    label: 'Đổi mật khẩu', onClick: () => navigate('/change-password') },
    { type: 'divider' },
    { key: 'logout',           icon: <LogoutOutlined />, label: 'Đăng xuất',    danger: true, onClick: handleLogout },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── Sidebar (dark) ─────────────────────── */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={240}
        style={{
          background: '#1e293b',
          borderRight: '1px solid #334155',
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          zIndex: 100,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Brand */}
        <div style={{
          padding: collapsed ? '18px 12px' : '18px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          overflow: 'hidden',
        }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <HomeOutlined style={{ color: '#fff', fontSize: 17 }} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: 15, fontWeight: 700,
                background: 'linear-gradient(135deg, #a5b4fc 0%, #67e8f9 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                lineHeight: 1.3, whiteSpace: 'nowrap',
              }}>
                Swan Hostel
              </div>
              <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>
                Quản lý nhà trọ
              </div>
            </div>
          )}
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={selectedKeys}
          defaultOpenKeys={defaultOpenKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ background: 'transparent', border: 'none', padding: '8px 6px' }}
        />
      </Sider>

      {/* ── Main content ───────────────────────── */}
      <Layout style={{
        marginLeft: collapsed ? 80 : 240,
        transition: 'margin-left 0.2s',
        background: '#f1f5f9',
      }}>
        {/* Header */}
        <Header style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0, zIndex: 99,
          height: 60,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: '#64748b', fontSize: 16 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Dropdown
              trigger={['click']}
              dropdownRender={() => (
                <div style={{ width: 320, background: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>Thông báo</span>
                    {unreadCount > 0 && (
                      <Button type="link" size="small" onClick={handleMarkAllRead} style={{ padding: 0 }}>
                        Đánh dấu đã đọc
                      </Button>
                    )}
                  </div>
                  <List
                    style={{ maxHeight: 400, overflowY: 'auto' }}
                    dataSource={notifications}
                    renderItem={(item) => (
                      <List.Item
                        style={{ padding: '12px 16px', cursor: 'pointer', background: item.isRead ? '#fff' : '#f0f9ff' }}
                        onClick={() => handleReadNotification(item._id, item.link)}
                      >
                        <List.Item.Meta
                          title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text strong={!item.isRead}>{item.title}</Text>
                              <Text type="secondary" style={{ fontSize: 11 }}>{dayjs(item.createdAt).format('DD/MM HH:mm')}</Text>
                            </div>
                          }
                          description={<Text style={{ fontSize: 13, color: '#64748b' }} ellipsis={{ tooltip: item.content }}>{item.content}</Text>}
                        />
                      </List.Item>
                    )}
                    locale={{ emptyText: 'Chưa có thông báo nào' }}
                  />
                </div>
              )}
            >
              <Badge count={unreadCount} size="small" offset={[-4, 4]}>
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  style={{ color: '#64748b', fontSize: 17 }}
                />
              </Badge>
            </Dropdown>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', padding: '4px 10px',
                borderRadius: 8, transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Avatar size={32} style={{
                  background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                  fontSize: 13, fontWeight: 600,
                }}>
                  {user?.fullName?.charAt(0) || 'U'}
                </Avatar>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
                    {user?.fullName || 'User'}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1 }}>
                    {user?.role}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={{ padding: 24, minHeight: 'calc(100vh - 60px)', background: '#f1f5f9' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
