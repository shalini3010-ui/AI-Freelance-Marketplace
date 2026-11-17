import React from 'react';

const GoogleMaps = ({ address = 'New York, NY', height = '300px' }) => {
  const encodedAddress = encodeURIComponent(address);
  const mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div style={{ width: '100%', height, borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
      <iframe
        title="Location Map"
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight="0"
        marginWidth="0"
        src={mapSrc}
      />
    </div>
  );
};

export default GoogleMaps;