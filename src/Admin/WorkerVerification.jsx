import React, { useState, useEffect } from 'react';
import API from '../API/Axios';

const WorkerVerification = () => {
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    fetchPendingWorkers();
  }, []);

  const fetchPendingWorkers = async () => {
    try {
      const res = await API.get('admin/worker-verification/');
      setWorkers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecision = async (id, decision) => {
    try {
      await API.post(`admin/worker-verification/${id}/`, { decision });
      fetchPendingWorkers();
    } catch (err) {
      alert('Failed to process verification decision.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Handyman Verification Requests</h2>
      {workers.length === 0 ? (
        <p>No pending verification requests.</p>
      ) : (
        workers.map((w) => (
          <div key={w.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
            <h3>{w.fullName} ({w.skillCategory})</h3>
            <p><strong>Submitted Document:</strong> <a href={w.documentUrl} target="_blank" rel="noopener noreferrer">View Proof Document</a></p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleDecision(w.id, 'Approve')} style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Approve Worker
              </button>
              <button onClick={() => handleDecision(w.id, 'Reject')} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Reject Application
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default WorkerVerification;