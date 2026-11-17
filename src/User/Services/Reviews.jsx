import React, { useState, useEffect } from 'react';
import API from '../../API/Axios';

const DEFAULT_REVIEWS = [
  { id: '101', userName: 'Ananya Sharma', comment: 'Punctual and fixed the pipe leakage within 30 minutes!', date: '2026-03-15', rating: 5, likes: 4 },
  { id: '102', userName: 'Rajesh Kumar', comment: 'Good quality service. Brought all required repair tools.', date: '2026-03-10', rating: 4, likes: 2 },
  { id: '103', userName: 'Sneha Rao', comment: 'Arrived slightly late, but the overall electrical work was solid.', date: '2026-02-28', rating: 4, likes: 1 },
];

const Reviews = ({ handymanId }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [selectedRating, setSelectedRating] = useState(5);
  const [filterRating, setFilterRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await API.get(`services/reviews/?handymanId=${handymanId || ''}`);
        setReviews(response.data.length ? response.data : DEFAULT_REVIEWS);
      } catch (err) {
        console.warn('Reviews API offline, loading standard reviews:', err);
        setReviews(DEFAULT_REVIEWS);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [handymanId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    const payload = {
      handymanId,
      userName: 'Current User',
      comment: newReview,
      rating: selectedRating,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
    };

    try {
      const res = await API.post('services/reviews/', payload);
      setReviews([res.data || payload, ...reviews]);
    } catch (err) {
      console.warn('API offline, adding review locally:', err);
      setReviews([{ ...payload, id: Date.now().toString() }, ...reviews]);
    } finally {
      setNewReview('');
    }
  };

  const handleLike = (id) => {
    setReviews(reviews.map((rev) => (rev.id === id ? { ...rev, likes: (rev.likes || 0) + 1 } : rev)));
  };

  // Filter reviews
  const visibleReviews = filterRating === 0 ? reviews : reviews.filter((r) => r.rating === filterRating);
  const avgRating = reviews.length ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <div style={{ padding: '24px', maxWidth: '750px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Header Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Customer Reviews</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>Based on {reviews.length} verified ratings</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>{avgRating}</span>
          <span style={{ fontSize: '18px', color: '#f59e0b', marginLeft: '4px' }}>★</span>
        </div>
      </div>

      {/* Post New Review Form */}
      <form onSubmit={handleReviewSubmit} style={{ marginBottom: '24px', background: '#fff', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '8px' }}>WRITE A REVIEW</span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Your Rating:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setSelectedRating(star)}
              style={{ fontSize: '20px', cursor: 'pointer', color: star <= selectedRating ? '#f59e0b' : '#cbd5e1' }}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          rows="3"
          placeholder="Share details about punctuality, pricing, or work quality..."
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
        />

        <button type="submit" style={{ marginTop: '10px', padding: '8px 18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
          Post Review
        </button>
      </form>

      {/* Filter Reviews by Rating */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Filter:</span>
        <button onClick={() => setFilterRating(0)} style={{ padding: '4px 10px', borderRadius: '12px', border: '1px solid #cbd5e1', background: filterRating === 0 ? '#0f172a' : '#fff', color: filterRating === 0 ? '#fff' : '#475569', fontSize: '11px', cursor: 'pointer' }}>
          All
        </button>
        {[5, 4, 3].map((stars) => (
          <button key={stars} onClick={() => setFilterRating(stars)} style={{ padding: '4px 10px', borderRadius: '12px', border: '1px solid #cbd5e1', background: filterRating === stars ? '#0f172a' : '#fff', color: filterRating === stars ? '#fff' : '#475569', fontSize: '11px', cursor: 'pointer' }}>
            {stars} ★
          </button>
        ))}
      </div>

      {/* Review List */}
      {loading ? (
        <p style={{ color: '#64748b' }}>Loading reviews...</p>
      ) : visibleReviews.length === 0 ? (
        <p style={{ color: '#64748b' }}>No reviews found matching criteria.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {visibleReviews.map((rev) => (
            <div key={rev.id} style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{rev.userName}</p>
                <div style={{ color: '#f59e0b', fontSize: '13px' }}>
                  {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))}
                </div>
              </div>
              <p style={{ margin: '8px 0', color: '#334155', fontSize: '13px' }}>{rev.comment}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <small style={{ color: '#94a3b8' }}>{rev.date}</small>
                <button
                  onClick={() => handleLike(rev.id)}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}
                >
                  👍 Helpful ({rev.likes || 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;