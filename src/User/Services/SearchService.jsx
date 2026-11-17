import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../API/Axios';

const DEFAULT_SERVICES = [
  { id: '1', title: 'Emergency Plumbing Repair', category: 'Plumbing', hourlyRate: 45, rating: 4.8, description: 'Quick fix for leaking pipes, clogged drains, and faucet installs.' },
  { id: '2', title: 'Home Electrical Wiring', category: 'Electrical', hourlyRate: 55, rating: 4.9, description: 'Professional electrician for outlet fixes, wiring, and panel repairs.' },
  { id: '3', title: 'Custom Furniture Carpentry', category: 'Carpentry', hourlyRate: 40, rating: 4.6, description: 'Door fitting, cabinet assembly, and custom wooden repairs.' },
  { id: '4', title: 'Deep Home Cleaning', category: 'Cleaning', hourlyRate: 30, rating: 4.5, description: 'Thorough sanitization, kitchen deep clean, and carpet washing.' },
  { id: '5', title: 'AC & Appliance Maintenance', category: 'Appliance Repair', hourlyRate: 50, rating: 4.7, description: 'Refrigerator, washing machine, and HVAC servicing.' },
];

const SearchService = () => {
  const [services, setServices] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(100);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('recommended');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`services/search/?q=${query}&category=${category}`);
      setServices(response.data.length ? response.data : DEFAULT_SERVICES);
    } catch (err) {
      console.warn('Backend API offline. Filtering local services:', err);
      setServices(DEFAULT_SERVICES);
    } finally {
      setLoading(false);
    }
  }, [category, query]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  // Apply Client Filters & Sorting
  const filteredServices = services
    .filter((s) => {
      const matchesQuery = s.title.toLowerCase().includes(query.toLowerCase()) || s.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'All' || s.category === category;
      const matchesPrice = s.hourlyRate <= maxPrice;
      const matchesRating = (s.rating || 5) >= minRating;
      return matchesQuery && matchesCategory && matchesPrice && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.hourlyRate - b.hourlyRate;
      if (sortBy === 'price-desc') return b.hourlyRate - a.hourlyRate;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Search & Filter Services</h2>

      {/* Main Search Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search for plumbing, electrician, cleaning..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
          Search
        </button>
      </form>

      {/* Advanced Filter Bar */}
      <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div>
          <label style={s.filterLabel}>CATEGORY</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={s.selectInput}>
            <option value="All">All Categories</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Carpentry">Carpentry</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Appliance Repair">Appliance Repair</option>
          </select>
        </div>

        <div>
          <label style={s.filterLabel}>MAX HOURLY RATE: ${maxPrice}/hr</label>
          <input
            type="range"
            min="20"
            max="120"
            step="5"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            style={{ width: '100%', marginTop: '6px' }}
          />
        </div>

        <div>
          <label style={s.filterLabel}>MINIMUM RATING</label>
          <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} style={s.selectInput}>
            <option value={0}>All Ratings</option>
            <option value={4.0}>4.0★ and above</option>
            <option value={4.5}>4.5★ and above</option>
            <option value={4.8}>4.8★ and above</option>
          </select>
        </div>

        <div>
          <label style={s.filterLabel}>SORT BY</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={s.selectInput}>
            <option value="recommended">Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>Loading available services...</p>
      ) : filteredServices.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>No services found matching your criteria.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredServices.map((service) => (
            <div key={service.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0f172a' }}>{service.title}</h3>
                  <span style={{ fontSize: '12px', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                    ★ {service.rating || '4.8'}
                  </span>
                </div>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 10px 0' }}>{service.description}</p>
                <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>
                  {service.category}
                </span>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '16px' }}>${service.hourlyRate}/hr</span>
                <button
                  onClick={() => navigate(`/user/book-service/${service.id}`)}
                  style={{ padding: '8px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Book Service
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const s = {
  filterLabel: { display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '4px' },
  selectInput: { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' },
};

export default SearchService;