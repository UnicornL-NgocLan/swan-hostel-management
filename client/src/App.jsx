// src/App.jsx — Phase 0+1+2 (light theme)
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import 'dayjs/locale/vi';

import './styles/global.css';

import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Phase 2 imports
import PropertyListPage from './pages/properties/PropertyListPage';
import PropertyFormPage from './pages/properties/PropertyFormPage';
import RoomListPage from './pages/rooms/RoomListPage';

// Phase 3 imports
import TenantListPage from './pages/tenants/TenantListPage';
import ContractListPage from './pages/contracts/ContractListPage';

// Phase 4-6 imports
import MeterReadingPage from './pages/meters/MeterReadingPage';
import InvoiceListPage from './pages/invoices/InvoiceListPage';
import PaymentListPage from './pages/payments/PaymentListPage';

// Phase 9 imports
import ExpenseListPage from './pages/expenses/ExpenseListPage';

// Ant Design light theme
const antdTheme = {
  token: {
    colorPrimary: '#4f46e5',
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f1f5f9',
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',
    colorText: '#0f172a',
    colorTextSecondary: '#475569',
    colorTextDescription: '#94a3b8',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    boxShadowSecondary: '0 4px 16px rgba(0,0,0,0.08)',
  },
  components: {
    Layout: {
      siderBg: '#1e293b',
      bodyBg: '#f1f5f9',
      headerBg: '#ffffff',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'rgba(0,0,0,0.15)',
      darkItemSelectedBg: 'rgba(79, 70, 229, 0.25)',
      darkItemSelectedColor: '#a5b4fc',
      darkItemHoverBg: 'rgba(255,255,255,0.06)',
      itemBorderRadius: 8,
    },
    Table: {
      headerBg: '#f8fafc',
      rowHoverBg: '#f8faff',
      borderColor: '#e2e8f0',
    },
    Card: {
      colorBgContainer: '#ffffff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    },
    Button: {
      borderRadius: 8,
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
    Modal: {
      borderRadius: 14,
    },
  },
};

function App() {
  return (
    <ConfigProvider locale={viVN} theme={antdTheme}>
      <AntApp>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Phase 2 — Property & Room */}
                <Route path="/properties" element={<PropertyListPage />} />
                <Route path="/properties/new" element={<PropertyFormPage />} />
                <Route path="/properties/:id/edit" element={<PropertyFormPage />} />
                <Route path="/rooms" element={<RoomListPage />} />

                {/* Phase 3 — Tenant & Contract */}
                <Route path="/tenants" element={<TenantListPage />} />
                <Route path="/contracts" element={<ContractListPage />} />

                {/* Phase 4-6 — Meter & Invoice */}
                <Route path="/meter-readings" element={<MeterReadingPage />} />
                <Route path="/invoices" element={<InvoiceListPage />} />
                <Route path="/payments" element={<PaymentListPage />} />

                {/* Phase 9 - Thu Chi */}
                <Route path="/expenses" element={<ExpenseListPage />} />
                <Route path="/reports/revenue" element={<ComingSoon title="Báo cáo doanh thu" icon="📊" />} />
                <Route path="/reports/debt" element={<ComingSoon title="Báo cáo công nợ" icon="📉" />} />
                <Route path="/settings/users" element={<ComingSoon title="Người dùng" icon="👥" />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

const ComingSoon = ({ title, icon = '🚧' }) => (
  <div className="fade-in" style={{ textAlign: 'center', paddingTop: 80 }}>
    <div style={{ fontSize: 56, marginBottom: 16 }}>{icon}</div>
    <h2 style={{ color: '#0f172a', marginBottom: 8, fontWeight: 700 }}>{title}</h2>
    <p style={{ color: '#94a3b8' }}>Tính năng đang được phát triển</p>
  </div>
);

export default App;
