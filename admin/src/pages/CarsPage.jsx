import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Descriptions,
  Drawer,
  Form,
  Image,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  getAdminCars,
  updateCarStatus,
  updateAdminCar,
  getBrands,
  getModels,
  getCities,
  getFuelTypes,
} from '../services/adminService';
import api from '../services/api';
import {
  titleRule,
  required,
  yearRule,
  positiveNumberRule,
  nonNegativeIntRule,
} from '../utils/validators';

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

function idOf(ref) {
  if (!ref) return undefined;
  return typeof ref === 'object' ? ref._id : ref;
}

export default function CarsPage() {
  const [status, setStatus] = useState('all');
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [cities, setCities] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const brandId = Form.useWatch('brand', form);

  useEffect(() => {
    Promise.all([getBrands(), getModels(), getCities(), getFuelTypes()])
      .then(([b, m, c, f]) => {
        setBrands(b.data.data);
        setModels(m.data.data);
        setCities(c.data.data);
        setFuelTypes(f.data.data);
      })
      .catch(() => message.error('Failed to load dropdown data'));
  }, []);

  const filteredModels = useMemo(() => {
    if (!brandId) return models;
    return models.filter((m) => (m.brand?._id || m.brand) === brandId);
  }, [models, brandId]);

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
        if (refreshed) {
          setSelected(refreshed);
          if (editing) fillEditForm(refreshed);
        }
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

  const fillEditForm = (car) => {
    form.setFieldsValue({
      title: car.title,
      brand: idOf(car.brand),
      model: idOf(car.model),
      year: car.year,
      price: car.price,
      kmDriven: car.kmDriven,
      fuelType: idOf(car.fuelType),
      city: idOf(car.city),
      transmission: car.transmission || 'Manual',
      ownership: car.ownership || 'First Owner',
      insuranceValidity: car.insuranceValidity || '',
      description: car.description || '',
      isCertified: Boolean(car.isCertified),
      status: car.status,
    });
    setFileList(
      (car.images || []).map((img, index) => ({
        uid: `existing-${index}-${img}`,
        name: img.split('/').pop() || `photo-${index + 1}.jpg`,
        status: 'done',
        url: imageUrl(img),
        thumbUrl: imageUrl(img),
        existingPath: img,
      }))
    );
  };

  const openDetails = (car, startEditing = false) => {
    setSelected(car);
    setRejectReason(car.rejectionReason || '');
    setEditing(startEditing);
    if (startEditing) fillEditForm(car);
  };

  const closeDrawer = () => {
    setSelected(null);
    setEditing(false);
    form.resetFields();
    setFileList([]);
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
      closeDrawer();
      load(status);
    } catch (err) {
      message.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const beforeUpload = (file) => {
    const okType = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type);
    if (!okType) {
      message.error('Only JPG, PNG or WebP images are allowed');
      return Upload.LIST_IGNORE;
    }
    const okSize = file.size / 1024 / 1024 < 5;
    if (!okSize) {
      message.error('Each image must be under 5MB');
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const saveEdits = async () => {
    try {
      const values = await form.validateFields();
      if (fileList.length < 1) {
        message.error('Keep or upload at least 1 photo');
        return;
      }
      if (fileList.length > 10) {
        message.error('Maximum 10 photos allowed');
        return;
      }

      setSaving(true);
      const formData = new FormData();
      const fields = [
        'title',
        'brand',
        'model',
        'year',
        'price',
        'kmDriven',
        'fuelType',
        'city',
        'transmission',
        'ownership',
        'insuranceValidity',
        'description',
        'status',
      ];
      fields.forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });
      formData.append('isCertified', values.isCertified ? 'true' : 'false');

      const keepImages = fileList
        .filter((f) => f.existingPath)
        .map((f) => f.existingPath);
      formData.append('keepImages', JSON.stringify(keepImages));

      fileList.forEach((file) => {
        if (file.originFileObj) formData.append('images', file.originFileObj);
      });

      const { data } = await updateAdminCar(selected._id, formData);
      message.success('Car updated');
      setSelected(data.data);
      setEditing(false);
      fillEditForm(data.data);
      await load(status);
    } catch (err) {
      if (err?.errorFields) {
        message.error('Please fix the highlighted fields');
        return;
      }
      message.error(err.response?.data?.message || 'Failed to update car');
    } finally {
      setSaving(false);
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
          <Button size="small" icon={<EditOutlined />} onClick={() => openDetails(row, true)}>
            Edit
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
              onClick={() => openDetails(row)}
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
        title={
          selected
            ? `${editing ? 'Edit car' : 'Car details'} — ${selected.title}`
            : 'Car details'
        }
        placement="right"
        width={Math.min(820, typeof window !== 'undefined' ? window.innerWidth - 24 : 820)}
        open={Boolean(selected)}
        onClose={closeDrawer}
        destroyOnClose
        extra={
          selected ? (
            <Space wrap>
              {!editing ? (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditing(true);
                    fillEditForm(selected);
                  }}
                >
                  Edit all fields
                </Button>
              ) : (
                <>
                  <Button onClick={() => setEditing(false)}>Cancel edit</Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={saveEdits}
                    style={{ background: '#C9A227', borderColor: '#C9A227' }}
                  >
                    Save changes
                  </Button>
                </>
              )}
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
        {selected && !editing && (
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
              <Descriptions.Item label="Year of Purchase">{selected.year}</Descriptions.Item>
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
              <Button
                icon={<EditOutlined />}
                type="primary"
                style={{ background: '#C9A227', borderColor: '#C9A227' }}
                onClick={() => {
                  setEditing(true);
                  fillEditForm(selected);
                }}
              >
                Edit listing
              </Button>
              <Popconfirm title="Delete this car?" onConfirm={() => removeCar(selected._id)}>
                <Button danger icon={<DeleteOutlined />}>
                  Delete listing
                </Button>
              </Popconfirm>
            </Space>
          </div>
        )}

        {selected && editing && (
          <Form
            form={form}
            layout="vertical"
            validateTrigger={['onBlur', 'onChange']}
            style={{ paddingBottom: 24 }}
          >
            <Form.Item name="title" label="Title" rules={[titleRule()]}>
              <Input maxLength={100} />
            </Form.Item>

            <Space size="large" style={{ display: 'flex' }} wrap>
              <Form.Item name="brand" label="Brand" rules={[required('Brand is required')]} style={{ minWidth: 220 }}>
                <Select
                  options={brands.map((b) => ({ value: b._id, label: b.name }))}
                  onChange={() => form.setFieldValue('model', undefined)}
                />
              </Form.Item>
              <Form.Item name="model" label="Model" rules={[required('Model is required')]} style={{ minWidth: 220 }}>
                <Select options={filteredModels.map((m) => ({ value: m._id, label: m.name }))} />
              </Form.Item>
            </Space>

            <Space size="large" style={{ display: 'flex' }} wrap>
              <Form.Item name="year" label="Year of Purchase" rules={[yearRule()]}>
                <InputNumber min={1980} max={new Date().getFullYear()} style={{ width: 160 }} />
              </Form.Item>
              <Form.Item name="price" label="Price (₹)" rules={[positiveNumberRule('Price')]}>
                <InputNumber min={1} style={{ width: 180 }} />
              </Form.Item>
              <Form.Item name="kmDriven" label="KM Driven" rules={[nonNegativeIntRule('KM driven')]}>
                <InputNumber min={0} precision={0} style={{ width: 160 }} />
              </Form.Item>
            </Space>

            <Space size="large" style={{ display: 'flex' }} wrap>
              <Form.Item name="fuelType" label="Fuel Type" rules={[required('Fuel type is required')]} style={{ minWidth: 180 }}>
                <Select options={fuelTypes.map((f) => ({ value: f._id, label: f.name }))} />
              </Form.Item>
              <Form.Item name="city" label="City" rules={[required('City is required')]} style={{ minWidth: 180 }}>
                <Select options={cities.map((c) => ({ value: c._id, label: c.name }))} />
              </Form.Item>
              <Form.Item name="transmission" label="Transmission" rules={[required('Transmission is required')]} style={{ minWidth: 160 }}>
                <Select options={[{ value: 'Manual' }, { value: 'Automatic' }]} />
              </Form.Item>
            </Space>

            <Space size="large" style={{ display: 'flex' }} wrap>
              <Form.Item name="ownership" label="Ownership" rules={[required('Ownership is required')]} style={{ minWidth: 200 }}>
                <Select
                  options={[
                    'First Owner',
                    'Second Owner',
                    'Third Owner',
                    'Fourth Owner or more',
                  ].map((v) => ({ value: v }))}
                />
              </Form.Item>
              <Form.Item
                name="insuranceValidity"
                label="Insurance Validity"
                rules={[{ max: 40, message: 'Must be under 40 characters' }]}
              >
                <Input maxLength={40} />
              </Form.Item>
              <Form.Item name="status" label="Status" rules={[required('Status is required')]} style={{ minWidth: 160 }}>
                <Select
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                  ]}
                />
              </Form.Item>
            </Space>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ max: 1000, message: 'Must be under 1000 characters' }]}
            >
              <Input.TextArea rows={3} maxLength={1000} showCount />
            </Form.Item>

            <Form.Item name="isCertified" valuePropName="checked">
              <Checkbox>Certified listing</Checkbox>
            </Form.Item>

            <Form.Item label="Photos (1–10)" required extra="Remove existing photos or upload new ones">
              <Upload
                listType="picture-card"
                fileList={fileList}
                beforeUpload={beforeUpload}
                onChange={({ fileList: next }) => setFileList(next.slice(0, 10))}
                accept="image/jpeg,image/png,image/webp"
              >
                {fileList.length >= 10 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={saveEdits}
                style={{ background: '#C9A227', borderColor: '#C9A227' }}
              >
                Save changes
              </Button>
              <Button onClick={() => setEditing(false)}>Cancel</Button>
            </Space>

            <Descriptions
              bordered
              column={1}
              size="small"
              title="Submitted by"
              style={{ marginTop: 24 }}
            >
              <Descriptions.Item label="Car Key">{selected.carKey || '-'}</Descriptions.Item>
              <Descriptions.Item label="Name">{selected.listedBy?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="Email">{selected.listedBy?.email || '-'}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selected.listedBy?.phone || '-'}</Descriptions.Item>
            </Descriptions>
          </Form>
        )}
      </Drawer>
    </div>
  );
}
