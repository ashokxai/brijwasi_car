import { useEffect, useState } from 'react';
import { Descriptions, Typography, message } from 'antd';
import api from '../services/api';

export default function SettingsPage() {
  const [contact, setContact] = useState({ phone: '+918630930402', whatsapp: '918630930402' });

  useEffect(() => {
    api
      .get('/contact')
      .then((res) => setContact(res.data.data))
      .catch(() => message.warning('Using default contact settings'));
  }, []);

  return (
    <div>
      <Typography.Title level={3}>Settings</Typography.Title>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="App Name">DT Car Bazaar</Descriptions.Item>
        <Descriptions.Item label="Contact Phone">{contact.phone}</Descriptions.Item>
        <Descriptions.Item label="WhatsApp">{contact.whatsapp}</Descriptions.Item>
        <Descriptions.Item label="API">
          {import.meta.env.VITE_API_URL || 'http://localhost:5050/api'}
        </Descriptions.Item>
        <Descriptions.Item label="Listing rule">
          Customer submissions stay Pending until admin approval
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}
