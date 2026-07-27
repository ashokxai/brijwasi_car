import { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Typography,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { nameRule, required } from '../utils/validators';

export default function CrudResourcePage({
  title,
  listFn,
  createFn,
  updateFn,
  deleteFn,
  fields = [{ name: 'name', label: 'Name', required: true }],
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await listFn();
      setRows(data.data);
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to load');
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
    form.setFieldsValue({ isActive: true });
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    form.setFieldsValue(row);
    setOpen(true);
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values };
      if (typeof payload.name === 'string') payload.name = payload.name.trim();
      if (editing) {
        await updateFn(editing._id, payload);
        message.success('Updated');
      } else {
        await createFn(payload);
        message.success('Created');
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
      await deleteFn(id);
      message.success('Deleted');
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    ...fields.map((f) => ({
      title: f.label,
      dataIndex: f.name,
      render: f.render,
    })),
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
          {title}
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ background: '#C9A227', borderColor: '#C9A227' }}>
          Add
        </Button>
      </Space>
      <Table rowKey="_id" loading={loading} columns={columns} dataSource={rows} />
      <Modal
        title={editing ? `Edit ${title}` : `Add ${title}`}
        open={open}
        onOk={onSubmit}
        onCancel={() => setOpen(false)}
        okButtonProps={{ style: { background: '#C9A227', borderColor: '#C9A227' } }}
      >
        <Form form={form} layout="vertical" validateTrigger={['onBlur', 'onChange']}>
          {fields.map((f) => (
            <Form.Item
              key={f.name}
              name={f.name}
              label={f.label}
              rules={
                f.rules ||
                (f.required
                  ? f.name === 'name'
                    ? [nameRule(f.label)]
                    : [required(`${f.label} is required`)]
                  : [])
              }
            >
              {f.input || <Input maxLength={50} />}
            </Form.Item>
          ))}
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
