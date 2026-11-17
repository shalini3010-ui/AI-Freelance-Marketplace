import React from 'react';

const SearchBar = ({ value, onChange, onSearch, placeholder = 'Search...' }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '500px' }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ flex: 1, padding: '10px 14px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
      />
      <button type="submit" style={{ padding: '10px 18px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Search
      </button>
    </form>
  );
};

export default SearchBar;