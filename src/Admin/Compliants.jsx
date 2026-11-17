import React, { useState, useEffect } from 'react';
import API from '../API/Axios';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await API.get('admin/complaints/');
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resolveComplaint = async (id) => {
    try {
      await API.patch(`admin/complaints/${id}/`, { status: 'Resolved' });
      fetchComplaints();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Customer Complaints & Disputes</h2>
      {complaints.length === 0 ? (
        <p>No open complaints found.</p>
      ) : (
        complaints.map((c) => (
          <div key={c.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
            <h4>Complaint #{c.id} - Status: <span style={{ color: c.status === 'Resolved' ? 'green' : 'orange' }}>{c.status}</span></h4>
            <p><strong>Complainant:</strong> {c.userName}</p>
            <p><strong>Reported Handyman:</strong> {c.handymanName}</p>
            <p style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>{c.description}</p>
            {c.status !== 'Resolved' && (
              <button onClick={() => resolveComplaint(c.id)} style={{ padding: '6px 12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Mark Resolved
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Complaints;