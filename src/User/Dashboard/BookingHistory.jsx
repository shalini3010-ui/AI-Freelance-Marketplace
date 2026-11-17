import React, { useState, useEffect } from 'react';
import API from '../../API/Axios';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([
    { id: "8821", serviceName: "Plumbing Repair", handymanName: "John Doe", date: "2026-03-20", status: "Completed" },
    { id: "8845", serviceName: "AC Deep Cleaning", handymanName: "Sarah Connor", date: "2026-03-15", status: "Completed" },
    { id: "8901", serviceName: "Electrical Wiring Check", handymanName: "Alex Smith", date: "2026-03-24", status: "In Progress" }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await API.get('user/bookings/');
        if (response.data && response.data.length > 0) {
          setBookings(response.data);
        }
      } catch (err) {
        console.log('Using fallback booking history data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#0f172a' }}>Booking History</h2>
      {loading ? (
        <p style={{ color: '#64748b' }}>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p style={{ color: '#64748b' }}>No past or active bookings found.</p>
      ) : (
        <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', marginTop: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px' }}>Booking ID</th>
                <th style={{ padding: '12px' }}>Service</th>
                <th style={{ padding: '12px' }}>Handyman</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#2563eb' }}>#{b.id}</td>
                  <td style={{ padding: '12px' }}>{b.serviceName}</td>
                  <td style={{ padding: '12px' }}>{b.handymanName}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>{b.date}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: b.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                      color: b.status === 'Completed' ? '#166534' : '#92400e'
                    }}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;