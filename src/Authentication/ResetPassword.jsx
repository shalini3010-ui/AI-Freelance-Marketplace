import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API/Axios';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const email = localStorage.getItem('reset_email') || '';
    const otp = localStorage.getItem('reset_otp') || localStorage.getItem('otp') || '';

    try {
      await API.post('/auth/reset-password', {
        email,
        new_password: newPassword,
        newPassword: newPassword,
        otp_code: otp,
        otp: otp
      });
      localStorage.removeItem('reset_email');
      localStorage.removeItem('reset_otp');
      localStorage.removeItem('otp');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Reset Password</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;