import React from 'react';

const NotificationCard = ({ title, message, timestamp, isRead, onMarkRead }) => {
  return (
    <div style={{ padding: '14px', borderRadius: '6px', border: '1px solid #e0e0e0', backgroundColor: isRead ? '#fcfcfc' : '#f0f7ff', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        {title && <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{title}</h4>}
        <p style={{ margin: 0, color: '#333', fontSize: '14px' }}>{message}</p>
        <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>{timestamp}</small>
      </div>
      {!isRead && onMarkRead && (
        <button onClick={onMarkRead} style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
          Mark Read
        </button>
      )}
    </div>
  );
};

export default NotificationCard;