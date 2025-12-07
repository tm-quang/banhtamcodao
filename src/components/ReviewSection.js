// src/components/ReviewSection.js
'use client';
import { useState, useMemo } from 'react';
import { useToast } from '@/context/ToastContext';
import { StaticStarRating, InteractiveStarRating } from './StarRating';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ThumbsUp, Star, Filter, ArrowUpDown, BadgeCheck } from 'lucide-react';

export default function ReviewSection({ productId, reviews }) {
    const { showToast } = useToast();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [customerName, setCustomerName] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [filterRating, setFilterRating] = useState(0); // 0 = all
    const [sortBy, setSortBy] = useState('newest'); // newest, helpful, highest, lowest

    const reviewsPerPage = 6;

    // Filter and sort reviews
    const filteredAndSortedReviews = useMemo(() => {
        let filtered = [...reviews];

        // Filter by rating
        if (filterRating > 0) {
            filtered = filtered.filter(r => r.rating === filterRating);
        }

        // Sort
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'helpful':
                filtered.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
                break;
            case 'highest':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'lowest':
                filtered.sort((a, b) => a.rating - b.rating);
                break;
            default:
                break;
        }

        return filtered;
    }, [reviews, filterRating, sortBy]);

    const totalPages = Math.ceil(filteredAndSortedReviews.length / reviewsPerPage);
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = filteredAndSortedReviews.slice(indexOfFirstReview, indexOfLastReview);

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

            {/* Filter and Sort Controls */}
            {totalReviews > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 mb-6 pb-6 border-b">
                    {/* Filter by Rating */}
                    <div className="flex-1">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Filter size={16} />
                            Lọc theo đánh giá
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => { setFilterRating(0); setCurrentPage(1); }}
                                className={`px-4 py-2 rounded-lg border-2 transition-all ${filterRating === 0
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                Tất cả
                            </button>
                            {[5, 4, 3, 2, 1].map(stars => (
                                <button
                                    key={stars}
                                    onClick={() => { setFilterRating(stars); setCurrentPage(1); }}
                                    className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-1 ${filterRating === stars
                                            ? 'border-primary bg-primary text-white'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {stars} <Star size={14} fill={filterRating === stars ? 'white' : '#fbbf24'} className={filterRating === stars ? 'text-white' : 'text-yellow-400'} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div className="flex-1">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <ArrowUpDown size={16} />
                            Sắp xếp theo
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none"
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="helpful">Hữu ích nhất</option>
                            <option value="highest">Đánh giá cao nhất</option>
                            <option value="lowest">Đánh giá thấp nhất</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Reviews Grid */}
            {filteredAndSortedReviews.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {currentReviews.map((review) => (
                            <div key={review.id} className="border-2 border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-bold">
                                            {review.customer_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-secondary">{review.customer_name}</p>
                                            <p className="text-xs text-gray-400">
                                                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: vi })}
                                            </p>
                                        </div>
                                    </div>
                                    {review.verified_purchase && (
                                        <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                            <BadgeCheck size={14} />
                                            <span>Đã mua</span>
                                        </div>
                                    )}
                                </div>
                                <StaticStarRating rating={review.rating} size={16} />
                                <p className="text-gray-600 mt-2 mb-3">{review.comment}</p>
                                <button onClick={handleLikeClick} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors">
                                    <ThumbsUp size={14} />
                                    Hữu ích ({review.helpful_count || 0})
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8 space-x-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <button key={number} onClick={() => paginate(number)} className={`px-4 py-2 rounded-md text-sm font-medium ${currentPage === number ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                    {number}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    {filterRating > 0 ? `Không có đánh giá ${filterRating} sao` : 'Chưa có đánh giá nào'}
                </div>
            )}

            <hr className="my-8" />

            {/* Review Form */}
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