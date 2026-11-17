import React, { useEffect, useState } from 'react';

export default function Profile() {
  const [user, setUser] = useState({ name: '', email: '', phone: '', picture: '' });

  useEffect(() => {
    // Fetch profile details from backend using token
    fetch('http://127.0.0.1:8000/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  return (
    <div className="profile-container">
      <h2>User Information</h2>
      {user.picture && <img src={user.picture} alt="Avatar" width="80" />}
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
    </div>
  );
}