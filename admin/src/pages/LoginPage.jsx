import { useState } from 'react';
import { Button, Card, Form, Input, Typography, message, Space } from 'antd';
import { LockOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { emailOrPhoneRule, passwordRule } from '../utils/validators';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Welcome back');
      navigate('/');
    } catch (err) {
      message.error(err.response?.data?.message || 'Invalid email/phone or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card" bordered={false}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }} align="center">
          <div className="admin-shield">
            <SafetyCertificateOutlined style={{ fontSize: 42, color: '#C9A227' }} />
          </div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Admin Login
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ textAlign: 'center' }}>
            DT Car Bazaar — secure admin access
          </Typography.Paragraph>
        </Space>
        <Form layout="vertical" onFinish={onFinish} style={{ marginTop: 24 }} validateTrigger={['onBlur', 'onChange']}>
          <Form.Item
            name="email"
            label="Email / Phone"
            rules={[emailOrPhoneRule()]}
          >
            <Input prefix={<MailOutlined />} size="large" placeholder="admin@dtcarbazaar.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[passwordRule(6)]}
          >
            <Input.Password prefix={<LockOutlined />} size="large" placeholder="Password" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            style={{ background: '#C9A227', borderColor: '#C9A227' }}
          >
            LOGIN
          </Button>
        </Form>
      </Card>
    </div>
  );
}
