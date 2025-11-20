// src/components/ReviewSection.js
'use client';
import { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { StaticStarRating, InteractiveStarRating } from './StarRating';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ThumbsUp, Star } from 'lucide-react'; // <-- Thêm 'Star' vào đây

export default function ReviewSection({ productId, reviews }) {
    const { showToast } = useToast();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [customerName, setCustomerName] = useState('');
    
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 6;
    const totalPages = Math.ceil(reviews.length / reviewsPerPage);
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleLikeClick = () => {
        showToast('Bạn cần đăng nhập để thực hiện chức năng này!', 'info');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!customerName) {
            showToast('Vui lòng nhập tên của bạn để đánh giá!', 'error');
            return;
        }

        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, rating, comment, customerName }),
        });
        const data = await res.json();
        if (data.success) {
            showToast(data.message, 'success');
            setComment('');
            setCustomerName('');
            setRating(5);
        } else {
            showToast(data.message, 'error');
        }
    };

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
    const ratingCounts = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
            ratingCounts[5 - r.rating]++;
        }
    });

    return (
        <div>
            <div className="border-b pb-4 mb-6">
                <h2 className="text-2xl font-medium text-secondary">Đánh giá của khách hàng</h2>
                <div className="w-24 h-0.5 bg-primary mt-2"></div>
            </div>
            
            {totalReviews > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center mb-10">
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-6xl font-bold text-primary">{averageRating.toFixed(1)}</p>
                        <StaticStarRating rating={averageRating} size={24} />
                        <p className="text-gray-500 mt-2">({totalReviews} đánh giá)</p>
                    </div>
                    <div className="lg:col-span-2">
                        {ratingCounts.map((count, index) => (
                            <div key={index} className="flex items-center gap-3 text-sm my-1">
                                <span className="flex items-center text-gray-600">{5 - index} <Star size={14} className="ml-1 text-yellow-400" /></span>
                                <div className="flex-grow h-2 bg-gray-200 rounded-full">
                                    <div className="h-2 bg-yellow-400 rounded-full" style={{ width: `${totalReviews > 0 ? (count / totalReviews) * 100 : 0}%` }}></div>
                                </div>
                                <span className="w-8 text-right text-gray-500">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {currentReviews.map((review) => (
                     <div key={review.id} className="border-b pb-4">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-secondary">{review.customer_name}</p>
                            <p className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: vi })}
                            </p>
                        </div>
                         <StaticStarRating rating={review.rating} size={16} />
                         <p className="text-gray-600 mt-2 mb-3">{review.comment}</p>
                         <button onClick={handleLikeClick} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors">
                             <ThumbsUp size={14} />
                             Hữu ích (0)
                         </button>
                     </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button key={number} onClick={() => paginate(number)} className={`px-4 py-2 rounded-md text-sm font-medium ${currentPage === number ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                            {number}
                        </button>
                    ))}
                </div>
            )}
            
            <hr className="my-8" />

            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-secondary mb-4">Viết đánh giá của bạn</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Đánh giá của bạn:</p>
                        <InteractiveStarRating rating={rating} setRating={setRating} />
                    </div>
                    <input type="text" placeholder="Tên của bạn *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required className="w-full border border-gray-300 rounded-md p-3 focus:ring-primary focus:border-primary" />
                    <textarea placeholder="Chia sẻ cảm nhận của bạn *" value={comment} onChange={(e) => setComment(e.target.value)} rows="4" required className="w-full border border-gray-300 rounded-md p-3 focus:ring-primary focus:border-primary"></textarea>
                    <button type="submit" className="bg-primary text-white font-bold py-3 px-6 rounded-md hover:bg-orange-600 transition-colors">Gửi đánh giá</button>
                </form>
            </div>
        </div>
    );
}