/**
 * Admin Reviews Management Page - TailwindCSS Version
 * @file src/app/(admin)/admin/reviews/page.js
 */
'use client';


import React, { useState, useEffect, useMemo } from 'react';
import {
    Star, MessageSquare, ThumbsUp, ThumbsDown, Search, Filter,
    User, Package, Calendar, Eye, Trash2, CheckCircle, XCircle,
    RefreshCw, AlertCircle, Clock, ExternalLink, Info
} from 'lucide-react';
import { Button } from '@/components/tailwindcss/ui/Button';
import { Input } from '@/components/tailwindcss/ui/Input';
import { Chip } from '@/components/tailwindcss/ui/Chip';
import { Dialog } from '@/components/tailwindcss/ui/Dialog';
import { Tooltip } from '@/components/tailwindcss/ui/Tooltip';
import { Toast } from '@/components/tailwindcss/ui/Toast';
import { SkeletonStatsCard } from '@/components/tailwindcss/ui/Skeleton';
import DataTable from '@/components/tailwindcss/ui/DataTable';
import { format } from 'date-fns';

// Star Rating Component
const StarRating = ({ rating, size = 16 }) => {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
            ))}
        </div>
    );
};

// Confirmation Dialog Component
const ConfirmationDialog = ({ open, onClose, onConfirm, title, description, type = 'warning' }) => {
    const footer = (
        <div className="flex items-center justify-end gap-3">
            <Button
                variant="outline"
                onClick={onClose}
                className="!bg-gray-300 !hover:bg-gray-500 text-gray-700"
            >
                Hủy
            </Button>
            <Button
                variant={type === 'danger' ? 'danger' : 'primary'}
                onClick={onConfirm}
                className="!hover:bg-opacity-90"
            >
                Xác nhận
            </Button>
        </div>
    );

    const icons = {
        warning: AlertCircle,
        danger: XCircle,
        info: Info
    };

    const Icon = icons[type] || AlertCircle;
    const iconColors = {
        warning: 'text-amber-600',
        danger: 'text-red-600',
        info: 'text-blue-600'
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            size="sm"
            title={
                <div className={`flex items-center gap-2 ${iconColors[type]}`}>
                    <Icon size={22} />
                    <span className="font-bold">{title}</span>
                </div>
            }
            footer={footer}
        >
            <p className="text-gray-700">{description}</p>
        </Dialog>
    );
};

// Review Detail Modal
const ReviewDetailModal = ({ open, onClose, review, onApprove, onReject }) => {
    if (!review) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const footer = (
        <div className="flex items-center justify-end gap-3">
            <Button
                variant="outline"
                onClick={onClose}
                className="!bg-gray-300 !hover:bg-gray-500 text-gray-700"
            >
                Đóng
            </Button>
            {review.status === 'pending' && (
                <>
                    <Button
                        variant="danger"
                        startIcon={<XCircle size={16} />}
                        onClick={() => {
                            onClose();
                            onReject(review.id);
                        }}
                        className="!hover:bg-red-700"
                    >
                        Từ chối
                    </Button>
                    <Button
                        variant="primary"
                        startIcon={<CheckCircle size={16} />}
                        onClick={() => {
                            onClose();
                            onApprove(review.id);
                        }}
                        className="!hover:bg-blue-700"
                    >
                        Duyệt
                    </Button>
                </>
            )}
        </div>
    );

    const SectionHeader = ({ icon: Icon, title, color = '#3b82f6' }) => (
        <div className="flex items-center gap-2 mb-3">
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}15` }}
            >
                <Icon size={16} style={{ color }} />
            </div>
            <span className="text-sm font-bold text-gray-800 uppercase tracking-tight">{title}</span>
        </div>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            size="lg"
            title={
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <MessageSquare size={22} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-black text-gray-900 block">Chi tiết đánh giá</span>
                        <p className="text-xs text-gray-500 font-medium">Duyệt hoặc phản hồi ý kiến khách hàng</p>
                    </div>
                </div>
            }
            footer={footer}
        >
            <div className="space-y-8">
                {/* Two columns for Customer & Product */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Info */}
                    <div className="space-y-4">
                        <SectionHeader icon={User} title="Người đánh giá" color="#3b82f6" />
                        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md flex-shrink-0">
                                {review.customer_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-base font-black text-gray-900 truncate">{review.customer_name}</p>
                                {review.customer_email && (
                                    <p className="text-xs text-blue-600 font-bold mt-0.5 truncate">{review.customer_email}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-4">
                        <SectionHeader icon={Package} title="Sản phẩm" color="#10b981" />
                        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shadow-inner flex-shrink-0">
                                    <Package size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-base font-bold text-gray-900 leading-tight truncate">{review.product_name}</p>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">Sản phẩm hệ thống</p>
                                </div>
                            </div>
                            {review.product_slug && (
                                <a
                                    href={`/product/${review.product_slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-gray-50 text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-sm active:scale-90 flex-shrink-0 border border-gray-100"
                                >
                                    <ExternalLink size={18} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rating & Content */}
                <div className="space-y-4">
                    <SectionHeader icon={Star} title="Đánh giá & Nội dung" color="#f59e0b" />
                    <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-50">
                            <div className="flex items-center gap-4">
                                <div className="bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                                    <StarRating rating={review.rating} size={24} />
                                </div>
                                <span className="text-2xl font-black text-gray-900 leading-none">{review.rating}<span className="text-sm text-gray-400 font-medium ml-1">/ 5</span></span>
                            </div>
                            <div>
                                <span className={`inline-block px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider text-white shadow-sm ${review.status === 'approved' ? 'bg-green-600' :
                                    review.status === 'rejected' ? 'bg-red-600' :
                                        'bg-amber-500'
                                    }`}>
                                    {review.status === 'approved' ? 'Đã duyệt' :
                                        review.status === 'rejected' ? 'Từ chối' :
                                            'Chờ duyệt'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Nội dung nhận xét</p>
                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                                <p className="text-gray-900 leading-relaxed text-base font-medium italic">
                                    "{review.comment || 'Khách hàng không để lại nội dung.'}"
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-400 font-bold px-1">
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-gray-300" />
                                <span>Gửi lúc: {formatDate(review.created_at)}</span>
                            </div>
                            <span className="bg-gray-100 px-2 py-1 rounded text-[10px] text-gray-500 font-mono">ID: #{review.id}</span>
                        </div>
                    </div>
                </div>

                {/* Helpful Tips */}
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                    <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed font-medium">
                        <span className="font-bold">Lưu ý:</span> Chỉ những đánh giá được <span className="font-bold uppercase underline">Duyệt</span> mới hiển thị công khai trên website. Bạn có thể ẩn đánh giá bằng cách nhấn <span className="font-bold uppercase text-red-600">Từ chối</span>.
                    </p>
                </div>
            </div>
        </Dialog>
    );
};

export default function ReviewsPageTailwind() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [selectedReview, setSelectedReview] = useState(null);
    const [error, setError] = useState(null);

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: '',
        description: '',
        type: 'warning',
        onConfirm: null
    });

    // Toast state
    const [toast, setToast] = useState({
        isVisible: false,
        message: '',
        type: 'success'
    });

    // Fetch reviews
    const fetchReviews = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/reviews');
            const data = await res.json();

            if (data.success) {
                setReviews(data.reviews || []);
            } else {
                setError(data.message || 'Không thể tải danh sách đánh giá');
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setError('Lỗi khi tải dữ liệu');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // Calculate stats
    const stats = useMemo(() => {
        const total = reviews.length;
        const pending = reviews.filter(r => r.status === 'pending').length;
        const approved = reviews.filter(r => r.status === 'approved').length;
        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        return { total, pending, approved, avgRating };
    }, [reviews]);

    // Filter reviews
    const filteredReviews = useMemo(() => {
        return reviews.filter(review => {
            const matchesSearch =
                review.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.comment?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
            const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);

            return matchesSearch && matchesStatus && matchesRating;
        });
    }, [reviews, searchTerm, statusFilter, ratingFilter]);

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ isVisible: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    // Show confirmation dialog
    const showConfirmDialog = (title, description, type, onConfirm) => {
        setConfirmDialog({
            open: true,
            title,
            description,
            type,
            onConfirm: () => {
                setConfirmDialog(prev => ({ ...prev, open: false }));
                onConfirm();
            }
        });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
    };

    // Handle approve
    const handleApprove = (reviewId) => {
        const review = reviews.find(r => r.id === reviewId);
        showConfirmDialog(
            'Xác nhận duyệt đánh giá',
            `Bạn có chắc chắn muốn duyệt đánh giá từ "${review?.customer_name}" không?`,
            'info',
            async () => {
                try {
                    const res = await fetch(`/api/admin/reviews/${reviewId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'approved' })
                    });

                    const data = await res.json();

                    if (res.ok && data.success) {
                        setSelectedReview(null);
                        fetchReviews();
                        showToast('Duyệt đánh giá thành công!', 'success');
                    } else {
                        showToast(data.message || 'Duyệt đánh giá thất bại!', 'error');
                    }
                } catch (error) {
                    console.error('Error approving review:', error);
                    showToast('Lỗi khi duyệt đánh giá!', 'error');
                }
            }
        );
    };

    // Handle reject
    const handleReject = (reviewId) => {
        const review = reviews.find(r => r.id === reviewId);
        showConfirmDialog(
            'Xác nhận từ chối đánh giá',
            `Bạn có chắc chắn muốn từ chối đánh giá từ "${review?.customer_name}" không?`,
            'warning',
            async () => {
                try {
                    const res = await fetch(`/api/admin/reviews/${reviewId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'rejected' })
                    });

                    const data = await res.json();

                    if (res.ok && data.success) {
                        setSelectedReview(null);
                        fetchReviews();
                        showToast('Từ chối đánh giá thành công!', 'success');
                    } else {
                        showToast(data.message || 'Từ chối đánh giá thất bại!', 'error');
                    }
                } catch (error) {
                    console.error('Error rejecting review:', error);
                    showToast('Lỗi khi từ chối đánh giá!', 'error');
                }
            }
        );
    };

    // Handle delete
    const handleDelete = (reviewId) => {
        const review = reviews.find(r => r.id === reviewId);
        showConfirmDialog(
            'Xác nhận xóa đánh giá',
            `Bạn có chắc chắn muốn XÓA VĨNH VIỄN đánh giá từ "${review?.customer_name}" không? Hành động này không thể hoàn tác.`,
            'danger',
            async () => {
                try {
                    const res = await fetch(`/api/admin/reviews/${reviewId}`, {
                        method: 'DELETE'
                    });

                    const data = await res.json();

                    if (res.ok && data.success) {
                        fetchReviews();
                        showToast('Xóa đánh giá thành công!', 'success');
                    } else {
                        showToast(data.message || 'Xóa đánh giá thất bại!', 'error');
                    }
                } catch (error) {
                    console.error('Error deleting review:', error);
                    showToast('Lỗi khi xóa đánh giá!', 'error');
                }
            }
        );
    };

    // Table columns
    const columns = useMemo(() => [
        {
            accessorKey: 'customer_name',
            header: 'Khách hàng',
            cell: ({ row }) => (
                <div className="flex flex-col py-0.5">
                    <span className="text-base font-semibold text-gray-900 leading-tight">{row.original.customer_name}</span>
                    {row.original.customer_email && (
                        <span className="text-xs text-blue-600 font-medium mt-0.5">{row.original.customer_email}</span>
                    )}
                </div>
            ),
            size: 180
        },
        {
            accessorKey: 'product_name',
            header: 'Sản phẩm',
            cell: ({ getValue }) => (
                <span className="text-sm font-medium text-blue-600 line-clamp-2 leading-snug">{getValue()}</span>
            ),
            size: 180
        },
        {
            accessorKey: 'rating',
            header: 'Đánh giá',
            cell: ({ getValue }) => (
                <div className="py-1">
                    <StarRating rating={getValue()} size={14} />
                </div>
            ),
            size: 120
        },
        {
            accessorKey: 'comment',
            header: 'Nội dung',
            cell: ({ getValue }) => {
                const comment = getValue();
                return (
                    <span className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {comment || 'Không có nội dung'}
                    </span>
                );
            },
            size: 250
        },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ getValue }) => {
                const status = getValue();
                return (
                    <span className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-tight text-white shadow-sm ${status === 'approved' ? 'bg-green-600' :
                        status === 'rejected' ? 'bg-red-600' :
                            'bg-amber-500'
                        }`}>
                        {status === 'approved' ? 'Đã duyệt' :
                            status === 'rejected' ? 'Từ chối' :
                                'Chờ duyệt'}
                    </span>
                );
            },
            size: 120
        },
        {
            accessorKey: 'created_at',
            header: 'Ngày gửi',
            cell: ({ getValue }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                        {getValue() ? format(new Date(getValue()), 'dd/MM') : 'N/A'}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                        {getValue() ? format(new Date(getValue()), 'yyyy') : ''}
                    </span>
                </div>
            ),
            size: 100
        },
        {
            id: 'actions',
            header: 'Thao tác',
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-1">
                    <Tooltip content="Xem chi tiết">
                        <button
                            onClick={() => setSelectedReview(row.original)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        >
                            <Eye size={18} />
                        </button>
                    </Tooltip>
                    {row.original.status !== 'approved' && (
                        <Tooltip content="Duyệt">
                            <button
                                onClick={() => handleApprove(row.original.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                            >
                                <CheckCircle size={18} />
                            </button>
                        </Tooltip>
                    )}
                    {row.original.status !== 'rejected' && (
                        <Tooltip content="Từ chối">
                            <button
                                onClick={() => handleReject(row.original.id)}
                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                            >
                                <XCircle size={18} />
                            </button>
                        </Tooltip>
                    )}
                    <Tooltip content="Xóa">
                        <button
                            onClick={() => handleDelete(row.original.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </Tooltip>
                </div>
            ),
            size: 180
        }
    ], []);

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Quản lý đánh giá</h1>
                    <span className="text-sm text-gray-500">({stats.total} đánh giá)</span>
                </div>
                <Button
                    variant="outline"
                    startIcon={<RefreshCw size={16} />}
                    onClick={fetchReviews}
                    className="!bg-gray-500 !hover:bg-gray-600 text-white"
                >
                    Làm mới
                </Button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {loading ? (
                    <>
                        <SkeletonStatsCard />
                        <SkeletonStatsCard />
                        <SkeletonStatsCard />
                        <SkeletonStatsCard />
                    </>
                ) : (
                    <>
                        {/* Total */}
                        <div 
                            onClick={() => setStatusFilter('all')}
                            className={`relative p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${statusFilter === 'all' ? 'ring-4 ring-blue-300 ring-offset-2' : ''}`}>
                            <Star size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <Star size={32} className="opacity-90 mb-3" />
                                <p className="text-3xl font-bold mb-1">{stats.total}</p>
                                <p className="text-sm opacity-90">Tổng đánh giá</p>
                            </div>
                        </div>

                        {/* Pending */}
                        <div 
                            onClick={() => setStatusFilter('pending')}
                            className={`relative p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${statusFilter === 'pending' ? 'ring-4 ring-amber-300 ring-offset-2' : ''}`}>
                            <Clock size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <Clock size={32} className="opacity-90 mb-3" />
                                <p className="text-3xl font-bold mb-1">{stats.pending}</p>
                                <p className="text-sm opacity-90">Chờ duyệt</p>
                            </div>
                        </div>

                        {/* Approved */}
                        <div 
                            onClick={() => setStatusFilter('approved')}
                            className={`relative p-4 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${statusFilter === 'approved' ? 'ring-4 ring-green-300 ring-offset-2' : ''}`}>
                            <ThumbsUp size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <ThumbsUp size={32} className="opacity-90 mb-3" />
                                <p className="text-3xl font-bold mb-1">{stats.approved}</p>
                                <p className="text-sm opacity-90">Đã duyệt</p>
                            </div>
                        </div>

                        {/* Average Rating */}
                        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1">
                            <Star size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <Star size={32} className="opacity-90 mb-3" />
                                <p className="text-3xl font-bold mb-1">{stats.avgRating}</p>
                                <p className="text-sm opacity-90">Trung bình</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Filters */}
            <div className="p-4 mb-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm theo tên, sản phẩm..."
                            startIcon={<Search size={16} />}
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="rejected">Đã từ chối</option>
                    </select>

                    {/* Rating Filter */}
                    <select
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="all">Tất cả đánh giá</option>
                        <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
                        <option value="4">⭐⭐⭐⭐ (4 sao)</option>
                        <option value="3">⭐⭐⭐ (3 sao)</option>
                        <option value="2">⭐⭐ (2 sao)</option>
                        <option value="1">⭐ (1 sao)</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="flex-1 min-h-[600px]">
                <DataTable
                    data={filteredReviews}
                    columns={columns}
                    loading={loading}
                    searchable={false}
                    pageSize={20}
                    emptyStateIcon={<Star size={48} className="text-gray-400" />}
                    emptyStateTitle="Không có đánh giá"
                    emptyStateDescription="Chưa có đánh giá nào để hiển thị"
                />
            </div>

            {/* Review Detail Modal */}
            <ReviewDetailModal
                open={Boolean(selectedReview)}
                onClose={() => setSelectedReview(null)}
                review={selectedReview}
                onApprove={handleApprove}
                onReject={handleReject}
            />

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={confirmDialog.open}
                onClose={closeConfirmDialog}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                description={confirmDialog.description}
                type={confirmDialog.type}
            />

            {/* Toast Notification */}
            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        </div>
    );
}
