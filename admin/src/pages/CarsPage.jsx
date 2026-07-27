import { useEffect, useState } from 'react';
import {
  Button,
  Descriptions,
  Drawer,
  Image,
  Input,
  Popconfirm,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { getAdminCars, updateCarStatus } from '../services/adminService';
import api from '../services/api';

const API_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace(/\/api$/, '');

function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_HOST}${path}`;
}

function statusColor(s) {
  if (s === 'approved') return 'green';
  if (s === 'pending') return 'gold';
  return 'red';
}

export default function CarsPage() {
  const [status, setStatus] = useState('all');
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [search, setSearch] = useState('');

  const load = async (tab = status, searchTerm = search) => {
    setLoading(true);
    try {
      const params = {
        ...(tab === 'all' ? {} : { status: tab }),
        ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
      };
      const { data } = await getAdminCars(params);
      setCars(data.data);
      if (selected) {
        const refreshed = data.data.find((c) => c._id === selected._id);
        if (refreshed) setSelected(refreshed);
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('all', '');
  }, []);

  const onTab = (key) => {
    setStatus(key);
    load(key, search);
  };

  const openDetails = (car) => {
    setSelected(car);
    setRejectReason(car.rejectionReason || '');
  };

  const setCarStatus = async (id, nextStatus) => {
    if (nextStatus === 'rejected') {
      const reason = rejectReason.trim();
      if (reason.length < 10) {
        message.error('Please enter a rejection reason (at least 10 characters)');
        return;
      }
      if (reason.length > 500) {
        message.error('Rejection reason must be under 500 characters');
        return;
      }
    }
    try {
      await updateCarStatus(id, {
        status: nextStatus,
        isCertified: nextStatus === 'approved',
        rejectionReason: nextStatus === 'rejected' ? rejectReason.trim() : '',
      });
      message.success(`Car ${nextStatus}`);
      await load(status);
    } catch (err) {
      message.error(err.response?.data?.message || 'Update failed');
    }
  };

  const removeCar = async (id) => {
    try {
      await api.delete(`/admin/cars/${id}`);
      message.success('Car deleted');
      setSelected(null);
      load(status);
    } catch (err) {
      message.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    {
      title: 'Car Key',
      dataIndex: 'carKey',
      width: 140,
      render: (key, row) => (
        <Button type="link" style={{ padding: 0, fontWeight: 700 }} onClick={() => openDetails(row)}>
          {key || '-'}
        </Button>
      ),
    },
    {
      title: 'Image',
      key: 'image',
      render: (_, row) =>
        row.images?.[0] ? (
          <Image
            src={imageUrl(row.images[0])}
            width={72}
            height={48}
            style={{ objectFit: 'cover', cursor: 'pointer' }}
            preview={false}
            onClick={() => openDetails(row)}
          />
        ) : (
          '-'
        ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      render: (title, row) => (
        <Button type="link" style={{ padding: 0, fontWeight: 600 }} onClick={() => openDetails(row)}>
          {title}
        </Button>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: (v) => `₹${Number(v).toLocaleString('en-IN')}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s) => <Tag color={statusColor(s)}>{s}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <Space wrap>
          <Button size="small" icon={<EyeOutlined />} onClick={() => openDetails(row)}>
            View
          </Button>
          {row.status !== 'approved' && (
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              style={{ background: '#389e0d' }}
              onClick={() => setCarStatus(row._id, 'approved')}
            >
              Approve
            </Button>
          )}
          {row.status !== 'rejected' && (
            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => {
                openDetails(row);
              }}
            >
              Reject
            </Button>
          )}
          <Popconfirm title="Delete this car?" onConfirm={() => removeCar(row._id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={3}>Manage Cars</Typography.Title>
      <Space style={{ marginBottom: 12 }} wrap>
        <Input.Search
          allowClear
          placeholder="Search by Car Key or title (e.g. DT-2026-00001)"
          style={{ width: 360 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => load(status, value)}
          enterButton="Search"
        />
      </Space>
      <Tabs
        activeKey={status}
        onChange={onTab}
        items={[
          { key: 'all', label: 'All Cars' },
          { key: 'approved', label: 'Approved' },
          { key: 'pending', label: 'Pending' },
          { key: 'rejected', label: 'Rejected' },
        ]}
      />
      <Table rowKey="_id" loading={loading} columns={columns} dataSource={cars} />

      <Drawer
        title={selected ? `Car details — ${selected.title}` : 'Car details'}
        placement="right"
        width={Math.min(720, typeof window !== 'undefined' ? window.innerWidth - 40 : 720)}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        extra={
          selected ? (
            <Space>
              {selected.status !== 'approved' && (
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  style={{ background: '#389e0d', borderColor: '#389e0d' }}
                  onClick={() => setCarStatus(selected._id, 'approved')}
                >
                  Approve
                </Button>
              )}
              {selected.status !== 'rejected' && (
                <Button danger icon={<CloseOutlined />} onClick={() => setCarStatus(selected._id, 'rejected')}>
                  Reject
                </Button>
              )}
            </Space>
          ) : null
        }
      >
        {selected && (
          <div>
            <Tag color={statusColor(selected.status)} style={{ marginBottom: 16 }}>
              {selected.status}
            </Tag>
            {selected.isCertified && <Tag color="gold">Certified</Tag>}

            <Typography.Title level={5}>Photos ({selected.images?.length || 0})</Typography.Title>
            <Image.PreviewGroup>
              <Space wrap size={12} style={{ marginBottom: 20 }}>
                {(selected.images || []).map((img) => (
                  <Image
                    key={img}
                    src={imageUrl(img)}
                    width={140}
                    height={100}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                  />
                ))}
              </Space>
            </Image.PreviewGroup>

            <Descriptions bordered column={1} size="small" title="Specifications">
              <Descriptions.Item label="Car Key">
                <Typography.Text strong copyable={Boolean(selected.carKey)}>
                  {selected.carKey || '-'}
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Title">{selected.title}</Descriptions.Item>
              <Descriptions.Item label="Brand">{selected.brand?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Model">{selected.model?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Year">{selected.year}</Descriptions.Item>
              <Descriptions.Item label="Price">
                ₹{Number(selected.price).toLocaleString('en-IN')}
              </Descriptions.Item>
              <Descriptions.Item label="KM Driven">
                {Number(selected.kmDriven).toLocaleString('en-IN')} KM
              </Descriptions.Item>
              <Descriptions.Item label="Fuel Type">{selected.fuelType?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Transmission">{selected.transmission || '-'}</Descriptions.Item>
              <Descriptions.Item label="Ownership">{selected.ownership || '-'}</Descriptions.Item>
              <Descriptions.Item label="Insurance">
                {selected.insuranceValidity || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="City">{selected.city?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Description">
                {selected.description || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions
              bordered
              column={1}
              size="small"
              title="Submitted by"
              style={{ marginTop: 20 }}
            >
              <Descriptions.Item label="Name">{selected.listedBy?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Email">{selected.listedBy?.email || '-'}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selected.listedBy?.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="Role">{selected.listedByRole || '-'}</Descriptions.Item>
              <Descriptions.Item label="Submitted">
                {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '-'}
              </Descriptions.Item>
              {selected.rejectionReason ? (
                <Descriptions.Item label="Rejection reason">
                  {selected.rejectionReason}
                </Descriptions.Item>
              ) : null}
            </Descriptions>

            {selected.status !== 'rejected' && (
              <div style={{ marginTop: 20 }}>
                <Typography.Text strong>Rejection reason (required to reject)</Typography.Text>
                <Input.TextArea
                  rows={3}
                  style={{ marginTop: 8 }}
                  value={rejectReason}
                  maxLength={500}
                  showCount
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this listing is rejected (min 10 characters)"
                />
              </div>
            )}

            <Space style={{ marginTop: 24 }}>
              <Popconfirm title="Delete this car?" onConfirm={() => removeCar(selected._id)}>
                <Button danger icon={<DeleteOutlined />}>
                  Delete listing
                </Button>
              </Popconfirm>
            </Space>
          </div>
        )}
      </Drawer>
    </div>
  );
}
