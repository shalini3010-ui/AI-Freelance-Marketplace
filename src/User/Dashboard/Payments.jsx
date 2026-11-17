import React, { useState, useEffect } from 'react';
import API from '../../API/Axios';

const Payments = () => {
  const [transactions, setTransactions] = useState([
    { id: "tx_101", serviceTitle: "Plumbing Repair", date: "2026-03-20", amount: 249, status: "Paid" },
    { id: "tx_102", serviceTitle: "AC Maintenance", date: "2026-03-15", amount: 499, status: "Paid" },
    { id: "tx_103", serviceTitle: "Electrical Inspection", date: "2026-03-24", amount: 299, status: "Pending" }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await API.get('user/payments/');
        if (res.data && res.data.length > 0) {
          setTransactions(res.data);
        }
      } catch (err) {
        console.log('Using default fallback transactions data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Payment History</h2>
      {loading ? (
        <p style={{ color: '#64748b' }}>Loading transactions...</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginTop: '16px' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {transactions.map((t, idx) => (
              <li 
                key={t.id} 
                style={{ 
                  padding: '16px 20px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderBottom: idx !== transactions.length - 1 ? '1px solid #f1f5f9' : 'none'
                }}
              >
                <div>
                  <strong style={{ fontSize: '15px', color: '#0f172a' }}>{t.serviceTitle}</strong>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '12px' }}>{t.date} • ID: {t.id}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>₹{t.amount}</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', fontWeight: 'bold', color: t.status === 'Paid' ? '#16a34a' : '#d97706' }}>
                    {t.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Payments;