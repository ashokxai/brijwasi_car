import { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Statistic, Table, Tag, Typography, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../services/adminService';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data.data))
      .catch((err) => message.error(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => navigate('/cars')}>
          {title}
        </Button>
      ),
    },
    {
      title: 'Brand',
      key: 'brand',
      render: (_, row) => row.brand?.name || '-',
    },
    {
      title: 'Listed By',
      key: 'listedBy',
      render: (_, row) => row.listedBy?.name || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => <Tag color="orange">{status}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => navigate('/cars')}>
          View in Cars
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={3}>Dashboard</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card loading={loading}><Statistic title="Total Cars" value={stats.totalCars || 0} /></Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card loading={loading}><Statistic title="Pending" value={stats.pendingCars || 0} valueStyle={{ color: '#d48806' }} /></Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card loading={loading}><Statistic title="Approved" value={stats.approvedCars || 0} valueStyle={{ color: '#389e0d' }} /></Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card loading={loading}><Statistic title="Rejected" value={stats.rejectedCars || 0} valueStyle={{ color: '#cf1322' }} /></Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card loading={loading}><Statistic title="Users" value={stats.totalUsers || 0} /></Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card loading={loading}><Statistic title="Brands" value={stats.totalBrands || 0} /></Card>
        </Col>
      </Row>

      <Typography.Title level={4} style={{ marginTop: 32 }}>
        Recent Pending Listings
      </Typography.Title>
      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={data?.recentPending || []}
        pagination={false}
      />
    </div>
  );
}
