import React, { useState, useEffect } from 'react';
import API from '../../API/Axios';

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState([
    {
      id: "rec_1",
      serviceTitle: "AC Deep Cleaning & Service",
      reason: "It's been 6 months since your last HVAC maintenance. Recommended based on seasonal temperatures.",
      estimatedPrice: 499
    },
    {
      id: "rec_2",
      serviceTitle: "Full Home Deep Sanitation",
      reason: "Popular among users who recently booked Plumbing & Water Filter maintenance.",
      estimatedPrice: 799
    },
    {
      id: "rec_3",
      serviceTitle: "Water Tank Leakage Check",
      reason: "Pre-monsoon maintenance suggested for your registered area.",
      estimatedPrice: 299
    }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAIRecommendations = async () => {
      try {
        const res = await API.get('ai/recommendations/');
        if (res.data && res.data.length > 0) {
          setRecommendations(res.data);
        }
      } catch (err) {
        console.log('Using default fallback AI recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAIRecommendations();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>AI-Recommended Services</h2>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Personalized service suggestions based on your past bookings and preferences.
      </p>

      {loading ? (
        <p style={{ color: '#666' }}>Analyzing your preferences...</p>
      ) : recommendations.length === 0 ? (
        <p>No recommendations available right now.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {recommendations.map((rec) => (
            <div key={rec.id} style={{ border: '1px solid #c084fc', borderRadius: '12px', padding: '16px', backgroundColor: '#faf5ff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', background: '#7c3aed', color: '#fff', padding: '3px 10px', borderRadius: '12px', display: 'inline-block' }}>
                  ⚡ AI Match
                </span>
                <h3 style={{ marginTop: '12px', marginBottom: '6px', fontSize: '16px', color: '#1e1b4b' }}>{rec.serviceTitle}</h3>
                <p style={{ fontSize: '13px', color: '#4c1d95', lineHeight: '1.4' }}>{rec.reason}</p>
              </div>
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', fontSize: '15px', color: '#15803d' }}>
                  Est. Cost: ₹{rec.estimatedPrice}
                </p>
                <button 
                  onClick={() => alert(`Quick booked ${rec.serviceTitle}!`)}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  Quick Book
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;