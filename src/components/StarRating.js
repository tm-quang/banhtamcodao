// src/components/StarRating.js
'use client';
import { Star } from 'lucide-react';
import { useState } from 'react';

// Component để hiển thị (chỉ xem)
export const StaticStarRating = ({ rating, size = 16 }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <Star
                        key={index}
                        size={size}
                        className={starValue <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                );
            })}
        </div>
    );
};

// Component cho phép tương tác (chọn sao)
export const InteractiveStarRating = ({ rating, setRating, size = 24 }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <button
                        type="button"
                        key={index}
                        className="bg-transparent border-none cursor-pointer"
                        onClick={() => setRating(starValue)}
                        onMouseEnter={() => setHover(starValue)}
                        onMouseLeave={() => setHover(0)}
                    >
                        <Star
                            size={size}
                            className={`transition-colors ${starValue <= (hover || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                    </button>
                );
            })}
        </div>
    );
};