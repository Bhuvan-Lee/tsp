import React from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  List,
  Tag,
  Space,
  Row,
  Col,
  message,
} from 'antd';
import {
  FilePdfOutlined,
  FileExcelOutlined,
  TeamOutlined,
  ProjectOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  FileTextOutlined,
  BarChartOutlined,
  TruckOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// Report categories
const reportCategories = [
  {
    title: 'Client Reports',
    icon: <TeamOutlined />,
    color: '#1e3a5f',
    reports: [
      { name: 'Client Statement', description: 'Complete statement for a client', formats: ['pdf', 'excel'] },
      { name: 'Client List', description: 'All clients with contact details', formats: ['excel'] },
    ],
  },
  {
    title: 'Project Reports',
    icon: <ProjectOutlined />,
    color: '#0ea5e9',
    reports: [
      { name: 'Project Summary', description: 'Overview of all projects', formats: ['pdf', 'excel'] },
      { name: 'Project Cost Sheet', description: 'Detailed cost breakdown per project', formats: ['pdf'] },
      { name: 'Project Status Report', description: 'Current status of all projects', formats: ['pdf', 'excel'] },
    ],
  },
  {
    title: 'Purchase Reports',
    icon: <ShoppingCartOutlined />,
    color: '#7c3aed',
    reports: [
      { name: 'Purchase Order', description: 'Printable purchase order', formats: ['pdf'] },
      { name: 'Purchase Register', description: 'All purchases date-wise', formats: ['excel'] },
      { name: 'Supplier-wise Purchases', description: 'Purchases grouped by supplier', formats: ['excel'] },
      { name: 'Project-wise Purchases', description: 'Purchases grouped by project', formats: ['excel'] },
    ],
  },
  {
    title: 'Sales Reports',
    icon: <DollarOutlined />,
    color: '#059669',
    reports: [
      { name: 'Quotation', description: 'Generate quotation for client', formats: ['pdf'] },
      { name: 'Sales Order', description: 'Printable sales order', formats: ['pdf'] },
      { name: 'Sales Register', description: 'All sales date-wise', formats: ['excel'] },
    ],
  },
  {
    title: 'Billing Reports',
    icon: <FileTextOutlined />,
    color: '#ea580c',
    reports: [
      { name: 'GST Invoice', description: 'Tax invoice with GST details', formats: ['pdf'] },
      { name: 'Delivery Challan', description: 'Delivery document', formats: ['pdf'] },
      { name: 'Invoice Register', description: 'All invoices with status', formats: ['excel'] },
      { name: 'Pending Invoices', description: 'Unpaid invoices report', formats: ['pdf', 'excel'] },
    ],
  },
  {
    title: 'Financial Reports',
    icon: <BarChartOutlined />,
    color: '#dc2626',
    reports: [
      { name: 'Profit Report (Project-wise)', description: 'Profit/loss per project', formats: ['pdf', 'excel'] },
      { name: 'Monthly Summary', description: 'Monthly sales & purchases', formats: ['excel'] },
      { name: 'Outstanding Report', description: 'Pending payments from clients', formats: ['excel'] },
    ],
  },
  {
    title: 'Stock Reports',
    icon: <TruckOutlined />,
    color: '#f59e0b',
    reports: [
      { name: 'Stock Summary', description: 'Current stock levels', formats: ['pdf', 'excel'] },
      { name: 'Low Stock Report', description: 'Items below minimum level', formats: ['pdf'] },
      { name: 'Stock Valuation', description: 'Total value of inventory', formats: ['excel'] },
    ],
  },
];

const Reports: React.FC = () => {
  const handleExport = (reportName: string, format: string) => {
    message.info(`${reportName} export to ${format.toUpperCase()} will be available when connected to backend`);
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>Reports</Title>
        <Text type="secondary">Generate and export reports in PDF and Excel formats</Text>
      </div>

      {/* Info Card */}
      <Card 
        bordered={false} 
        style={{ marginBottom: 24, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}
      >
        <Space>
          <CalculatorOutlined style={{ fontSize: 24, color: '#2563eb' }} />
          <div>
            <Text strong>Document Exports</Text>
            <Paragraph style={{ marginBottom: 0, color: '#64748b' }}>
              All reports support PDF and/or Excel export. Export functionality will be fully operational when connected to your Django backend.
            </Paragraph>
          </div>
        </Space>
      </Card>

      {/* Report Categories */}
      <Row gutter={[16, 16]}>
        {reportCategories.map((category) => (
          <Col xs={24} lg={12} key={category.title}>
            <Card 
              bordered={false}
              title={
                <Space>
                  <span style={{ color: category.color }}>{category.icon}</span>
                  <span>{category.title}</span>
                </Space>
              }
            >
              <List
                size="small"
                dataSource={category.reports}
                renderItem={(report) => (
                  <List.Item
                    actions={[
                      ...report.formats.map(format => (
                        <Button
                          key={format}
                          type="text"
                          size="small"
                          icon={format === 'pdf' ? <FilePdfOutlined /> : <FileExcelOutlined />}
                          onClick={() => handleExport(report.name, format)}
                          style={{ 
                            color: format === 'pdf' ? '#dc2626' : '#16a34a',
                          }}
                        >
                          {format.toUpperCase()}
                        </Button>
                      ))
                    ]}
                  >
                    <List.Item.Meta
                      title={report.name}
                      description={<Text type="secondary" style={{ fontSize: 12 }}>{report.description}</Text>}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Export Section */}
      <Card 
        bordered={false} 
        style={{ marginTop: 24 }}
        title={
          <Space>
            <FilePdfOutlined />
            <span>Quick Document Generation</span>
          </Space>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <Button 
            size="large" 
            block 
            icon={<FilePdfOutlined style={{ color: '#dc2626' }} />}
            onClick={() => handleExport('Quotation', 'pdf')}
          >
            Generate Quotation
          </Button>
          <Button 
            size="large" 
            block 
            icon={<FilePdfOutlined style={{ color: '#dc2626' }} />}
            onClick={() => handleExport('GST Invoice', 'pdf')}
          >
            Generate GST Invoice
          </Button>
          <Button 
            size="large" 
            block 
            icon={<FilePdfOutlined style={{ color: '#dc2626' }} />}
            onClick={() => handleExport('Purchase Order', 'pdf')}
          >
            Generate Purchase Order
          </Button>
          <Button 
            size="large" 
            block 
            icon={<FilePdfOutlined style={{ color: '#dc2626' }} />}
            onClick={() => handleExport('Delivery Challan', 'pdf')}
          >
            Generate Challan
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
