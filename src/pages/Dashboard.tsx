import React from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Progress, List, Avatar, Space } from 'antd';
import {
  TeamOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  FileTextOutlined,
  RiseOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  TruckOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { 
  mockDashboardKPIs, 
  mockOperationalWidgets, 
  getClientById,
  getProjectById 
} from '@/data/mockData';
import { Project, Purchase, Invoice, StockItem } from '@/types';
import { statusColors, paymentStatusColors, purchaseStatusColors } from '@/config/antdTheme';

const { Title, Text } = Typography;

// Format currency
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

// Status label map
const projectStatusLabels: Record<string, string> = {
  enquiry: 'Enquiry',
  design: 'Design',
  fabrication: 'Fabrication',
  assembly: 'Assembly',
  testing: 'Testing',
  delivered: 'Delivered',
};

// KPI Card Component
interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
  prefix?: string;
  trend?: { value: number; isUp: boolean };
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color, suffix, prefix, trend }) => (
  <Card 
    bordered={false}
    style={{ height: '100%' }}
    bodyStyle={{ padding: 20 }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
          {title}
        </Text>
        <div style={{ marginTop: 8 }}>
          <Statistic 
            value={typeof value === 'number' ? value : undefined}
            valueRender={typeof value === 'string' ? () => <span style={{ fontSize: 28, fontWeight: 700 }}>{value}</span> : undefined}
            prefix={prefix}
            suffix={suffix}
            valueStyle={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}
          />
        </div>
        {trend && (
          <div style={{ marginTop: 4 }}>
            <Text style={{ color: trend.isUp ? '#16a34a' : '#dc2626', fontSize: 13 }}>
              <RiseOutlined style={{ transform: trend.isUp ? 'none' : 'rotate(180deg)' }} />
              {' '}{trend.value}% vs last month
            </Text>
          </div>
        )}
      </div>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          color: '#ffffff',
        }}
      >
        {icon}
      </div>
    </div>
  </Card>
);

// Project Status Tag
const ProjectStatusTag: React.FC<{ status: string }> = ({ status }) => {
  const colorMap = statusColors[status as keyof typeof statusColors];
  return (
    <Tag 
      style={{ 
        backgroundColor: colorMap?.bg || '#f1f5f9', 
        color: colorMap?.text || '#64748b',
        border: `1px solid ${colorMap?.border || '#e2e8f0'}`,
        borderRadius: 4,
      }}
    >
      {projectStatusLabels[status] || status}
    </Tag>
  );
};

// Payment Status Tag
const PaymentStatusTag: React.FC<{ status: string }> = ({ status }) => {
  const colorMap = paymentStatusColors[status as keyof typeof paymentStatusColors];
  return (
    <Tag 
      style={{ 
        backgroundColor: colorMap?.bg || '#f1f5f9', 
        color: colorMap?.text || '#64748b',
        borderRadius: 4,
      }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Tag>
  );
};

const Dashboard: React.FC = () => {
  const { 
    totalClients, 
    activeProjects, 
    projectsDelivered,
    totalPurchaseValue,
    totalSalesValue,
    pendingInvoices,
    pendingInvoiceAmount,
    estimatedProfit,
  } = mockDashboardKPIs;

  const {
    projectsUnderFabrication,
    projectsUnderAssembly,
    upcomingDeliveries,
    lowStockAlerts,
    recentPurchases,
    recentInvoices,
  } = mockOperationalWidgets;

  // Upcoming deliveries columns
  const deliveryColumns: ColumnsType<Project> = [
    {
      title: 'Project',
      dataIndex: 'projectNo',
      key: 'projectNo',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {getClientById(record.clientId)?.companyName}
          </Text>
        </div>
      ),
    },
    {
      title: 'Machine',
      dataIndex: 'modelCapacitySpec',
      key: 'machine',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <ProjectStatusTag status={status} />,
    },
    {
      title: 'Delivery',
      dataIndex: 'expectedDeliveryDate',
      key: 'delivery',
      render: (date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    },
  ];

  // Recent invoices columns
  const invoiceColumns: ColumnsType<Invoice> = [
    {
      title: 'Invoice',
      dataIndex: 'invoiceNo',
      key: 'invoiceNo',
    },
    {
      title: 'Client',
      key: 'client',
      render: (_, record) => getClientById(record.clientId)?.companyName,
      ellipsis: true,
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'amount',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Status',
      dataIndex: 'paymentStatus',
      key: 'status',
      render: (status) => <PaymentStatusTag status={status} />,
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>Dashboard</Title>
        <Text type="secondary">Welcome back! Here's what's happening at TSP Metal Works.</Text>
      </div>

      {/* KPI Cards - Row 1 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Total Clients"
            value={totalClients}
            icon={<TeamOutlined />}
            color="#1e3a5f"
            trend={{ value: 12, isUp: true }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Active Projects"
            value={activeProjects}
            icon={<ProjectOutlined />}
            color="#0ea5e9"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Projects Delivered"
            value={projectsDelivered}
            icon={<CheckCircleOutlined />}
            color="#16a34a"
            trend={{ value: 8, isUp: true }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Pending Invoices"
            value={pendingInvoices}
            icon={<FileTextOutlined />}
            color="#f59e0b"
          />
        </Col>
      </Row>

      {/* KPI Cards - Row 2 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Total Purchase Value"
            value={formatCurrency(totalPurchaseValue)}
            icon={<ShoppingCartOutlined />}
            color="#7c3aed"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Total Sales Value"
            value={formatCurrency(totalSalesValue)}
            icon={<DollarOutlined />}
            color="#059669"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Pending Invoice Amount"
            value={formatCurrency(pendingInvoiceAmount)}
            icon={<ClockCircleOutlined />}
            color="#dc2626"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Estimated Profit"
            value={formatCurrency(estimatedProfit)}
            icon={<RiseOutlined />}
            color="#16a34a"
            trend={{ value: 15, isUp: true }}
          />
        </Col>
      </Row>

      {/* Operational Widgets */}
      <Row gutter={[16, 16]}>
        {/* Project Status Overview */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <ProjectOutlined />
                <span>Project Status Overview</span>
              </Space>
            }
            bordered={false}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Fabrication</Text>
                  <Text strong>{projectsUnderFabrication.length} projects</Text>
                </div>
                <Progress 
                  percent={projectsUnderFabrication.length * 20} 
                  strokeColor="#f59e0b"
                  showInfo={false}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Assembly & Testing</Text>
                  <Text strong>{projectsUnderAssembly.length} projects</Text>
                </div>
                <Progress 
                  percent={projectsUnderAssembly.length * 20} 
                  strokeColor="#ea580c"
                  showInfo={false}
                />
              </div>
            </div>
          </Card>
        </Col>

        {/* Low Stock Alerts */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <WarningOutlined style={{ color: '#f59e0b' }} />
                <span>Low Stock Alerts</span>
              </Space>
            }
            bordered={false}
            extra={<Tag color="warning">{lowStockAlerts.length} items</Tag>}
          >
            <List
              size="small"
              dataSource={lowStockAlerts}
              renderItem={(item: StockItem) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ backgroundColor: '#fef3c7', color: '#d97706' }}
                        icon={<WarningOutlined />}
                      />
                    }
                    title={item.materialName}
                    description={`${item.currentStock} ${item.unit} remaining (Min: ${item.minimumStock})`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Upcoming Deliveries */}
        <Col xs={24} lg={14}>
          <Card 
            title={
              <Space>
                <TruckOutlined />
                <span>Upcoming Deliveries</span>
              </Space>
            }
            bordered={false}
          >
            <Table
              columns={deliveryColumns}
              dataSource={upcomingDeliveries}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Recent Invoices */}
        <Col xs={24} lg={10}>
          <Card 
            title={
              <Space>
                <FileTextOutlined />
                <span>Recent Invoices</span>
              </Space>
            }
            bordered={false}
          >
            <Table
              columns={invoiceColumns}
              dataSource={recentInvoices}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Recent Purchases */}
        <Col xs={24}>
          <Card 
            title={
              <Space>
                <ShoppingCartOutlined />
                <span>Recent Purchases</span>
              </Space>
            }
            bordered={false}
          >
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 5 }}
              dataSource={recentPurchases}
              renderItem={(item: Purchase) => (
                <List.Item>
                  <Card size="small" bordered>
                    <Text strong style={{ display: 'block' }}>{item.purchaseNo}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.materialComponentName}</Text>
                    <div style={{ marginTop: 8 }}>
                      <Text strong style={{ color: '#16a34a' }}>{formatCurrency(item.totalAmount)}</Text>
                    </div>
                    <Tag 
                      style={{ 
                        marginTop: 8,
                        backgroundColor: purchaseStatusColors[item.status as keyof typeof purchaseStatusColors]?.bg,
                        color: purchaseStatusColors[item.status as keyof typeof purchaseStatusColors]?.text,
                      }}
                    >
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Tag>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
