import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

export default function Sidebar({ links = [], onLogout }) {
  const [user, setUser] = useState({ name: 'User', email: '', phone: '', area: '' });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', area: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load saved user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setFormData({
          name: parsedUser.name || parsedUser.full_name || '',
          phone: parsedUser.phone || '',
          area: parsedUser.area || '',
        });
      } catch (err) {
        console.error('Failed to parse user data from localStorage:', err);
      }
    }
  }, []);

  // Handle Logout cleanly
  const handleLogout = (e) => {
    if (e) e.stopPropagation();
    try {
      if (typeof onLogout === 'function') {
        onLogout();
      }
    } catch (err) {
      console.error('Error executing onLogout callback:', err);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  // Handle Form Inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Profile Update API Request
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      const response = await axios.put(
        'http://127.0.0.1:8000/api/users/me/',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.status === 'success' || response.data?.user) {
        setMessage('Profile updated successfully!');
        const updatedUser = response.data.user || { ...user, ...formData };
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setTimeout(() => {
          setIsEditOpen(false);
          setMessage('');
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage(error.response?.data?.detail || 'Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <aside
        style={{
          width: '240px',
          backgroundColor: '#2c3e50',
          minHeight: '100vh',
          padding: '20px 15px',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        {/* Navigation Links */}
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {links.map((link, idx) => (
            <li key={idx}>
              <NavLink
                to={link.path}
                style={({ isActive }) => ({
                  display: 'block',
                  padding: '10px 15px',
                  borderRadius: '4px',
                  color: isActive ? '#fff' : '#bdc3c7',
                  backgroundColor: isActive ? '#34495e' : 'transparent',
                  textDecoration: 'none',
                })}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* User Profile Footer */}
        <div 
          style={{ 
            borderTop: '1px solid #34495e', 
            paddingTop: '15px', 
            marginTop: '20px',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <div 
            onClick={() => setIsEditOpen(true)} 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <div 
              style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: '#3498db', 
                color: '#fff', 
                display: 'grid', 
                placeItems: 'center', 
                fontWeight: '700', 
                fontSize: '12px' 
              }}
            >
              {(user?.name || user?.full_name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#fff' }}>
                {user?.name || user?.full_name || 'User'}
              </p>
              <span style={{ fontSize: '10px', color: '#3498db' }}>Edit Profile ⚙️</span>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            type="button"
            onClick={handleLogout} 
            style={{ 
              padding: '6px 10px', 
              border: '1px solid #e74c3c', 
              borderRadius: '4px', 
              backgroundColor: 'rgba(231, 76, 60, 0.2)', 
              color: '#e74c3c',
              cursor: 'pointer', 
              fontSize: '11px',
              fontWeight: '600',
              zIndex: 10
            }}
          >
            Logout 🚪
          </button>
        </div>
      </aside>

      {/* Edit Profile Modal Dialog */}
      {isEditOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              color: '#333',
              borderRadius: '8px',
              padding: '24px',
              width: '320px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#2c3e50' }}>Edit Profile</h3>

            {message && (
              <p
                style={{
                  fontSize: '13px',
                  color: message.includes('success') ? '#2ecc71' : '#e74c3c',
                  marginBottom: '10px',
                }}
              >
                {message}
              </p>
            )}

            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                  Area / Location
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#bdc3c7',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#3498db',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}