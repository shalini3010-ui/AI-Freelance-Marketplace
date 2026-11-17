import React from 'react';

const ServiceCards = ({ title, category, price, description, onAction, actionLabel = 'Select' }) => {
  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '18px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <span style={{ fontSize: '12px', color: '#007bff', fontWeight: 'bold', textTransform: 'uppercase' }}>{category}</span>
        <h3 style={{ margin: '8px 0', fontSize: '18px' }}>{title}</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>{description}</p>
      </div>
      <div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745', marginBottom: '12px' }}>
          ${price}/hr
        </div>
        {onAction && (
          <button
            onClick={onAction}
            style={{ width: '100%', padding: '8px 14px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default ServiceCards;