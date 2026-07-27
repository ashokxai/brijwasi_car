import { useEffect, useState } from 'react';
import { Switch, Table, Typography, message } from 'antd';
import { getUsers } from '../services/adminService';
import api from '../services/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getUsers();
      setUsers(data.data);
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (id, isActive) => {
    try {
      await api.put(`/admin/users/${id}`, { isActive });
      message.success('User updated');
      load();
    } catch (err) {
      message.error(err.response?.data?.message || 'Update failed');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone' },
    {
      title: 'Active',
      dataIndex: 'isActive',
      render: (val, row) => (
        <Switch checked={val !== false} onChange={(checked) => toggleActive(row.id, checked)} />
      ),
    },
  ];

  return (
    <div>
      <Typography.Title level={3}>Manage Users</Typography.Title>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={users} />
    </div>
  );
}
