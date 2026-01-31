import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Typography, 
  Input, 
  Modal, 
  Form, 
  Select,
  DatePicker,
  InputNumber,
  message,
  Popconfirm,
  Tooltip,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { mockSalesOrders, mockClients, mockProjects } from '@/data/mockData';
import { SalesOrder, SalesOrderFormData, SalesStatus } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Format currency
const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

// Status options
const salesStatusOptions: { value: SalesStatus; label: string; color: string }[] = [
  { value: 'order_confirmed', label: 'Order Confirmed', color: 'blue' },
  { value: 'in_production', label: 'In Production', color: 'orange' },
  { value: 'ready', label: 'Ready', color: 'purple' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
];

const SalesOrders: React.FC = () => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(mockSalesOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<SalesStatus | 'all'>('all');
  const [form] = Form.useForm();

  // Filter sales orders
  const filteredOrders = salesOrders.filter(order => {
    const matchesSearch = 
      order.salesOrderNo.toLowerCase().includes(searchText.toLowerCase()) ||
      order.machineDescription.toLowerCase().includes(searchText.toLowerCase()) ||
      mockClients.find(c => c.id === order.clientId)?.companyName.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get client name by ID
  const getClientName = (clientId: string) => 
    mockClients.find(c => c.id === clientId)?.companyName || 'Unknown';

  // Get project no by ID
  const getProjectNo = (projectId: string) => 
    mockProjects.find(p => p.id === projectId)?.projectNo || 'Unknown';

  // Open modal for add/edit
  const openModal = (order?: SalesOrder) => {
    if (order) {
      setSelectedOrder(order);
      form.setFieldsValue({
        ...order,
        deliveryDate: dayjs(order.deliveryDate),
      });
    } else {
      setSelectedOrder(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = (values: any) => {
    const orderData: SalesOrderFormData = {
      ...values,
      deliveryDate: values.deliveryDate.format('YYYY-MM-DD'),
    };

    if (selectedOrder) {
      setSalesOrders(prev => prev.map(o => 
        o.id === selectedOrder.id 
          ? { ...o, ...orderData, updatedAt: new Date().toISOString() }
          : o
      ));
      message.success('Sales order updated successfully');
    } else {
      const newOrder: SalesOrder = {
        ...orderData,
        id: `so-${Date.now()}`,
        salesOrderNo: `SO-${String(salesOrders.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSalesOrders(prev => [...prev, newOrder]);
      message.success('Sales order created successfully');
    }
    setIsModalOpen(false);
    form.resetFields();
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setSalesOrders(prev => prev.filter(o => o.id !== id));
    message.success('Sales order deleted successfully');
  };

  // Calculate summary
  const totalSalesValue = filteredOrders.reduce((sum, o) => sum + o.orderValue, 0);
  const deliveredValue = filteredOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.orderValue, 0);
  const inProductionValue = filteredOrders.filter(o => o.status === 'in_production').reduce((sum, o) => sum + o.orderValue, 0);

  // Table columns
  const columns: ColumnsType<SalesOrder> = [
    {
      title: 'SO No',
      dataIndex: 'salesOrderNo',
      key: 'salesOrderNo',
      sorter: (a, b) => a.salesOrderNo.localeCompare(b.salesOrderNo),
      render: (text) => <Text strong style={{ color: '#1e3a5f' }}>{text}</Text>,
    },
    {
      title: 'Client',
      key: 'client',
      sorter: (a, b) => getClientName(a.clientId).localeCompare(getClientName(b.clientId)),
      render: (_, record) => getClientName(record.clientId),
    },
    {
      title: 'Project',
      key: 'project',
      render: (_, record) => <Tag>{getProjectNo(record.projectId)}</Tag>,
    },
    {
      title: 'Machine Description',
      dataIndex: 'machineDescription',
      key: 'machine',
      ellipsis: true,
      width: 250,
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Order Value',
      dataIndex: 'orderValue',
      key: 'orderValue',
      sorter: (a, b) => a.orderValue - b.orderValue,
      render: (value) => <Text strong>{formatCurrency(value)}</Text>,
    },
    {
      title: 'Delivery Date',
      dataIndex: 'deliveryDate',
      key: 'delivery',
      sorter: (a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime(),
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = salesStatusOptions.find(s => s.value === status);
        return <Tag color={statusConfig?.color || 'default'}>{statusConfig?.label || status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Sales Order"
            description="Are you sure?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>Sales Orders</Title>
        <Text type="secondary">Manage machine orders and project sales</Text>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
        <Card bordered={false} size="small">
          <Text type="secondary">Total Sales Value</Text>
          <div><Text strong style={{ fontSize: 20 }}>{formatCurrency(totalSalesValue)}</Text></div>
        </Card>
        <Card bordered={false} size="small">
          <Text type="secondary">In Production</Text>
          <div><Text strong style={{ fontSize: 20, color: '#ea580c' }}>{formatCurrency(inProductionValue)}</Text></div>
        </Card>
        <Card bordered={false} size="small">
          <Text type="secondary">Delivered</Text>
          <div><Text strong style={{ fontSize: 20, color: '#16a34a' }}>{formatCurrency(deliveredValue)}</Text></div>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Space wrap>
            <Input
              placeholder="Search sales orders..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 180 }}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Status</Option>
              {salesStatusOptions.map(s => (
                <Option key={s.value} value={s.value}>{s.label}</Option>
              ))}
            </Select>
          </Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            New Sales Order
          </Button>
        </div>
      </Card>

      {/* Sales Orders Table */}
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
          }}
          scroll={{ x: 1100 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={selectedOrder ? `Edit Sales Order - ${selectedOrder.salesOrderNo}` : 'New Sales Order'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 24 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="clientId"
              label="Client"
              rules={[{ required: true, message: 'Please select client' }]}
            >
              <Select placeholder="Select client">
                {mockClients.map(c => (
                  <Option key={c.id} value={c.id}>{c.companyName}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="projectId"
              label="Linked Project"
              rules={[{ required: true, message: 'Please select project' }]}
            >
              <Select placeholder="Select project">
                {mockProjects.map(p => (
                  <Option key={p.id} value={p.id}>{p.projectNo}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="machineDescription"
            label="Machine Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={2} placeholder="e.g., Automatic Pouch Packing Machine - 60 pouches/min" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: 'Required' }]}
              initialValue={1}
            >
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>

            <Form.Item
              name="orderValue"
              label="Order Value (₹)"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber 
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/,/g, '') as unknown as number}
                placeholder="850000" 
              />
            </Form.Item>

            <Form.Item
              name="deliveryDate"
              label="Delivery Date"
              rules={[{ required: true, message: 'Required' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
            </Form.Item>
          </div>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              {salesStatusOptions.map(s => (
                <Option key={s.value} value={s.value}>{s.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {selectedOrder ? 'Update Order' : 'Create Order'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SalesOrders;
