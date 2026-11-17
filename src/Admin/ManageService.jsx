import React, { useState, useEffect } from 'react';
import API from '../API/Axios';

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await API.get('admin/services/');
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await API.post('admin/services/', { title: newTitle, category: newCategory });
      setNewTitle('');
      setNewCategory('');
      fetchServices();
    } catch (err) {
      alert('Failed to add service.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`admin/services/${id}/`);
      fetchServices();
    } catch (err) {
      alert('Failed to delete service.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Manage Service Catalog</h2>

      <form onSubmit={handleAddService} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Service Name"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
          style={{ flex: 1, padding: '8px' }}
        />
        <input
          type="text"
          placeholder="Category Name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          required
          style={{ flex: 1, padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
          Add Service
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {services.map((s) => (
          <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ddd' }}>
            <span><strong>{s.title}</strong> ({s.category})</span>
            <button onClick={() => handleDelete(s.id)} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageServices;