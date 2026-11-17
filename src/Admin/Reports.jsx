import React, { useState, useEffect } from 'react';
import API from '../API/Axios';

const Reports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get('admin/reports/');
        setReports(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReports();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>System Reports</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {reports.map((r) => (
          <li key={r.id} style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
            <strong>{r.title}</strong>
            <p style={{ margin: '4px 0', color: '#555' }}>{r.summary}</p>
            <small style={{ color: '#888' }}>Generated on: {r.date}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reports;