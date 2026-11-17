import React, { useState, useEffect } from 'react';
import API from '../API/Axios';

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get('admin/analytics/');
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Platform Analytics</h2>
      {!data ? (
        <p>Loading analytics data...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '6px' }}>
            <h4>Monthly Bookings</h4>
            <p style={{ fontSize: '22px', fontWeight: 'bold' }}>{data.monthlyBookings}</p>
          </div>
          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '6px' }}>
            <h4>Active Conversions</h4>
            <p style={{ fontSize: '22px', fontWeight: 'bold' }}>{data.conversionRate}%</p>
          </div>
          <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '6px' }}>
            <h4>User Retention Rate</h4>
            <p style={{ fontSize: '22px', fontWeight: 'bold' }}>{data.retentionRate}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;