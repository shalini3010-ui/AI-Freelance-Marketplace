import React, { useState, useEffect } from 'react';
import API from '../API/Axios';

const RevenueReports = () => {
  const [revenue, setRevenue] = useState({ gross: 0, platformCommission: 0, netWorkerPayout: 0 });

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await API.get('admin/revenue-reports/');
        setRevenue(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRevenue();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Revenue & Commission Reports</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <div style={{ padding: '15px', backgroundColor: '#eef9f1', borderLeft: '5px solid #28a745' }}>
          <h4>Gross Transaction Value</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>${revenue.gross}</p>
        </div>
        <div style={{ padding: '15px', backgroundColor: '#eaf4ff', borderLeft: '5px solid #007bff' }}>
          <h4>Platform Commission Income</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>${revenue.platformCommission}</p>
        </div>
        <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderLeft: '5px solid #ffc107' }}>
          <h4>Worker Earnings Disbursed</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>${revenue.netWorkerPayout}</p>
        </div>
      </div>
    </div>
  );
};

export default RevenueReports;