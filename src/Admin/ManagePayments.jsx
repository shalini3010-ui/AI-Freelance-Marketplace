import React, { useState, useEffect } from 'react';
import API from '../API/Axios';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await API.get('admin/payments/');
        setPayments(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPayments();
  }, []);

  const handleRefund = async (id) => {
    try {
      await API.post(`admin/payments/${id}/refund/`);
      alert('Refund processed successfully.');
    } catch (err) {
      alert('Failed to process refund.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Payment Transactions</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Txn ID</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Payer</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Amount</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>TXN-{p.id}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{p.payerName}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>${p.amount}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{p.status}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {p.status === 'Completed' && (
                  <button onClick={() => handleRefund(p.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Refund
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagePayments;