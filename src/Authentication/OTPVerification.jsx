import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API/Axios';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const email = localStorage.getItem('pending_verification_email') || localStorage.getItem('reset_email');

    try {
      await API.post('/auth/verify-otp', { email, otp, otp_code: otp });
      if (localStorage.getItem('reset_email')) {
        localStorage.setItem('reset_otp', otp);
        navigate('/reset-password');
      } else {
        localStorage.removeItem('pending_verification_email');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Invalid or expired OTP');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Enter OTP</h2>
      <p>Please check your email for the verification code.</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>OTP Code:</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength="6"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', letterSpacing: '4px', textAlign: 'center' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default OTPVerification;