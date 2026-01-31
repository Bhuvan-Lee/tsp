import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Typography, 
  Input, 
  Tag,
  Progress,
  Space,
  Select,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  SearchOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { mockStockItems } from '@/data/mockData';
import { StockItem } from '@/types';

const { Title, Text } = Typography;
const { Option } = Select;

// Format currency
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const Stock: React.FC = () => {
  const [stockItems] = useState<StockItem[]>(mockStockItems);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'raw_material' | 'component'>('all');

  // Filter stock items
  const filteredItems = stockItems.filter(item => {
    const matchesSearch = 
      item.materialName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.specification.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate summaries
  const totalStockValue = stockItems.reduce((sum, item) => sum + item.stockValue, 0);
  const lowStockCount = stockItems.filter(item => item.currentStock < item.minimumStock).length;
  const rawMaterialValue = stockItems.filter(i => i.category === 'raw_material').reduce((sum, i) => sum + i.stockValue, 0);
  const componentValue = stockItems.filter(i => i.category === 'component').reduce((sum, i) => sum + i.stockValue, 0);

  // Table columns
  const columns: ColumnsType<StockItem> = [
    {
      title: 'Material / Component',
      key: 'material',
      sorter: (a, b) => a.materialName.localeCompare(b.materialName),
      render: (_, record) => (
        <div>
          <Text strong>{record.materialName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.specification}</Text>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={category === 'raw_material' ? 'blue' : 'purple'}>
          {category === 'raw_material' ? 'Raw Material' : 'Component'}
        </Tag>
      ),
    },
    {
      title: 'Current Stock',
      key: 'stock',
      sorter: (a, b) => a.currentStock - b.currentStock,
      render: (_, record) => (
        <Space>
          <Text strong style={{ 
            color: record.currentStock < record.minimumStock ? '#dc2626' : '#16a34a' 
          }}>
            {record.currentStock} {record.unit}
          </Text>
          {record.currentStock < record.minimumStock && (
            <WarningOutlined style={{ color: '#f59e0b' }} />
          )}
        </Space>
      ),
    },
    {
      title: 'Minimum Stock',
      key: 'minStock',
      render: (_, record) => `${record.minimumStock} ${record.unit}`,
    },
    {
      title: 'Stock Level',
      key: 'level',
      width: 180,
      render: (_, record) => {
        const percent = Math.min((record.currentStock / record.minimumStock) * 100, 100);
        const status = record.currentStock < record.minimumStock ? 'exception' : 
                       record.currentStock < record.minimumStock * 1.5 ? 'normal' : 'success';
        return (
          <Progress 
            percent={Math.round(percent)} 
            size="small" 
            status={status}
            format={() => record.currentStock < record.minimumStock ? 'Low' : 'OK'}
          />
        );
      },
    },
    {
      title: 'Stock Value',
      dataIndex: 'stockValue',
      key: 'value',
      sorter: (a, b) => a.stockValue - b.stockValue,
      render: (value) => <Text strong>{formatCurrency(value)}</Text>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        record.currentStock < record.minimumStock ? (
          <Tag color="error" icon={<WarningOutlined />}>Low Stock</Tag>
        ) : (
          <Tag color="success" icon={<CheckCircleOutlined />}>In Stock</Tag>
        )
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>Stock / Inventory</Title>
        <Text type="secondary">Track raw materials and component inventory levels</Text>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="Total Stock Value" 
              value={totalStockValue} 
              prefix="₹"
              formatter={(value) => formatCurrency(Number(value)).replace('₹', '')}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="Raw Materials Value" 
              value={rawMaterialValue} 
              prefix="₹"
              formatter={(value) => formatCurrency(Number(value)).replace('₹', '')}
              valueStyle={{ color: '#0284c7' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="Components Value" 
              value={componentValue} 
              prefix="₹"
              formatter={(value) => formatCurrency(Number(value)).replace('₹', '')}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic 
              title="Low Stock Alerts" 
              value={lowStockCount} 
              suffix={`/ ${stockItems.length} items`}
              valueStyle={{ color: lowStockCount > 0 ? '#dc2626' : '#16a34a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Actions Bar */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Space wrap>
            <Input
              placeholder="Search inventory..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 180 }}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Categories</Option>
              <Option value="raw_material">Raw Materials</Option>
              <Option value="component">Components</Option>
            </Select>
          </Space>
          <Text type="secondary">
            Stock updates automatically when purchases are marked as "Received"
          </Text>
        </div>
      </Card>

      {/* Stock Table */}
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={filteredItems}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          rowClassName={(record) => 
            record.currentStock < record.minimumStock ? 'low-stock-row' : ''
          }
        />
      </Card>

      <style>{`
        .low-stock-row {
          background-color: #fef2f2 !important;
        }
        .low-stock-row:hover > td {
          background-color: #fee2e2 !important;
        }
      `}</style>
    </div>
  );
};

export default Stock;
