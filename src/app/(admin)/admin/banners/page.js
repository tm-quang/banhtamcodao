/**
 * Admin Banners Management Page - TailwindCSS Version
 * @file src/app/(admin)/admin/banners/page.js
 */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Image as ImageIcon, PlusCircle, Edit, Trash2, Eye, EyeOff,
    Upload, Link2, Calendar, Grid as GridIcon, List, Search, X,
    CheckCircle, XCircle, RefreshCw, ExternalLink, AlertCircle, Info, ChevronRight, Layout,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/tailwindcss/ui/Button';
import { Input } from '@/components/tailwindcss/ui/Input';
import { Chip } from '@/components/tailwindcss/ui/Chip';
import { Dialog } from '@/components/tailwindcss/ui/Dialog';
import { Tooltip } from '@/components/tailwindcss/ui/Tooltip';
import { AlertModal } from '@/components/tailwindcss/ui/AlertModal';
import { SkeletonStatsCard } from '@/components/tailwindcss/ui/Skeleton';

// Banner Modal Component
const BannerModal = ({ open, onClose, onSave, bannerToEdit, onAlert }) => {
    const [formData, setFormData] = useState({
        title: '',
        image_url: '',
        link_url: '',
        active: true,
        sort_order: 0,
        position: 'home'
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (open) {
            if (bannerToEdit) {
                setFormData({
                    ...bannerToEdit,
                    active: bannerToEdit.active ?? true,
                    sort_order: bannerToEdit.sort_order ?? 0,
                    position: bannerToEdit.position ?? 'home'
                });
            } else {
                setFormData({
                    title: '',
                    image_url: '',
                    link_url: '',
                    active: true,
                    sort_order: 0,
                    position: 'home'
                });
            }
        }
    }, [bannerToEdit, open]);

    const handleImageUpload = async (file) => {
        if (!file) return;

        setUploading(true);
        try {
            const { uploadImage } = await import('@/app/actions/cloudinary');
            const data = new FormData();
            data.append('file', file);
            data.append('upload_preset', 'banhtamcodao');

            const result = await uploadImage(data);
            if (result.success && result.url) {
                setFormData(prev => ({ ...prev, image_url: result.url }));
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            onAlert('Upload hình ảnh thất bại!', 'Lỗi', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = () => {
        if (!formData.title.trim()) {
            onAlert('Vui lòng nhập tiêu đề banner!', 'Thông báo', 'warning');
            return;
        }
        if (!formData.image_url) {
            onAlert('Vui lòng tải lên hoặc nhập URL hình ảnh!', 'Thông báo', 'warning');
            return;
        }
        onSave(formData);
    };

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
                variant="primary"
                onClick={handleSubmit}
                disabled={uploading}
                startIcon={uploading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            >
                {bannerToEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
        </div>
    );

    const SectionHeader = ({ icon: Icon, title, color = '#3b82f6' }) => (
        <div className="flex items-center gap-2 mb-3 mt-4">
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
                        <ImageIcon size={22} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-black text-gray-900 block">
                            {bannerToEdit ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
                        </span>
                        <p className="text-xs text-gray-500 font-medium">Thiết lập hình ảnh quảng cáo và vị trí hiển thị</p>
                    </div>
                </div>
            }
            footer={footer}
        >
            <div className="space-y-8">
                {/* Section 1: Hình ảnh */}
                <div>
                    <SectionHeader icon={ImageIcon} title="Hình ảnh quảng cáo" color="#3b82f6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative aspect-[21/9] bg-gray-50 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 group hover:border-blue-400 transition-all">
                            {formData.image_url ? (
                                <>
                                    <img
                                        src={formData.image_url}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                        <label className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white cursor-pointer hover:bg-white/40 transition-all active:scale-90 border border-white/30">
                                            <Upload size={20} />
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} />
                                        </label>
                                        <button
                                            onClick={() => setFormData({ ...formData, image_url: '' })}
                                            className="p-3 bg-red-500/80 backdrop-blur-md rounded-2xl text-white hover:bg-red-600 transition-all active:scale-90 border border-white/10"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                                        {uploading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
                                    </div>
                                    <span className="text-sm font-black text-gray-400 uppercase tracking-wider">
                                        {uploading ? 'Đang xử lý...' : 'Tải ảnh lên'}
                                    </span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} disabled={uploading} />
                                </label>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Hoặc nhập URL hình ảnh</label>
                                <Input
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="https://cloudinary.com/..."
                                    startIcon={<Link2 size={16} />}
                                    className="bg-gray-50 font-mono text-xs"
                                />
                            </div>
                            <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 shadow-sm">
                                <div className="flex gap-3 text-blue-800">
                                    <Info size={18} className="shrink-0 mt-0.5 text-blue-500" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-black">Thông số gợi ý</p>
                                        <ul className="text-xs font-medium opacity-80 list-disc ml-4 space-y-1">
                                            <li>Tỷ lệ: 21:9 (1200x500px)</li>
                                            <li>Dung lượng: Tối đa 2MB</li>
                                            <li>Định dạng: JPG, PNG, WEBP</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Nội dung & Vị trí */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <SectionHeader icon={Info} title="Thông tin cơ bản" color="#8b5cf6" />
                        <div className="space-y-4">
                            <Input
                                label="Tiêu đề gợi nhớ *"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="VD: Banner Khuyến mãi hè 2024"
                                className="font-bold"
                                required
                            />
                            <Input
                                label="Đường dẫn liên kết (Link)"
                                value={formData.link_url}
                                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                placeholder="/products/sale, https://..."
                                startIcon={<ExternalLink size={16} />}
                                className="text-blue-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <SectionHeader icon={Layout} title="Vị trí & Hiển thị" color="#10b981" />
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Vị trí hiển thị</label>
                                <select
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="home">🏠 Trang chủ (Banner chính)</option>
                                    <option value="sidebar">📰 Sidebar (Cột bên)</option>
                                    <option value="popup">🎁 Popup (Quảng cáo nổi)</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Số thứ tự"
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                    className="font-mono"
                                />
                                <div className="flex flex-col justify-end pb-1.5">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <span className="text-xs font-black text-gray-500 uppercase">Kích hoạt</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.active}
                                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default function BannersPageTailwind() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [deletingBanner, setDeletingBanner] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [positionFilter, setPositionFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '', type: 'info' });

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/banners');
            const data = await res.json();
            if (data.success) {
                setBanners(data.banners || []);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const stats = useMemo(() => ({
        total: banners.length,
        active: banners.filter(b => b.active).length,
        home: banners.filter(b => b.position === 'home').length,
        popup: banners.filter(b => b.position === 'popup').length
    }), [banners]);

    const filteredBanners = useMemo(() => {
        return banners.filter(b => {
            const matchesSearch = b.title?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPos = positionFilter === 'all' || b.position === positionFilter;
            const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? b.active : !b.active);
            return matchesSearch && matchesPos && matchesStatus;
        }).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }, [banners, searchTerm, positionFilter, statusFilter]);

    const handleSave = async (data) => {
        const isEdit = Boolean(data.id);
        const url = isEdit ? `/api/admin/banners/${data.id}` : '/api/admin/banners';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchBanners();
                showAlert(isEdit ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 'Thành công', 'success');
            } else {
                const err = await res.json();
                showAlert(err.message || 'Lưu thất bại!', 'Lỗi', 'error');
            }
        } catch (error) {
            showAlert('Có lỗi xảy ra!', 'Lỗi', 'error');
        }
    };

    const handleDelete = async () => {
        if (!deletingBanner) return;
        try {
            const res = await fetch(`/api/admin/banners/${deletingBanner.id}`, { method: 'DELETE' });
            if (res.ok) {
                setDeletingBanner(null);
                fetchBanners();
                showAlert('Xóa thành công!', 'Thành công', 'success');
            } else {
                showAlert('Xóa thất bại!', 'Lỗi', 'error');
            }
        } catch (error) {
            showAlert('Xóa thất bại!', 'Lỗi', 'error');
        }
    };

    const toggleStatus = async (banner) => {
        try {
            const res = await fetch(`/api/admin/banners/${banner.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...banner, active: !banner.active })
            });
            if (res.ok) {
                fetchBanners();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const showAlert = (message, title = 'Thông báo', type = 'info') => {
        setAlertModal({ open: true, title, message, type });
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Quản lý Banner</h1>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg tracking-tight">
                        {stats.total} Banners
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        startIcon={<RefreshCw size={16} />}
                        onClick={fetchBanners}
                        className="!bg-white border-gray-200 text-gray-600 hover:text-blue-600"
                    >
                        Làm mới
                    </Button>
                    <Button
                        variant="primary"
                        startIcon={<PlusCircle size={18} />}
                        onClick={() => { setEditingBanner(null); setIsModalOpen(true); }}
                        className="!bg-blue-600 !hover:bg-blue-700 shadow-md shadow-blue-200"
                    >
                        Thêm Banner
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {loading ? (
                    <><SkeletonStatsCard /><SkeletonStatsCard /><SkeletonStatsCard /><SkeletonStatsCard /></>
                ) : (
                    <>
                        <div 
                            onClick={() => { setPositionFilter('all'); setStatusFilter('all'); }}
                            className={`relative p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group cursor-pointer ${positionFilter === 'all' && statusFilter === 'all' ? 'ring-4 ring-blue-300 ring-offset-2' : ''}`}>
                            <ImageIcon size={80} className="absolute bottom-0 right-0 opacity-10 -rotate-12 transition-transform group-hover:rotate-0" />
                            <div className="relative z-10">
                                <ImageIcon size={28} className="opacity-90 mb-3" />
                                <p className="text-3xl font-black mb-1 leading-none">{stats.total}</p>
                                <p className="text-xs font-bold opacity-80 uppercase tracking-wider">Tổng Banner</p>
                            </div>
                        </div>
                        <div 
                            onClick={() => { setStatusFilter('active'); setPositionFilter('all'); }}
                            className={`relative p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group cursor-pointer ${statusFilter === 'active' ? 'ring-4 ring-emerald-300 ring-offset-2' : ''}`}>
                            <CheckCircle size={80} className="absolute bottom-0 right-0 opacity-10 -rotate-12 transition-transform group-hover:rotate-0" />
                            <div className="relative z-10">
                                <CheckCircle size={28} className="opacity-90 mb-3" />
                                <p className="text-3xl font-black mb-1 leading-none">{stats.active}</p>
                                <p className="text-xs font-bold opacity-80 uppercase tracking-wider">Đang chạy</p>
                            </div>
                        </div>
                        <div 
                            onClick={() => { setPositionFilter('home'); setStatusFilter('all'); }}
                            className={`relative p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group cursor-pointer ${positionFilter === 'home' ? 'ring-4 ring-indigo-300 ring-offset-2' : ''}`}>
                            <Layout size={80} className="absolute bottom-0 right-0 opacity-10 -rotate-12 transition-transform group-hover:rotate-0" />
                            <div className="relative z-10">
                                <Layout size={28} className="opacity-90 mb-3" />
                                <p className="text-3xl font-black mb-1 leading-none">{stats.home}</p>
                                <p className="text-xs font-bold opacity-80 uppercase tracking-wider">Trang chủ</p>
                            </div>
                        </div>
                        <div 
                            onClick={() => { setPositionFilter('popup'); setStatusFilter('all'); }}
                            className={`relative p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group cursor-pointer ${positionFilter === 'popup' ? 'ring-4 ring-amber-300 ring-offset-2' : ''}`}>
                            <AlertCircle size={80} className="absolute bottom-0 right-0 opacity-10 -rotate-12 transition-transform group-hover:rotate-0" />
                            <div className="relative z-10">
                                <AlertCircle size={28} className="opacity-90 mb-3" />
                                <p className="text-3xl font-black mb-1 leading-none">{stats.popup}</p>
                                <p className="text-xs font-bold opacity-80 uppercase tracking-wider">Popup/Khác</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Filters Row */}
            <div className="bg-white border border-gray-200 rounded-3xl p-4 mb-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1 min-w-[280px]">
                        <Input
                            placeholder="Tìm kiếm tiêu đề banner..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            startIcon={<Search size={18} className="text-gray-400" />}
                            className="bg-gray-50/50 border-gray-100"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Lọc vị trí:</span>
                        <select
                            value={positionFilter}
                            onChange={(e) => setPositionFilter(e.target.value)}
                            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                        >
                            <option value="all">Tất cả vị trí</option>
                            <option value="home">Trang chủ</option>
                            <option value="sidebar">Sidebar</option>
                            <option value="popup">Popup</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid Display */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-3xl border border-gray-100 p-4 space-y-4 shadow-sm">
                                <div className="aspect-[21/9] bg-gray-100 rounded-2xl animate-pulse" />
                                <div className="h-6 w-3/4 bg-gray-100 rounded-lg animate-pulse" />
                                <div className="h-4 w-1/2 bg-gray-100 rounded-lg animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : filteredBanners.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <ImageIcon size={40} className="opacity-20" />
                        </div>
                        <p className="text-lg font-black text-gray-900 uppercase tracking-tight">Không tìm thấy banner nào</p>
                        <p className="text-sm font-medium opacity-60">Thử thay đổi từ khóa hoặc bộ lọc</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBanners.map((banner) => (
                            <div key={banner.id} className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                {/* Image Area */}
                                <div className="relative aspect-[21/9] overflow-hidden bg-gray-50">
                                    <img
                                        src={banner.image_url}
                                        alt={banner.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight shadow-md backdrop-blur-md ${banner.active ? 'bg-emerald-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                                            {banner.active ? 'Hiển thị' : 'Tạm ẩn'}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight bg-blue-600/90 text-white shadow-md backdrop-blur-md">
                                            {banner.position === 'home' ? 'Trang chủ' : banner.position}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                        <button
                                            onClick={() => { setEditingBanner(banner); setIsModalOpen(true); }}
                                            className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-all active:scale-90 border border-white/30"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit size={20} />
                                        </button>
                                        <button
                                            onClick={() => setDeletingBanner(banner)}
                                            className="p-3 bg-red-500/80 backdrop-blur-md rounded-2xl text-white hover:bg-red-600 transition-all active:scale-90 border border-white/10"
                                            title="Xóa"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <h3 className="font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{banner.title || 'Không có tiêu đề'}</h3>
                                        <div className="flex flex-col items-end shrink-0">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Thứ tự</span>
                                            <span className="text-sm font-black text-blue-600 font-mono leading-none">{banner.sort_order}</span>
                                        </div>
                                    </div>
                                    
                                    {banner.link_url && (
                                        <div className="flex items-center gap-1.5 text-blue-600/70 mb-5 p-2 bg-blue-50/50 rounded-lg">
                                            <Link2 size={12} className="shrink-0" />
                                            <span className="text-[10px] font-bold truncate tracking-tight">{banner.link_url}</span>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => toggleStatus(banner)}
                                        className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-2 ${banner.active 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200' 
                                            : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
                                        }`}
                                    >
                                        {banner.active ? <><Eye size={16} /> Đang hiển thị</> : <><EyeOff size={16} /> Tạm ẩn</>}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <BannerModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                bannerToEdit={editingBanner}
                onAlert={showAlert}
            />

            {/* Delete Confirmation */}
            <Dialog
                open={Boolean(deletingBanner)}
                onClose={() => setDeletingBanner(null)}
                size="sm"
                title={
                    <div className="flex items-center gap-3 text-red-600">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <AlertCircle size={22} />
                        </div>
                        <span className="font-black uppercase tracking-tight">Xác nhận xóa</span>
                    </div>
                }
                footer={
                    <div className="flex justify-end gap-3">
                        <Button 
                            variant="outline" 
                            onClick={() => setDeletingBanner(null)}
                            className="!bg-gray-100 text-gray-600 border-none"
                        >
                            Hủy
                        </Button>
                        <Button 
                            variant="danger" 
                            onClick={handleDelete}
                            className="!bg-red-600 hover:!bg-red-700 shadow-md shadow-red-200"
                        >
                            Xác nhận xóa
                        </Button>
                    </div>
                }
            >
                <div className="py-2">
                    <p className="text-gray-700 font-medium">Bạn có chắc chắn muốn xóa banner <span className="font-black text-gray-900">"{deletingBanner?.title}"</span>?</p>
                    <p className="text-xs text-gray-500 mt-2 p-3 bg-red-50 rounded-xl border border-red-100 italic">
                        Lưu ý: Hành động này không thể hoàn tác và hình ảnh sẽ không còn hiển thị trên website.
                    </p>
                </div>
            </Dialog>

            <AlertModal
                open={alertModal.open}
                onClose={() => setAlertModal(prev => ({ ...prev, open: false }))}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
}
