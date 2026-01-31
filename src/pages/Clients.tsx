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
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { mockClients } from '@/data/mockData';
import { Client, ClientFormData } from '@/types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // Filter clients based on search
  const filteredClients = clients.filter(client => 
    client.companyName.toLowerCase().includes(searchText.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(searchText.toLowerCase()) ||
    client.email.toLowerCase().includes(searchText.toLowerCase())
  );

  // Open modal for add/edit
  const openModal = (client?: Client) => {
    if (client) {
      setSelectedClient(client);
      form.setFieldsValue(client);
    } else {
      setSelectedClient(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  // View client details
  const viewClient = (client: Client) => {
    setSelectedClient(client);
    setIsViewModalOpen(true);
  };

  // Handle form submit
  const handleSubmit = (values: ClientFormData) => {
    if (selectedClient) {
      // Update existing client
      setClients(prev => prev.map(c => 
        c.id === selectedClient.id 
          ? { ...c, ...values, updatedAt: new Date().toISOString() }
          : c
      ));
      message.success('Client updated successfully');
    } else {
      // Add new client
      const newClient: Client = {
        ...values,
        id: `client-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setClients(prev => [...prev, newClient]);
      message.success('Client added successfully');
    }
    setIsModalOpen(false);
    form.resetFields();
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    message.success('Client deleted successfully');
  };

  // Table columns
  const columns: ColumnsType<Client> = [
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
      sorter: (a, b) => a.companyName.localeCompare(b.companyName),
      render: (text, record) => (
        <div>
          <Text strong style={{ display: 'block' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.address}</Text>
        </div>
      ),
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      sorter: (a, b) => a.contactPerson.localeCompare(b.contactPerson),
    },
    {
      title: 'Contact Info',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space size={4}>
            <PhoneOutlined style={{ color: '#64748b' }} />
            <Text style={{ fontSize: 13 }}>{record.phoneNumber}</Text>
          </Space>
          <Space size={4}>
            <MailOutlined style={{ color: '#64748b' }} />
            <Text style={{ fontSize: 13 }}>{record.email}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'GST Number',
      dataIndex: 'gstNumber',
      key: 'gstNumber',
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => viewClient(record)}
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
            title="Delete Client"
            description="Are you sure you want to delete this client?"
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
        <Title level={2} style={{ marginBottom: 4 }}>Clients</Title>
        <Text type="secondary">Manage your client database</Text>
      </div>

      {/* Actions Bar */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Input
            placeholder="Search clients..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Add Client
          </Button>
        </div>
      </Card>

      {/* Clients Table */}
      <Card bordered={false}>
        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} clients`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={selectedClient ? 'Edit Client' : 'Add New Client'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="companyName"
            label="Company Name"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input placeholder="Enter company name" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <TextArea rows={2} placeholder="Enter full address" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="contactPerson"
              label="Contact Person"
              rules={[{ required: true, message: 'Please enter contact person' }]}
            >
              <Input placeholder="Enter contact person name" />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              rules={[{ required: true, message: 'Please enter phone number' }]}
            >
              <Input placeholder="+91 XXXXX XXXXX" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input placeholder="email@example.com" />
            </Form.Item>

            <Form.Item
              name="gstNumber"
              label="GST Number"
              rules={[{ required: true, message: 'Please enter GST number' }]}
            >
              <Input placeholder="22AAAAA0000A1Z5" />
            </Form.Item>
          </div>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={3} placeholder="Additional notes about the client" />
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
                {selectedClient ? 'Update Client' : 'Add Client'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Client Modal */}
      <Modal
        title="Client Details"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalOpen(false)}>
            Close
          </Button>,
          <Button 
            key="edit" 
            type="primary"
            onClick={() => {
              setIsViewModalOpen(false);
              if (selectedClient) openModal(selectedClient);
            }}
          >
            Edit Client
          </Button>,
        ]}
        width={500}
      >
        {selectedClient && (
          <div style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>Company Name</Text>
              <div><Text strong style={{ fontSize: 16 }}>{selectedClient.companyName}</Text></div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>Address</Text>
              <div><Text>{selectedClient.address}</Text></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>Contact Person</Text>
                <div><Text>{selectedClient.contactPerson}</Text></div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>Phone Number</Text>
                <div><Text>{selectedClient.phoneNumber}</Text></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>Email</Text>
                <div><Text>{selectedClient.email}</Text></div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>GST Number</Text>
                <div><Tag>{selectedClient.gstNumber}</Tag></div>
              </div>
            </div>

            {selectedClient.notes && (
              <div>
                <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>Notes</Text>
                <div><Text>{selectedClient.notes}</Text></div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Clients;
