import { useEffect, useState } from 'react';
import { Descriptions, Typography, message } from 'antd';
import api from '../services/api';

export default function SettingsPage() {
  const [contact, setContact] = useState({ phone: '+917060221729', whatsapp: '917060221729' });

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
        <Descriptions.Item label="App Name">Brijwasi Car Bazaar</Descriptions.Item>
        <Descriptions.Item label="Contact Phone">{contact.phone}</Descriptions.Item>
        <Descriptions.Item label="WhatsApp">{contact.whatsapp}</Descriptions.Item>
        <Descriptions.Item label="API">
          {import.meta.env.VITE_API_URL || 'https://dt-car-bazaar-api.onrender.com/api'}
        </Descriptions.Item>
        <Descriptions.Item label="Listing rule">
          Customer submissions stay Pending until admin approval
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}
