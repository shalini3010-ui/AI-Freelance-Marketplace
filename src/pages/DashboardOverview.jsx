import React, { useEffect, useState } from 'react';

export default function DashboardOverview() {
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserName(parsedUser.name || 'User');
    }
  }, []);

  return (
    <div className="dashboard-header">
      <h1>Customer Booking Hub</h1>
      <p className="welcome-text">Welcome, <span>{userName}</span> 📍</p>
    </div>
  );
}