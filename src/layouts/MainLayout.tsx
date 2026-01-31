import React, { useState, createContext, useContext } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Badge, Button } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  ProjectOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// Sidebar collapsed context
interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

// Menu items configuration
const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/clients',
    icon: <TeamOutlined />,
    label: 'Clients',
  },
  {
    key: '/projects',
    icon: <ProjectOutlined />,
    label: 'Projects',
  },
  {
    key: '/purchases',
    icon: <ShoppingCartOutlined />,
    label: 'Purchases',
  },
  {
    key: '/stock',
    icon: <InboxOutlined />,
    label: 'Stock',
  },
  {
    key: '/sales',
    icon: <ShoppingOutlined />,
    label: 'Sales Orders',
  },
  {
    key: '/billing',
    icon: <FileTextOutlined />,
    label: 'Billing',
  },
  {
    key: '/reports',
    icon: <BarChartOutlined />,
    label: 'Reports',
  },
];

// User dropdown menu
const userMenuItems: MenuProps['items'] = [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: 'Profile',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Settings',
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Logout',
    danger: true,
  },
];

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  const handleUserMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'logout') {
      // Handle logout - will redirect to login in future
      navigate('/login');
    }
  };

  // Get current selected key based on pathname
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return '/dashboard';
    // Match parent paths for nested routes
    const matchingItem = menuItems?.find(item => 
      item?.key && path.startsWith(item.key as string)
    );
    return matchingItem?.key as string || '/dashboard';
  };

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <Layout style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={260}
          collapsedWidth={80}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
          }}
          className="sidebar-scroll"
        >
          {/* Logo */}
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '0' : '0 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <img
              src="/tsp-logo.svg"
              alt="TSP Metalworks"
              style={{
                height: collapsed ? 32 : 40,
                width: 'auto',
                display: 'block',
              }}
            />
          </div>

          {/* Navigation Menu */}
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              marginTop: 8,
              borderRight: 0,
            }}
          />
        </Sider>

        {/* Main Layout */}
        <Layout
          style={{
            marginLeft: collapsed ? 80 : 260,
            transition: 'margin-left 0.2s',
          }}
        >
          {/* Header */}
          <Header
            style={{
              padding: '0 24px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #e2e8f0',
              position: 'sticky',
              top: 0,
              zIndex: 99,
            }}
          >
            {/* Left side - Toggle button */}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: 18,
                width: 44,
                height: 44,
              }}
            />

            {/* Right side - Notifications & User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Notifications */}
              <Badge count={3} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  style={{ fontSize: 18 }}
                />
              </Badge>

              {/* User Dropdown */}
              <Dropdown
                menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
                placement="bottomRight"
                trigger={['click']}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: 8,
                    transition: 'background 0.2s',
                  }}
                  className="hover:bg-gray-50"
                >
                  <Avatar
                    style={{ backgroundColor: '#1e3a5f' }}
                    icon={<UserOutlined />}
                  />
                  <div style={{ lineHeight: 1.2 }}>
                    <Text strong style={{ display: 'block', fontSize: 14 }}>
                      Admin User
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Administrator
                    </Text>
                  </div>
                </div>
              </Dropdown>
            </div>
          </Header>

          {/* Content */}
          <Content
            style={{
              margin: 24,
              minHeight: 'calc(100vh - 64px - 48px)',
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </SidebarContext.Provider>
  );
};

export default MainLayout;
