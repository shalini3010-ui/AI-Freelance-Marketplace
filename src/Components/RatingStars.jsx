import React from 'react';

const RatingStars = ({ rating = 0, maxStars = 5 }) => {
  return (
    <div style={{ display: 'inline-flex', gap: '2px', color: '#ffc107', fontSize: '18px' }}>
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span key={index}>
            {rating >= starValue ? '★' : rating >= starValue - 0.5 ? '½' : '☆'}
          </span>
        );
      })}
    </div>
  );
};

export default RatingStars;