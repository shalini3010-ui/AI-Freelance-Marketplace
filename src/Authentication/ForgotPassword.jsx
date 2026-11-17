import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../API/Axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/auth/send-otp', { email });
      localStorage.setItem('reset_email', email);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>
        {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '13px' }}>{error}</p>}
        {!submitted ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
              Enter your registered email address and we'll send you a verification code.
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email"
                style={styles.input}
                required
              />
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#28a745', fontWeight: 'bold', marginBottom: '15px' }}>
              Verification code sent! Please check your email inbox or console.
            </p>
            <button
              onClick={() => navigate('/verify-otp')}
              style={{ ...styles.button, width: '100%', marginBottom: '10px' }}
            >
              Enter Verification Code
            </button>
          </div>
        )}

        <p style={styles.footerText}>
          Remember your password?{' '}
          <Link to="/login" style={styles.linkBold}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '75vh',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    marginBottom: '15px',
    color: '#1a252f',
    fontSize: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#555',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  button: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#666',
  },
  linkBold: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};

export default ForgotPassword;