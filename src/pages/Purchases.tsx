import React, { useState, useMemo } from 'react';
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
import { mockPurchases, mockProjects } from '@/data/mockData';
import { Purchase, PurchaseFormData, PurchaseStatus, PurchaseUnit } from '@/types';
import { purchaseStatusColors } from '@/config/antdTheme';

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
const purchaseStatusOptions: { value: PurchaseStatus; label: string }[] = [
  { value: 'ordered', label: 'Ordered' },
  { value: 'received', label: 'Received' },
  { value: 'cancelled', label: 'Cancelled' },
];

const unitOptions: { value: PurchaseUnit; label: string }[] = [
  { value: 'kg', label: 'Kg' },
  { value: 'nos', label: 'Nos' },
  { value: 'meter', label: 'Meter' },
  { value: 'liter', label: 'Liter' },
  { value: 'piece', label: 'Piece' },
  { value: 'set', label: 'Set' },
];

// Purchase Status Tag
const PurchaseStatusTag: React.FC<{ status: PurchaseStatus }> = ({ status }) => {
  const colorMap = purchaseStatusColors[status as keyof typeof purchaseStatusColors];
  const label = purchaseStatusOptions.find(s => s.value === status)?.label || status;
  return (
    <Tag 
      style={{ 
        backgroundColor: colorMap?.bg || '#f1f5f9', 
        color: colorMap?.text || '#64748b',
        borderRadius: 4,
        fontWeight: 500,
      }}
    >
      {label}
    </Tag>
  );
};

const Purchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseStatus | 'all'>('all');
  const [form] = Form.useForm();

  // Watch quantity and rate for auto-calculation
  const quantity = Form.useWatch('quantity', form);
  const rate = Form.useWatch('rate', form);

  // Filter purchases
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.purchaseNo.toLowerCase().includes(searchText.toLowerCase()) ||
      purchase.supplierName.toLowerCase().includes(searchText.toLowerCase()) ||
      purchase.materialComponentName.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get project name by ID
  const getProjectNo = (projectId: string) => 
    mockProjects.find(p => p.id === projectId)?.projectNo || 'Unknown';

  // Open modal for add/edit
  const openModal = (purchase?: Purchase) => {
    if (purchase) {
      setSelectedPurchase(purchase);
      form.setFieldsValue({
        ...purchase,
        date: dayjs(purchase.date),
      });
    } else {
      setSelectedPurchase(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = (values: any) => {
    const totalAmount = values.quantity * values.rate;
    
    const purchaseData: PurchaseFormData = {
      ...values,
      date: values.date.format('YYYY-MM-DD'),
    };

    if (selectedPurchase) {
      setPurchases(prev => prev.map(p => 
        p.id === selectedPurchase.id 
          ? { ...p, ...purchaseData, totalAmount, updatedAt: new Date().toISOString() }
          : p
      ));
      message.success('Purchase updated successfully');
    } else {
      const newPurchase: Purchase = {
        ...purchaseData,
        totalAmount,
        id: `pur-${Date.now()}`,
        purchaseNo: `PUR-${String(purchases.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPurchases(prev => [...prev, newPurchase]);
      message.success('Purchase created successfully');
    }
    setIsModalOpen(false);
    form.resetFields();
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setPurchases(prev => prev.filter(p => p.id !== id));
    message.success('Purchase deleted successfully');
  };

  // Calculate summary
  const totalPurchaseValue = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const receivedValue = filteredPurchases.filter(p => p.status === 'received').reduce((sum, p) => sum + p.totalAmount, 0);
  const orderedValue = filteredPurchases.filter(p => p.status === 'ordered').reduce((sum, p) => sum + p.totalAmount, 0);

  // Table columns
  const columns: ColumnsType<Purchase> = [
    {
      title: 'Purchase No',
      dataIndex: 'purchaseNo',
      key: 'purchaseNo',
      sorter: (a, b) => a.purchaseNo.localeCompare(b.purchaseNo),
      render: (text) => <Text strong style={{ color: '#1e3a5f' }}>{text}</Text>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplier',
      sorter: (a, b) => a.supplierName.localeCompare(b.supplierName),
    },
    {
      title: 'Material / Component',
      key: 'material',
      render: (_, record) => (
        <div>
          <Text>{record.materialComponentName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.specification}</Text>
        </div>
      ),
    },
    {
      title: 'Qty',
      key: 'qty',
      render: (_, record) => `${record.quantity} ${record.unit}`,
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'total',
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (value) => <Text strong>{formatCurrency(value)}</Text>,
    },
    {
      title: 'Project',
      key: 'project',
      render: (_, record) => <Tag>{getProjectNo(record.projectId)}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <PurchaseStatusTag status={status} />,
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
            title="Delete Purchase"
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
        <Title level={2} style={{ marginBottom: 4 }}>Purchases</Title>
        <Text type="secondary">Manage raw material and component purchases</Text>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
        <Card bordered={false} size="small">
          <Text type="secondary">Total Purchase Value</Text>
          <div><Text strong style={{ fontSize: 20 }}>{formatCurrency(totalPurchaseValue)}</Text></div>
        </Card>
        <Card bordered={false} size="small">
          <Text type="secondary">Received</Text>
          <div><Text strong style={{ fontSize: 20, color: '#16a34a' }}>{formatCurrency(receivedValue)}</Text></div>
        </Card>
        <Card bordered={false} size="small">
          <Text type="secondary">Ordered (Pending)</Text>
          <div><Text strong style={{ fontSize: 20, color: '#0284c7' }}>{formatCurrency(orderedValue)}</Text></div>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Space wrap>
            <Input
              placeholder="Search purchases..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Status</Option>
              {purchaseStatusOptions.map(s => (
                <Option key={s.value} value={s.value}>{s.label}</Option>
              ))}
            </Select>
          </Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            New Purchase
          </Button>
        </div>
      </Card>

      {/* Purchases Table */}
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={filteredPurchases}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} purchases`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={selectedPurchase ? `Edit Purchase - ${selectedPurchase.purchaseNo}` : 'New Purchase'}
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
              name="date"
              label="Purchase Date"
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
            </Form.Item>

            <Form.Item
              name="projectId"
              label="Linked Project"
              rules={[{ required: true, message: 'Please select project' }]}
            >
              <Select placeholder="Select project">
                {mockProjects.map(p => (
                  <Option key={p.id} value={p.id}>{p.projectNo} - {p.modelCapacitySpec.substring(0, 30)}...</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="supplierName"
            label="Supplier Name"
            rules={[{ required: true, message: 'Please enter supplier name' }]}
          >
            <Input placeholder="Enter supplier name" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="materialComponentName"
              label="Material / Component Name"
              rules={[{ required: true, message: 'Please enter material name' }]}
            >
              <Input placeholder="e.g., SS304 Sheet, Servo Motor" />
            </Form.Item>

            <Form.Item
              name="specification"
              label="Specification"
              rules={[{ required: true, message: 'Please enter specification' }]}
            >
              <Input placeholder="e.g., 2mm thickness, 4x8 feet" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} placeholder="10" />
            </Form.Item>

            <Form.Item
              name="unit"
              label="Unit"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Select placeholder="Unit">
                {unitOptions.map(u => (
                  <Option key={u.value} value={u.value}>{u.label}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="rate"
              label="Rate (₹)"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                min={0}
                placeholder="8500" 
              />
            </Form.Item>

            <Form.Item label="Total Amount">
              <Input 
                value={quantity && rate ? formatCurrency(quantity * rate) : '₹0'} 
                disabled 
                style={{ fontWeight: 600 }}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              {purchaseStatusOptions.map(s => (
                <Option key={s.value} value={s.value}>{s.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="remarks" label="Remarks">
            <TextArea rows={2} placeholder="Additional notes" />
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
                {selectedPurchase ? 'Update Purchase' : 'Create Purchase'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Purchases;
