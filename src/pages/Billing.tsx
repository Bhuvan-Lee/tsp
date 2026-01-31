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
  Divider,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { mockInvoices, mockClients, mockProjects } from '@/data/mockData';
import { Invoice, InvoiceFormData, InvoiceType, PaymentStatus } from '@/types';
import { paymentStatusColors } from '@/config/antdTheme';

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

// Options
const invoiceTypeOptions: { value: InvoiceType; label: string }[] = [
  { value: 'advance', label: 'Advance Invoice' },
  { value: 'stage', label: 'Stage/Milestone Invoice' },
  { value: 'final', label: 'Final Invoice' },
];

const paymentStatusOptions: { value: PaymentStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

// Payment Status Tag
const PaymentStatusTag: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const colorMap = paymentStatusColors[status as keyof typeof paymentStatusColors];
  const label = paymentStatusOptions.find(s => s.value === status)?.label || status;
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

const Billing: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [form] = Form.useForm();

  // Watch fields for auto-calculation
  const subtotal = Form.useWatch('subtotal', form);
  const gstPercentage = Form.useWatch('gstPercentage', form);

  // Calculate GST and Total
  const calculatedGST = subtotal && gstPercentage ? (subtotal * gstPercentage) / 100 : 0;
  const calculatedTotal = subtotal ? subtotal + calculatedGST : 0;

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNo.toLowerCase().includes(searchText.toLowerCase()) ||
      mockClients.find(c => c.id === invoice.clientId)?.companyName.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.paymentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get client name by ID
  const getClientName = (clientId: string) => 
    mockClients.find(c => c.id === clientId)?.companyName || 'Unknown';

  // Get project no by ID
  const getProjectNo = (projectId: string) => 
    mockProjects.find(p => p.id === projectId)?.projectNo || 'Unknown';

  // Open modal for add/edit
  const openModal = (invoice?: Invoice) => {
    if (invoice) {
      setSelectedInvoice(invoice);
      form.setFieldsValue({
        ...invoice,
        invoiceDate: dayjs(invoice.invoiceDate),
        dueDate: dayjs(invoice.dueDate),
      });
    } else {
      setSelectedInvoice(null);
      form.resetFields();
      form.setFieldsValue({ gstPercentage: 18 });
    }
    setIsModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = (values: any) => {
    const gstAmount = (values.subtotal * values.gstPercentage) / 100;
    const totalAmount = values.subtotal + gstAmount;

    const invoiceData: InvoiceFormData = {
      ...values,
      invoiceDate: values.invoiceDate.format('YYYY-MM-DD'),
      dueDate: values.dueDate.format('YYYY-MM-DD'),
    };

    if (selectedInvoice) {
      setInvoices(prev => prev.map(i => 
        i.id === selectedInvoice.id 
          ? { ...i, ...invoiceData, gstAmount, totalAmount, updatedAt: new Date().toISOString() }
          : i
      ));
      message.success('Invoice updated successfully');
    } else {
      const newInvoice: Invoice = {
        ...invoiceData,
        gstAmount,
        totalAmount,
        id: `inv-${Date.now()}`,
        invoiceNo: `TSP-INV-${String(invoices.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setInvoices(prev => [...prev, newInvoice]);
      message.success('Invoice created successfully');
    }
    setIsModalOpen(false);
    form.resetFields();
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
    message.success('Invoice deleted successfully');
  };

  // Export placeholder
  const handleExport = (invoice: Invoice) => {
    message.info('PDF export will be available when connected to backend');
  };

  // Calculate summary
  const totalInvoiced = filteredInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const paidAmount = filteredInvoices.filter(i => i.paymentStatus === 'paid').reduce((sum, i) => sum + i.totalAmount, 0);
  const pendingAmount = filteredInvoices.filter(i => i.paymentStatus === 'pending').reduce((sum, i) => sum + i.totalAmount, 0);
  const overdueAmount = filteredInvoices.filter(i => i.paymentStatus === 'overdue').reduce((sum, i) => sum + i.totalAmount, 0);

  // Table columns
  const columns: ColumnsType<Invoice> = [
    {
      title: 'Invoice No',
      dataIndex: 'invoiceNo',
      key: 'invoiceNo',
      sorter: (a, b) => a.invoiceNo.localeCompare(b.invoiceNo),
      render: (text) => <Text strong style={{ color: '#1e3a5f' }}>{text}</Text>,
    },
    {
      title: 'Date',
      dataIndex: 'invoiceDate',
      key: 'date',
      sorter: (a, b) => new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime(),
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Client',
      key: 'client',
      render: (_, record) => getClientName(record.clientId),
    },
    {
      title: 'Project',
      key: 'project',
      render: (_, record) => <Tag>{getProjectNo(record.projectId)}</Tag>,
    },
    {
      title: 'Type',
      dataIndex: 'invoiceType',
      key: 'type',
      render: (type) => {
        const label = invoiceTypeOptions.find(t => t.value === type)?.label || type;
        return <Tag color={type === 'advance' ? 'blue' : type === 'stage' ? 'orange' : 'green'}>{label}</Tag>;
      },
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (value) => formatCurrency(value),
    },
    {
      title: 'GST',
      dataIndex: 'gstAmount',
      key: 'gst',
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
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => dayjs(date).format('DD MMM'),
    },
    {
      title: 'Status',
      dataIndex: 'paymentStatus',
      key: 'status',
      render: (status) => <PaymentStatusTag status={status} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 130,
      render: (_, record) => (
        <Space>
          <Tooltip title="Export PDF">
            <Button 
              type="text" 
              icon={<FilePdfOutlined />} 
              onClick={() => handleExport(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Invoice"
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
        <Title level={2} style={{ marginBottom: 4 }}>Billing</Title>
        <Text type="secondary">Manage invoices and milestone-based billing</Text>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
        <Card bordered={false} size="small">
          <Text type="secondary">Total Invoiced</Text>
          <div><Text strong style={{ fontSize: 18 }}>{formatCurrency(totalInvoiced)}</Text></div>
        </Card>
        <Card bordered={false} size="small">
          <Text type="secondary">Paid</Text>
          <div><Text strong style={{ fontSize: 18, color: '#16a34a' }}>{formatCurrency(paidAmount)}</Text></div>
        </Card>
        <Card bordered={false} size="small">
          <Text type="secondary">Pending</Text>
          <div><Text strong style={{ fontSize: 18, color: '#d97706' }}>{formatCurrency(pendingAmount)}</Text></div>
        </Card>
        <Card bordered={false} size="small">
          <Text type="secondary">Overdue</Text>
          <div><Text strong style={{ fontSize: 18, color: '#dc2626' }}>{formatCurrency(overdueAmount)}</Text></div>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Space wrap>
            <Input
              placeholder="Search invoices..."
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
              {paymentStatusOptions.map(s => (
                <Option key={s.value} value={s.value}>{s.label}</Option>
              ))}
            </Select>
          </Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            New Invoice
          </Button>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} invoices`,
          }}
          scroll={{ x: 1300 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={selectedInvoice ? `Edit Invoice - ${selectedInvoice.invoiceNo}` : 'New Invoice'}
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
          initialValues={{ gstPercentage: 18 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="invoiceDate"
              label="Invoice Date"
              rules={[{ required: true, message: 'Required' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
            </Form.Item>

            <Form.Item
              name="dueDate"
              label="Due Date"
              rules={[{ required: true, message: 'Required' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
            </Form.Item>
          </div>

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
              label="Project"
              rules={[{ required: true, message: 'Please select project' }]}
            >
              <Select placeholder="Select project">
                {mockProjects.map(p => (
                  <Option key={p.id} value={p.id}>{p.projectNo}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="invoiceType"
              label="Invoice Type"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Select placeholder="Select type">
                {invoiceTypeOptions.map(t => (
                  <Option key={t.value} value={t.value}>{t.label}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="invoicePercentage"
              label="Invoice Percentage (%)"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber style={{ width: '100%' }} min={1} max={100} placeholder="30" />
            </Form.Item>
          </div>

          <Divider>Amount Calculation</Divider>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="subtotal"
              label="Subtotal (₹)"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber 
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/,/g, '') as unknown as number}
                placeholder="255000" 
              />
            </Form.Item>

            <Form.Item
              name="gstPercentage"
              label="GST %"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} max={28} />
            </Form.Item>

            <Form.Item label="Total Amount">
              <Input 
                value={formatCurrency(calculatedTotal)} 
                disabled 
                style={{ fontWeight: 700, fontSize: 16 }}
              />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item label="GST Amount">
              <Input value={formatCurrency(calculatedGST)} disabled />
            </Form.Item>

            <Form.Item
              name="paymentStatus"
              label="Payment Status"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Select placeholder="Select status">
                {paymentStatusOptions.map(s => (
                  <Option key={s.value} value={s.value}>{s.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

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
                {selectedInvoice ? 'Update Invoice' : 'Create Invoice'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Billing;
