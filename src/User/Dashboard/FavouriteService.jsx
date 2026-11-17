import React, { useState, useEffect } from 'react';
import API from '../../API/Axios';

const FavouriteServices = () => {
  const [favourites, setFavourites] = useState([
    { id: "1", serviceTitle: "Plumbing Fix", handymanName: "John Doe", rating: 4.9 },
    { id: "3", serviceTitle: "Home Deep Cleaning", handymanName: "Sarah Connor", rating: 4.8 }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const res = await API.get('user/favourites/');
        if (res.data && res.data.length > 0) {
          setFavourites(res.data);
        }
      } catch (err) {
        console.log('Using fallback favorite services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavourites();
  }, []);

  const handleRemove = async (id) => {
    try {
      await API.delete(`user/favourites/${id}/`);
    } catch (err) {
      console.log('Removed locally');
    }
    setFavourites(favourites.filter((item) => item.id !== id));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Favorite Services & Handymen</h2>
      {loading ? (
        <p style={{ color: '#64748b' }}>Loading favorites...</p>
      ) : favourites.length === 0 ? (
        <p style={{ color: '#64748b' }}>No favorite services saved yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginTop: '20px' }}>
          {favourites.map((fav) => (
            <div key={fav.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0f172a' }}>{fav.serviceTitle}</h3>
              <p style={{ margin: '4px 0', color: '#64748b', fontSize: '13px' }}><strong>Handyman:</strong> {fav.handymanName}</p>
              <p style={{ margin: '4px 0', color: '#eab308', fontWeight: 'bold', fontSize: '13px' }}>Rating: {fav.rating} ★</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button 
                  onClick={() => alert(`Re-booked ${fav.serviceTitle}!`)}
                  style={{ flex: 1, padding: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Book Again
                </button>
                <button 
                  onClick={() => handleRemove(fav.id)} 
                  style={{ padding: '8px 12px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavouriteServices;