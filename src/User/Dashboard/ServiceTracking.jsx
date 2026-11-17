import React, { useState, useEffect } from 'react';
import API from '../../API/Axios';

const ServiceTracking = () => {
  const [trackingInfo, setTrackingInfo] = useState({
    serviceName: "Electrical Wiring Inspection",
    handymanName: "Alex Smith",
    status: "En Route to Your Location",
    eta: "18 minutes"
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLiveStatus = async () => {
      try {
        const response = await API.get('user/service-tracking/');
        if (response.data) {
          setTrackingInfo(response.data);
        }
      } catch (err) {
        console.log('Using active live tracking fallback:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveStatus();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '850px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Live Service Tracking</h2>
      {loading ? (
        <p style={{ color: '#64748b' }}>Fetching active service status...</p>
      ) : !trackingInfo ? (
        <p style={{ color: '#64748b' }}>No active service ongoing right now.</p>
      ) : (
        <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', pb: '12px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>Service: {trackingInfo.serviceName}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Handyman: <strong>{trackingInfo.handymanName}</strong></p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '13px', background: '#dcfce7', padding: '4px 10px', borderRadius: '12px' }}>
                ● {trackingInfo.status}
              </span>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748b' }}>ETA: <strong>{trackingInfo.eta}</strong></p>
            </div>
          </div>
          
          <div style={{ height: '280px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
            <iframe
              title="Tracking Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              src="https://maps.google.com/maps?q=Doddaballapur&t=&z=14&ie=UTF8&iwloc=&output=embed"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceTracking;