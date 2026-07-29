import { useEffect, useState } from 'react';
import { Card, Col, Row, Typography, message } from 'antd';
import { getReports } from '../services/adminService';

export default function ReportsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getReports()
      .then((res) => setData(res.data.data))
      .catch((err) => message.error(err.response?.data?.message || 'Failed to load reports'));
  }, []);

  return (
    <div>
      <Typography.Title level={3}>Reports</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="By Status">
            {(data?.byStatus || []).map((item) => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item._id}</span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Monthly Listings">
            {(data?.monthly || []).map((item) => (
              <div key={`${item._id.year}-${item._id.month}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>
                  {item._id.month}/{item._id.year}
                </span>
                <strong>{item.count}</strong>
              </div>
            ))}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Contact">
            <p>All Call / WhatsApp redirects go to:</p>
            <Typography.Text strong>+91 706 022 1729</Typography.Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
