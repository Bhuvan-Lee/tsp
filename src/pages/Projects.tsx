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
  Tabs,
  Descriptions,
  Timeline,
  Empty,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  UploadOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { mockProjects, mockClients, mockPurchases, mockInvoices, mockSalesOrders } from '@/data/mockData';
import { Project, ProjectFormData, ProjectStatus, MachineType } from '@/types';
import { statusColors } from '@/config/antdTheme';

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

// Status configurations
const projectStatusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'enquiry', label: 'Enquiry' },
  { value: 'design', label: 'Design' },
  { value: 'fabrication', label: 'Fabrication' },
  { value: 'assembly', label: 'Assembly' },
  { value: 'testing', label: 'Testing' },
  { value: 'delivered', label: 'Delivered' },
];

const machineTypeOptions: { value: MachineType; label: string }[] = [
  { value: 'packing_machine', label: 'Packing Machine' },
  { value: 'conveyor', label: 'Conveyor' },
  { value: 'custom', label: 'Custom Machine' },
];

// Project Status Tag
const ProjectStatusTag: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const colorMap = statusColors[status as keyof typeof statusColors];
  const label = projectStatusOptions.find(s => s.value === status)?.label || status;
  return (
    <Tag 
      style={{ 
        backgroundColor: colorMap?.bg || '#f1f5f9', 
        color: colorMap?.text || '#64748b',
        border: `1px solid ${colorMap?.border || '#e2e8f0'}`,
        borderRadius: 4,
        fontWeight: 500,
      }}
    >
      {label}
    </Tag>
  );
};

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [form] = Form.useForm();

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.projectNo.toLowerCase().includes(searchText.toLowerCase()) ||
      project.modelCapacitySpec.toLowerCase().includes(searchText.toLowerCase()) ||
      mockClients.find(c => c.id === project.clientId)?.companyName.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get client name by ID
  const getClientName = (clientId: string) => 
    mockClients.find(c => c.id === clientId)?.companyName || 'Unknown';

  // Open modal for add/edit
  const openModal = (project?: Project) => {
    if (project) {
      setSelectedProject(project);
      form.setFieldsValue({
        ...project,
        startDate: dayjs(project.startDate),
        expectedDeliveryDate: dayjs(project.expectedDeliveryDate),
      });
    } else {
      setSelectedProject(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  // View project details
  const viewProject = (project: Project) => {
    setSelectedProject(project);
    setIsDetailModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = (values: any) => {
    const projectData: ProjectFormData = {
      ...values,
      startDate: values.startDate.format('YYYY-MM-DD'),
      expectedDeliveryDate: values.expectedDeliveryDate.format('YYYY-MM-DD'),
    };

    if (selectedProject) {
      setProjects(prev => prev.map(p => 
        p.id === selectedProject.id 
          ? { ...p, ...projectData, updatedAt: new Date().toISOString() }
          : p
      ));
      message.success('Project updated successfully');
    } else {
      const newProject: Project = {
        ...projectData,
        id: `proj-${Date.now()}`,
        projectNo: `JOB-${String(projects.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjects(prev => [...prev, newProject]);
      message.success('Project created successfully');
    }
    setIsModalOpen(false);
    form.resetFields();
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    message.success('Project deleted successfully');
  };

  // Get related data for project details
  const getProjectPurchases = (projectId: string) => 
    mockPurchases.filter(p => p.projectId === projectId);
  
  const getProjectInvoices = (projectId: string) => 
    mockInvoices.filter(i => i.projectId === projectId);
  
  const getProjectSalesOrder = (projectId: string) => 
    mockSalesOrders.find(s => s.projectId === projectId);

  // Table columns
  const columns: ColumnsType<Project> = [
    {
      title: 'Project No',
      dataIndex: 'projectNo',
      key: 'projectNo',
      sorter: (a, b) => a.projectNo.localeCompare(b.projectNo),
      render: (text) => <Text strong style={{ color: '#1e3a5f' }}>{text}</Text>,
    },
    {
      title: 'Client',
      key: 'client',
      sorter: (a, b) => getClientName(a.clientId).localeCompare(getClientName(b.clientId)),
      render: (_, record) => getClientName(record.clientId),
    },
    {
      title: 'Machine Type',
      dataIndex: 'machineType',
      key: 'machineType',
      render: (type) => {
        const label = machineTypeOptions.find(m => m.value === type)?.label || type;
        return <Tag>{label}</Tag>;
      },
      filters: machineTypeOptions.map(m => ({ text: m.label, value: m.value })),
      onFilter: (value, record) => record.machineType === value,
    },
    {
      title: 'Specification',
      dataIndex: 'modelCapacitySpec',
      key: 'spec',
      ellipsis: true,
      width: 250,
    },
    {
      title: 'Order Value',
      dataIndex: 'orderValue',
      key: 'orderValue',
      sorter: (a, b) => a.orderValue - b.orderValue,
      render: (value) => formatCurrency(value),
    },
    {
      title: 'Delivery Date',
      dataIndex: 'expectedDeliveryDate',
      key: 'delivery',
      sorter: (a, b) => new Date(a.expectedDeliveryDate).getTime() - new Date(b.expectedDeliveryDate).getTime(),
      render: (date) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <ProjectStatusTag status={status} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => viewProject(record)}
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
            title="Delete Project"
            description="Are you sure you want to delete this project?"
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

  // Detail modal tab items
  const getDetailTabs = () => {
    if (!selectedProject) return [];

    const purchases = getProjectPurchases(selectedProject.id);
    const invoices = getProjectInvoices(selectedProject.id);
    const salesOrder = getProjectSalesOrder(selectedProject.id);

    return [
      {
        key: 'overview',
        label: 'Overview',
        children: (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Project No">{selectedProject.projectNo}</Descriptions.Item>
            <Descriptions.Item label="Client">{getClientName(selectedProject.clientId)}</Descriptions.Item>
            <Descriptions.Item label="Machine Type">
              {machineTypeOptions.find(m => m.value === selectedProject.machineType)?.label}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <ProjectStatusTag status={selectedProject.status} />
            </Descriptions.Item>
            <Descriptions.Item label="Specification" span={2}>
              {selectedProject.modelCapacitySpec}
            </Descriptions.Item>
            <Descriptions.Item label="Order Value">{formatCurrency(selectedProject.orderValue)}</Descriptions.Item>
            <Descriptions.Item label="Start Date">{dayjs(selectedProject.startDate).format('DD MMM YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Expected Delivery">{dayjs(selectedProject.expectedDeliveryDate).format('DD MMM YYYY')}</Descriptions.Item>
            {selectedProject.actualDeliveryDate && (
              <Descriptions.Item label="Actual Delivery">{dayjs(selectedProject.actualDeliveryDate).format('DD MMM YYYY')}</Descriptions.Item>
            )}
            {selectedProject.notes && (
              <Descriptions.Item label="Notes" span={2}>{selectedProject.notes}</Descriptions.Item>
            )}
          </Descriptions>
        ),
      },
      {
        key: 'purchases',
        label: (
          <span>
            <ShoppingCartOutlined /> Purchases ({purchases.length})
          </span>
        ),
        children: purchases.length > 0 ? (
          <Table
            size="small"
            dataSource={purchases}
            rowKey="id"
            pagination={false}
            columns={[
              { title: 'Purchase No', dataIndex: 'purchaseNo', key: 'purchaseNo' },
              { title: 'Material', dataIndex: 'materialComponentName', key: 'material' },
              { title: 'Qty', key: 'qty', render: (_, r) => `${r.quantity} ${r.unit}` },
              { title: 'Amount', dataIndex: 'totalAmount', key: 'amount', render: formatCurrency },
              { 
                title: 'Status', 
                dataIndex: 'status', 
                key: 'status',
                render: (status) => (
                  <Tag color={status === 'received' ? 'success' : status === 'ordered' ? 'processing' : 'default'}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Tag>
                ),
              },
            ]}
          />
        ) : (
          <Empty description="No purchases linked to this project" />
        ),
      },
      {
        key: 'sales',
        label: (
          <span>
            <DollarOutlined /> Sales Order
          </span>
        ),
        children: salesOrder ? (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Sales Order No">{salesOrder.salesOrderNo}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={salesOrder.status === 'delivered' ? 'success' : 'processing'}>
                {salesOrder.status.replace('_', ' ').toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Machine Description" span={2}>{salesOrder.machineDescription}</Descriptions.Item>
            <Descriptions.Item label="Order Value">{formatCurrency(salesOrder.orderValue)}</Descriptions.Item>
            <Descriptions.Item label="Delivery Date">{dayjs(salesOrder.deliveryDate).format('DD MMM YYYY')}</Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty description="No sales order linked to this project" />
        ),
      },
      {
        key: 'billing',
        label: (
          <span>
            <FileTextOutlined /> Billing ({invoices.length})
          </span>
        ),
        children: invoices.length > 0 ? (
          <Table
            size="small"
            dataSource={invoices}
            rowKey="id"
            pagination={false}
            columns={[
              { title: 'Invoice No', dataIndex: 'invoiceNo', key: 'invoiceNo' },
              { title: 'Type', dataIndex: 'invoiceType', key: 'type', render: (t) => t.charAt(0).toUpperCase() + t.slice(1) },
              { title: 'Amount', dataIndex: 'totalAmount', key: 'amount', render: formatCurrency },
              { 
                title: 'Status', 
                dataIndex: 'paymentStatus', 
                key: 'status',
                render: (status) => (
                  <Tag color={status === 'paid' ? 'success' : status === 'pending' ? 'warning' : 'error'}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Tag>
                ),
              },
              { title: 'Due Date', dataIndex: 'dueDate', key: 'due', render: (d) => dayjs(d).format('DD MMM') },
            ]}
          />
        ) : (
          <Empty description="No invoices linked to this project" />
        ),
      },
      {
        key: 'documents',
        label: (
          <span>
            <UploadOutlined /> Documents
          </span>
        ),
        children: (
          <div>
            <Upload.Dragger
              name="files"
              multiple
              action="/upload"
              disabled
              style={{ marginBottom: 16 }}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Click or drag files to upload</p>
              <p className="ant-upload-hint">Drawings, BOM, approvals, etc.</p>
            </Upload.Dragger>
            <Empty description="Document upload will be available when connected to backend" />
          </div>
        ),
      },
      {
        key: 'activity',
        label: (
          <span>
            <HistoryOutlined /> Activity
          </span>
        ),
        children: (
          <Timeline
            items={[
              {
                color: 'green',
                children: `Project created on ${dayjs(selectedProject.createdAt).format('DD MMM YYYY')}`,
              },
              {
                color: 'blue',
                children: `Last updated on ${dayjs(selectedProject.updatedAt).format('DD MMM YYYY')}`,
              },
            ]}
          />
        ),
      },
    ];
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 4 }}>Projects</Title>
        <Text type="secondary">Manage machine orders and manufacturing jobs</Text>
      </div>

      {/* Actions Bar */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Space wrap>
            <Input
              placeholder="Search projects..."
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
              placeholder="Filter by status"
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Status</Option>
              {projectStatusOptions.map(s => (
                <Option key={s.value} value={s.value}>{s.label}</Option>
              ))}
            </Select>
          </Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            New Project
          </Button>
        </div>
      </Card>

      {/* Projects Table */}
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={filteredProjects}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} projects`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={selectedProject ? `Edit Project - ${selectedProject.projectNo}` : 'New Project'}
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
              rules={[{ required: true, message: 'Please select a client' }]}
            >
              <Select placeholder="Select client">
                {mockClients.map(c => (
                  <Option key={c.id} value={c.id}>{c.companyName}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="machineType"
              label="Machine Type"
              rules={[{ required: true, message: 'Please select machine type' }]}
            >
              <Select placeholder="Select machine type">
                {machineTypeOptions.map(m => (
                  <Option key={m.value} value={m.value}>{m.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="modelCapacitySpec"
            label="Model / Capacity / Specification"
            rules={[{ required: true, message: 'Please enter specification' }]}
          >
            <TextArea rows={2} placeholder="e.g., Automatic Pouch Packing Machine - 60 pouches/min, 50g-500g range" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="orderValue"
              label="Order Value (₹)"
              rules={[{ required: true, message: 'Please enter order value' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/,/g, '') as unknown as number}
                placeholder="850000"
              />
            </Form.Item>

            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true, message: 'Please select start date' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
            </Form.Item>

            <Form.Item
              name="expectedDeliveryDate"
              label="Expected Delivery"
              rules={[{ required: true, message: 'Please select delivery date' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
            </Form.Item>
          </div>

          <Form.Item
            name="status"
            label="Project Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              {projectStatusOptions.map(s => (
                <Option key={s.value} value={s.value}>{s.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Notes">
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
                {selectedProject ? 'Update Project' : 'Create Project'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Project Detail Modal */}
      <Modal
        title={selectedProject ? `${selectedProject.projectNo} - ${getClientName(selectedProject.clientId)}` : 'Project Details'}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Close
          </Button>,
          <Button 
            key="edit" 
            type="primary"
            onClick={() => {
              setIsDetailModalOpen(false);
              if (selectedProject) openModal(selectedProject);
            }}
          >
            Edit Project
          </Button>,
        ]}
      >
        <Tabs items={getDetailTabs()} />
      </Modal>
    </div>
  );
};

export default Projects;
