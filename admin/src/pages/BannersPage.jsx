import { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Typography,
  Upload,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../services/api';
import { getBanners, deleteBanner } from '../services/adminService';
import { required, titleRule, urlOptionalRule } from '../utils/validators';

const API_HOST = (import.meta.env.VITE_API_URL || 'https://dt-car-bazaar-api.onrender.com/api').replace(/\/api$/, '');

function imageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_HOST}${path}`;
}

export default function BannersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getBanners();
      setRows(data.data);
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, order: 0 });
    setFileList([]);
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    form.setFieldsValue(row);
    setFileList(
      row.imageUrl
        ? [
            {
              uid: '-1',
              name: 'banner',
              status: 'done',
              url: imageUrl(row.imageUrl),
            },
          ]
        : []
    );
    setOpen(true);
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('title', (values.title || '').trim());
      formData.append('link', values.link || '');
      formData.append('order', values.order ?? 0);
      formData.append('isActive', values.isActive !== false);

      const newFile = fileList.find((f) => f.originFileObj);
      if (newFile?.originFileObj) {
        const file = newFile.originFileObj;
        const okType = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type);
        if (!okType) {
          message.error('Only JPG, PNG or WebP images are allowed');
          return;
        }
        if (file.size / 1024 / 1024 >= 5) {
          message.error('Image must be under 5MB');
          return;
        }
        formData.append('image', file);
      } else if (editing?.imageUrl && !newFile) {
        formData.append('imageUrl', editing.imageUrl);
      } else if (values.imageUrl) {
        formData.append('imageUrl', values.imageUrl.trim());
      }

      if (editing) {
        await api.put(`/admin/banners/${editing._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Banner updated');
      } else {
        if (!newFile?.originFileObj && !values.imageUrl) {
          message.error('Upload a banner image or provide an image URL');
          return;
        }
        await api.post('/admin/banners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Banner created');
      }
      setOpen(false);
      load();
    } catch (err) {
      if (err?.errorFields) {
        message.error('Please fix the highlighted fields');
        return;
      }
      message.error(err.response?.data?.message || 'Save failed');
    }
  };

  const onDelete = async (id) => {
    try {
      await deleteBanner(id);
      message.success('Deleted');
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      render: (url) =>
        url ? (
          <img src={imageUrl(url)} alt="" style={{ width: 96, height: 54, objectFit: 'cover', borderRadius: 6 }} />
        ) : (
          '-'
        ),
    },
    { title: 'Title', dataIndex: 'title' },
    { title: 'Order', dataIndex: 'order' },
    {
      title: 'Active',
      dataIndex: 'isActive',
      render: (v) => (v === false ? 'No' : 'Yes'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Popconfirm title="Delete?" onConfirm={() => onDelete(row._id)}>
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Banners
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{ background: '#C9A227', borderColor: '#C9A227' }}
        >
          Add
        </Button>
      </Space>
      <Table rowKey="_id" loading={loading} columns={columns} dataSource={rows} />
      <Modal
        title={editing ? 'Edit Banner' : 'Add Banner'}
        open={open}
        onOk={onSubmit}
        onCancel={() => setOpen(false)}
        okButtonProps={{ style: { background: '#C9A227', borderColor: '#C9A227' } }}
      >
        <Form form={form} layout="vertical" validateTrigger={['onBlur', 'onChange']}>
          <Form.Item name="title" label="Title" rules={[titleRule()]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item label="Banner Image" required={!editing}>
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={() => false}
              maxCount={1}
              accept="image/jpeg,image/png,image/webp"
              onChange={({ fileList: next }) => setFileList(next.slice(0, 1))}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item name="imageUrl" label="Or Image URL (optional)" rules={[urlOptionalRule()]}>
            <Input placeholder="/uploads/banner.jpg" />
          </Form.Item>
          <Form.Item name="link" label="Link" rules={[urlOptionalRule()]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="order"
            label="Order"
            rules={[
              {
                validator(_, value) {
                  if (value === undefined || value === null || value === '') return Promise.resolve();
                  if (!Number.isInteger(Number(value)) || Number(value) < 0) {
                    return Promise.reject(new Error('Order must be 0 or higher'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0} precision={0} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
