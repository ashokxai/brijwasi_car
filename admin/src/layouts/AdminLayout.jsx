import { Navigate, Outlet } from 'react-router-dom';
import { Layout, Menu, Button, theme, Typography } from 'antd';
import {
  DashboardOutlined,
  CarOutlined,
  UserOutlined,
  TagsOutlined,
  EnvironmentOutlined,
  FireOutlined,
  PictureOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

const items = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/cars', icon: <CarOutlined />, label: 'Cars' },
  { key: '/cars/add', icon: <PlusOutlined />, label: 'Add Car' },
  { key: '/users', icon: <UserOutlined />, label: 'Users' },
  { key: '/brands', icon: <TagsOutlined />, label: 'Brands' },
  { key: '/models', icon: <CarOutlined />, label: 'Models' },
  { key: '/cities', icon: <EnvironmentOutlined />, label: 'Cities' },
  { key: '/fuel-types', icon: <FireOutlined />, label: 'Fuel Types' },
  { key: '/banners', icon: <PictureOutlined />, label: 'Banners' },
  { key: '/reports', icon: <BarChartOutlined />, label: 'Reports' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth={64} theme="dark">
        <div className="logo-block">
          <img src="/logo.png" alt="Brijwasi Car Bazaar" className="logo-image" />
          <div className="logo-text">
            <Typography.Text style={{ color: '#fff', fontWeight: 700, display: 'block', lineHeight: 1.2 }}>
              Brijwasi
            </Typography.Text>
            <Typography.Text style={{ color: '#C9A227', fontWeight: 600, fontSize: 12 }}>
              Car Bazaar
            </Typography.Text>
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={items}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingInline: 24,
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Typography.Title level={4} style={{ margin: 0 }}>
            Admin Panel
          </Typography.Title>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Typography.Text>{user?.name}</Typography.Text>
            <Button icon={<LogoutOutlined />} onClick={() => { logout(); navigate('/login'); }}>
              Logout
            </Button>
          </div>
        </Header>
        <Content style={{ margin: 24 }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
