import React from 'react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#1a252f', color: '#bdc3c7', textAlign: 'center', padding: '20px', marginTop: 'auto' }}>
      <p style={{ margin: 0, fontSize: '14px' }}>&copy; {new Date().getFullYear()} HandyFix Platform. All rights reserved.</p>
    </footer>
  );
};

export default Footer;