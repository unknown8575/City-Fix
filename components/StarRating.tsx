import React from 'react';
import { StarIcon } from '../constants';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, readOnly = false }) => {
  return (
    <div className={`flex justify-center gap-1 ${!readOnly ? 'cursor-pointer' : ''}`}>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <StarIcon
            key={starValue}
            className={`w-10 h-10 transition-colors duration-200 ${
              starValue <= rating ? 'text-yellow-400' : 'text-gray-300'
            } ${!readOnly ? 'hover:text-yellow-300' : ''}`}
            onClick={() => !readOnly && onRatingChange && onRatingChange(starValue)}
            onMouseOver={!readOnly ? e => {
                const parent = e.currentTarget.parentElement;
                if (parent) {
                    const stars = Array.from(parent.children) as HTMLElement[];
                    stars.forEach((star, i) => {
                        star.style.color = i < starValue ? '#FBBF24' : '#D1D5DB'; // yellow-400 or gray-300
                    });
                }
            } : undefined}
            onMouseLeave={!readOnly ? e => {
                 const parent = e.currentTarget.parentElement;
                 if (parent) {
                    const stars = Array.from(parent.children) as HTMLElement[];
                    stars.forEach((star, i) => {
                       star.style.color = i < rating ? '#FBBF24' : '#D1D5DB';
                    });
                }
            } : undefined}
            aria-label={`${starValue} star`}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
