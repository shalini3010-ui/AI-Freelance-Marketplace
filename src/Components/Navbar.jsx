import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../logo';

const Navbar = ({ userRole: propRole, onLogout }) => {
  const navigate = useNavigate();

  // Local state fallbacks
  const [userRole, setUserRole] = useState(propRole || localStorage.getItem('userRole'));
  const [user, setUser] = useState({ name: 'User', email: '', phone: '', area: '' });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', area: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Sync state on load & monitor local storage changes
  useEffect(() => {
    const roleFromStorage = localStorage.getItem('userRole') || propRole;
    setUserRole(roleFromStorage);

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
  }, [propRole]);

  // Normalize role
  const role = userRole ? userRole.toLowerCase() : null;

  // 1. Guaranteed Logout Trigger
  const handleLogout = () => {
    if (onLogout) onLogout();
    localStorage.clear();
    sessionStorage.clear();
    setUserRole(null);
    setUser({ name: 'User', email: '', phone: '', area: '' });
    navigate('/login');
    window.location.reload();
  };

  // 2. Handle Edit Profile Modal Submit
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

      if (response.data.status === 'success' || response.data.user) {
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
      <nav
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          padding: '14px 32px',
          backgroundColor: '#1c1722',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#fff',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {/* BRAND LOGO */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo size={32} showText={true} />
        </Link>

        {/* NAVIGATION LINKS */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/" style={linkStyle}>
            Home
          </Link>

          {role === 'user' && (
            <>
              <Link to="/user/dashboard" style={linkStyle}>
                Dashboard
              </Link>
              <Link to="/user/services" style={linkStyle}>
                Services
              </Link>
              <Link to="/user/bookings" style={linkStyle}>
                My Bookings
              </Link>
            </>
          )}

          {role === 'handyman' && (
            <>
              <Link to="/handyman/dashboard" style={linkStyle}>
                Dashboard
              </Link>
              <Link to="/handyman/bookings" style={linkStyle}>
                Work Orders
              </Link>
            </>
          )}

          {role === 'admin' && (
            <Link to="/admin/dashboard" style={linkStyle}>
              Admin Panel
            </Link>
          )}

          {/* Dynamic Auth Header */}
          {userRole ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: '#8b5cf6',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}
                >
                  {(user.name || user.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                    {user.name || user.full_name || 'User'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#a78bfa',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    Edit Profile ⚙️
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: '8px 18px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              style={{
                padding: '8px 18px',
                background: 'linear-gradient(135deg, #8b5cf6, #4f7df7)',
                color: '#fff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '13px',
              }}
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* EDIT PROFILE MODAL DIALOG */}
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
              backgroundColor: '#1c1722',
              color: '#fff',
              borderRadius: '12px',
              padding: '24px',
              width: '320px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#fff', fontSize: '18px' }}>
              Edit Profile
            </h3>

            {message && (
              <p
                style={{
                  fontSize: '13px',
                  color: message.includes('success') ? '#4ade80' : '#f87171',
                  marginBottom: '12px',
                }}
              >
                {message}
              </p>
            )}

            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#c9bdf0', display: 'block', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: '#282230',
                    color: '#fff',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#c9bdf0', display: 'block', marginBottom: '4px' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: '#282230',
                    color: '#fff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#c9bdf0', display: 'block', marginBottom: '4px' }}>
                  Area / Location
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: '#282230',
                    color: '#fff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: 'transparent',
                    color: '#c9bdf0',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '8px 14px',
                    background: 'linear-gradient(135deg, #8b5cf6, #4f7df7)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
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
};

const linkStyle = {
  color: '#c9bdf0',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
};

export default Navbar;