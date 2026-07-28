import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Typography,
  Upload,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  getBrands,
  getModels,
  getCities,
  getFuelTypes,
} from '../services/adminService';
import {
  titleRule,
  required,
  yearRule,
  positiveNumberRule,
  nonNegativeIntRule,
} from '../utils/validators';

export default function AddCarPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [cities, setCities] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [fileList, setFileList] = useState([]);
  const brandId = Form.useWatch('brand', form);

  useEffect(() => {
    Promise.all([getBrands(), getModels(), getCities(), getFuelTypes()])
      .then(([b, m, c, f]) => {
        setBrands(b.data.data);
        setModels(m.data.data);
        setCities(c.data.data);
        setFuelTypes(f.data.data);
      })
      .catch(() => message.error('Failed to load form data'));
  }, []);

  const filteredModels = useMemo(() => {
    if (!brandId) return models;
    return models.filter((m) => (m.brand?._id || m.brand) === brandId);
  }, [models, brandId]);

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

  const onFinish = async (values) => {
    if (fileList.length < 1) {
      message.error('Upload at least 1 photo');
      return;
    }
    if (fileList.length > 10) {
      message.error('Maximum 10 photos allowed');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });
      formData.append('status', 'approved');
      formData.append('isCertified', values.isCertified ? 'true' : 'false');
      fileList.forEach((file) => {
        if (file.originFileObj) formData.append('images', file.originFileObj);
      });

      await api.post('/admin/cars', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('Car listed successfully');
      navigate('/cars');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create car');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography.Title level={3}>Add Car</Typography.Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={() => message.error('Please fix the highlighted fields')}
        initialValues={{ transmission: 'Manual', ownership: 'First Owner', isCertified: true }}
        style={{ maxWidth: 720 }}
        validateTrigger={['onBlur', 'onChange']}
      >
        <Form.Item name="title" label="Title" rules={[titleRule()]}>
          <Input placeholder="Swift VDI" maxLength={100} />
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
            <Input placeholder="May 2025" maxLength={40} />
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
        <Form.Item label="Photos (1–10)" required>
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
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          style={{ background: '#C9A227', borderColor: '#C9A227' }}
        >
          Publish Car
        </Button>
      </Form>
    </div>
  );
}
