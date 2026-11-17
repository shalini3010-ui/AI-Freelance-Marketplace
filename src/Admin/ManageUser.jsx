import React, { useState, useEffect } from 'react';
import API from '../API/Axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('admin/users/');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await API.patch(`admin/users/${userId}/`, { isActive: !currentStatus });
      fetchUsers();
    } catch (err) {
      alert('Failed to update user status.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Manage Users</h2>
      {loading ? (
        <p>Loading user directory...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Role</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>#{u.id}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.fullName}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.email}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.role}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', color: u.isActive ? 'green' : 'red' }}>
                  {u.isActive ? 'Active' : 'Disabled'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => toggleUserStatus(u.id, u.isActive)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: u.isActive ? '#dc3545' : '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {u.isActive ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageUsers;