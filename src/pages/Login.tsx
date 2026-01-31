import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  message,
  Checkbox,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    
    // Simulate login - in production, this would call your Django API
    setTimeout(() => {
      // Demo credentials check
      if (values.username === 'admin' && values.password === 'admin123') {
        message.success('Login successful!');
        navigate('/dashboard');
      } else {
        message.error('Invalid credentials. Use admin / admin123 for demo.');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
        padding: 24,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        }}
        bordered={false}
      >
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #1e3a5f, #ea580c)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: '#ffffff',
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              TSP
            </Text>
          </div>
          <Title level={3} style={{ marginBottom: 4 }}>
            TSP Metal Works
          </Title>
          <Text type="secondary">Manufacturing ERP - Admin Login</Text>
        </div>

        {/* Login Form */}
        <Form
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          size="large"
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 44,
                fontWeight: 600,
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        {/* Demo Credentials */}
        <div
          style={{
            padding: 16,
            background: '#f8fafc',
            borderRadius: 8,
            marginTop: 16,
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            Demo Credentials:
          </Text>
          <div style={{ marginTop: 4 }}>
            <Text code>Username: admin</Text>
            <br />
            <Text code>Password: admin123</Text>
          </div>
        </div>

        {/* Footer */}
        <Paragraph
          style={{
            textAlign: 'center',
            marginTop: 24,
            marginBottom: 0,
            color: '#94a3b8',
            fontSize: 12,
          }}
        >
          Strictly for internal admin use only
        </Paragraph>
      </Card>
    </div>
  );
};

export default Login;
