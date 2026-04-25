/**
 * Account profile page component - Enhanced UI/UX
 * @file src/app/account/profile/page.js
 */
'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { format } from 'date-fns';
import {
    UserCircle2, PackageSearch, Heart, MapPin, ShieldCheck, Pencil,
    TrendingUp, Package, CheckCircle2, XCircle, Clock, Wallet,
    Crown, Star, Gift, ChevronRight, Award
} from 'lucide-react';

const FormInput = ({
    label,
    name,
    value,
    onChange,
    disabled = false,
    placeholder = '',
    type = 'text',
    helperText = '',
}) => (
    <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
        <input
            type={type}
            name={name}
            id={name}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full rounded-2xl border-2 px-4 py-3 text-[15px] transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:shadow-md ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-300' : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
        />
        {helperText && <span className="mt-1.5 block text-[11px] text-gray-500">{helperText}</span>}
    </label>
);

// Membership badge component - Premium Design
const MembershipBadge = ({ level, totalSpent }) => {
    const badges = {
        'Khách hàng VIP': {
            icon: Crown,
            gradient: 'linear-gradient(135deg, #B9F2FF 0%, #1E9FD6 50%, #0077B6 100%)', // Diamond: Cyan to Deep Blue
            text: 'text-white',
            glow: '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            shadow: '0 4px 15px rgba(0, 119, 182, 0.3), 0 2px 5px rgba(0, 0, 0, 0.2)',
        },
        'Khách hàng thân thiết': {
            icon: Star,
            gradient: 'linear-gradient(135deg, #F0F0F0 0%, #C0C0C0 50%, #8C8C8C 100%)', // Silver: Light to Dark Gray
            text: 'text-gray-800',
            glow: '0 0 15px rgba(192, 192, 192, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            shadow: '0 4px 12px rgba(140, 140, 140, 0.3), 0 2px 5px rgba(0, 0, 0, 0.15)',
        },
        'Khách hàng mới': {
            icon: Award,
            gradient: 'linear-gradient(135deg, #E6A57E 0%, #CD7F32 50%, #8B4513 100%)', // Bronze: Light Copper to Dark Bronze
            text: 'text-white',
            glow: '0 0 15px rgba(205, 127, 50, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            shadow: '0 4px 12px rgba(139, 69, 19, 0.3), 0 2px 5px rgba(0, 0, 0, 0.15)',
        },
    };
    const config = badges[level] || badges['Khách hàng mới'];
    const Icon = config.icon;

    return (
        <div 
            className={`inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-sm font-bold ${config.text} transition-all duration-300 hover:scale-105`}
            style={{ 
                background: config.gradient,
                boxShadow: `${config.shadow}, ${config.glow}`,
                border: config.border,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
            }}
        >
            <Icon size={18} strokeWidth={2.5} />
            <span className="tracking-wide">{level}</span>
        </div>
    );
};

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function ProfilePage() {
    const { user, loading, refreshUser } = useAuth();
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const formRef = useRef(null);

    // Auto-refresh user data every 30 seconds to sync with database
    useEffect(() => {
        if (!loading && user) {
            const interval = setInterval(() => {
                refreshUser();
            }, 30000); // Refresh every 30 seconds

            return () => clearInterval(interval);
        }
    }, [loading, user, refreshUser]);

    // Scroll to form when editing
    const handleStartEdit = () => {
        setIsEditing(true);
        // Scroll to form after state update
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const initialForm = useMemo(() => {
        if (!user) {
            return {
                fullName: '',
                phone: '',
                email: '',
                address: '',
                city: '',
                district: '',
                newPassword: '',
                confirmPassword: '',
            };
        }
        return {
            fullName: user.full_name || '',
            phone: user.phone_number || '',
            email: user.email || '',
            address: user.shipping_address || '',
            city: user.city || '',
            district: user.district || '',
            newPassword: '',
            confirmPassword: '',
        };
    }, [user]);

    useEffect(() => {
        setFormData(initialForm);
    }, [initialForm]);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            showToast('Mật khẩu xác nhận không khớp!', 'error');
            return;
        }

        const res = await fetch('/api/auth/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            showToast('Cập nhật thông tin thành công!', 'success');
            setIsEditing(false);
            setFormData((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
        } else {
            showToast('Cập nhật thất bại!', 'error');
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData(initialForm);
    };

    if (loading || !user) {
        return (
            <div className="space-y-6">
                <div className="h-48 rounded-3xl bg-gray-200 shimmer" style={{ transform: 'scale(1)', transition: 'none' }} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl bg-gray-100 shimmer" style={{ transform: 'scale(1)', transition: 'none' }} />)}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map(i => <div key={i} className="h-32 rounded-2xl bg-gray-100 shimmer" style={{ transform: 'scale(1)', transition: 'none' }} />)}
                </div>
            </div>
        );
    }

    const displayName = user.full_name || user.username;
    const initials = displayName
        ? displayName.split(' ').map((part) => part.charAt(0).toUpperCase()).slice(0, 2).join('')
        : 'BT';
    const membershipLevel = user.membership_level || 'Khách hàng mới';

    // Enhanced stats with icons and colors
    const stats = [
        {
            label: 'Tổng đơn hàng',
            value: user.total_orders ?? 0,
            icon: Package,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50',
        },
        {
            label: 'Giao thành công',
            value: user.successful_orders ?? 0,
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-50',
        },
        {
            label: 'Đã hủy',
            value: user.cancelled_orders ?? 0,
            icon: XCircle,
            color: 'text-rose-500',
            bgColor: 'bg-rose-50',
        },
        {
            label: 'Đang xử lý',
            value: user.pending_orders ?? 0,
            icon: Clock,
            color: 'text-amber-500',
            bgColor: 'bg-amber-50',
        },
    ];

    // Financial stats
    const financialStats = [
        {
            label: 'Tổng chi tiêu',
            value: formatCurrency(user.total_spent ?? 0),
            description: 'Tính trên các đơn giao thành công',
            icon: Wallet,
            bgColor: '#2563eb', // teal-500 (trung bình của emerald-500 và teal-600)
        },
        {
            label: 'Điểm tích lũy',
            value: user.reward_points ?? 0,
            description: 'Đổi ưu đãi bất kỳ lúc nào',
            icon: Gift,
            bgColor: '#16a34a', // indigo-500 (trung bình của purple-500 và indigo-600)
        },
    ];

    const quickActions = [
        {
            href: '/order-tracking',
            label: 'Theo dõi đơn hàng',
            description: 'Kiểm tra trạng thái giao hàng',
            icon: PackageSearch,
            iconBg: 'bg-blue-500',
        },
        {
            href: '/wishlist',
            label: 'Món yêu thích',
            description: 'Xem nhanh món đã lưu',
            icon: Heart,
            iconBg: 'bg-rose-500',
        },
        {
            href: '/contact',
            label: 'Hỗ trợ & Liên hệ',
            description: 'Tư vấn hoặc thay đổi đơn',
            icon: MapPin,
            iconBg: 'bg-emerald-500',
        },
    ];

    const accountInfo = [
        { label: 'Tên đăng nhập', value: user.username || 'Chưa thiết lập' },
        { label: 'Nhóm tài khoản', value: user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng' },
        { label: 'Ngày tham gia', value: user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : 'N/A' },
    ];

    return (
        <div className="space-y-6 pb-24">
            {/* Hero Section - User Profile Card */}
            <section className="relative overflow-hidden rounded-3xl text-white shadow-md" style={{ backgroundColor: '#FF6F30' }}>
                <div className="relative p-6 sm:p-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden">
                                <Image
                                    src="/images/banner-logo/banhtamcodao-logo.png"
                                    alt="Bánh Tằm Cô Đào Logo"
                                    fill
                                    className="object-contain p-2"
                                    sizes="100px"
                                />
                            </div>
                            <div>
                                <p className="text-sm text-white/80 mb-1">Xin chào,</p>
                                <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{displayName}</h1>
                                <div className="mt-3">
                                    <MembershipBadge level={membershipLevel} totalSpent={user.total_spent} />
                                </div>
                            </div>
                        </div>
                        {!isEditing && (
                            <button
                                type="button"
                                onClick={handleStartEdit}
                                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-4 py-2 text-sm font-medium text-white transition hover:bg-white/30"
                            >
                                <Pencil size={16} />
                                Chỉnh sửa
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Order Statistics */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {stats.map(({ label, value, icon: Icon, color, bgColor }) => (
                    <div key={label} className="group relative rounded-2xl bg-white p-5 shadow-md border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                            <Icon size={22} className={color} />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-secondary group-hover:text-primary transition-colors">{value}</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-600 mt-1">{label}</p>
                    </div>
                ))}
            </section>

            {/* Financial Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {financialStats.map(({ label, value, description, icon: Icon, bgColor }) => (
                    <div key={label} className="group relative overflow-hidden rounded-2xl p-6 text-white shadow-md border border-white/20 hover:shadow-md transition-all duration-300 hover:-translate-y-1" style={{ backgroundColor: bgColor }}>
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white blur-2xl"></div>
                        </div>
                        {/* Icon background */}
                        <div className="absolute top-0 right-0 opacity-25 group-hover:opacity-30 transition-opacity">
                            <Icon size={100} strokeWidth={1} />
                        </div>
                        {/* Content */}
                        <div className="relative z-10">
                            <p className="text-sm font-semibold text-white/90 mb-2 uppercase tracking-wide">{label}</p>
                            <p className="text-3xl sm:text-4xl font-bold mb-2 drop-shadow-lg">{value}</p>
                            <p className="text-xs text-white/80 font-medium">{description}</p>
                        </div>
                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                        </div>
                    </div>
                ))}
            </section>

            {/* Quick Actions */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold text-secondary">Truy cập nhanh</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {quickActions.map(({ href, label, description, icon: Icon, iconBg }) => (
                        <Link
                            key={label}
                            href={href}
                            className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-md border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                <Icon size={24} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-secondary group-hover:text-primary transition-colors">{label}</p>
                                <p className="text-sm text-gray-600 font-medium">{description}</p>
                            </div>
                            <ChevronRight size={20} className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))}
                </div>
            </section>

            {/* Contact Information Form */}
            <form onSubmit={handleSave} className="space-y-6">
                <section ref={formRef} className="rounded-2xl bg-white shadow-md border border-gray-200 scroll-mt-24">
                    <div className="flex flex-col gap-5 p-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-secondary">Thông tin liên hệ</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Cập nhật để giao hàng nhanh chóng hơn
                                </p>
                            </div>
                            {!isEditing && (
                                <button
                                    type="button"
                                    onClick={handleStartEdit}
                                    className="sm:hidden rounded-full bg-primary/10 p-2 text-primary"
                                >
                                    <Pencil size={18} />
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <FormInput
                                label="Họ và tên"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormInput
                                    label="Số điện thoại"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                <FormInput
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>

                            <FormInput
                                label="Địa chỉ giao hàng"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormInput
                                    label="Quận / Huyện"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                <FormInput
                                    label="Tỉnh / Thành phố"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Account Information */}
                <section className="rounded-2xl bg-white shadow-md border border-gray-200">
                    <div className="p-5 sm:p-6">
                        <h3 className="text-lg font-semibold text-secondary mb-4">Thông tin tài khoản</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {accountInfo.map((item) => (
                                <div key={item.label} className="rounded-xl border-2 border-gray-200 bg-white p-4 shadow-md hover:shadow-lg hover:border-primary/30 transition-all">
                                    <span className="block text-xs uppercase tracking-wide text-gray-600 mb-2 font-semibold">{item.label}</span>
                                    <span className="block font-bold text-secondary text-lg">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Password Change (visible only when editing) */}
                {isEditing && (
                    <section className="rounded-2xl bg-white shadow-md border border-gray-200">
                        <div className="p-5 sm:p-6 space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-secondary">Đổi mật khẩu</h3>
                                <p className="text-sm text-gray-500">
                                    Để trống nếu không muốn thay đổi
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormInput
                                    label="Mật khẩu mới"
                                    name="newPassword"
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                />
                                <FormInput
                                    label="Xác nhận mật khẩu"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </section>
                )}

                {/* Action Buttons */}
                <div className="sticky bottom-20 sm:bottom-4 z-10">
                    <div className="rounded-2xl bg-white/95 backdrop-blur p-4 shadow-md sm:bg-transparent sm:p-0 sm:shadow-none">
                        {isEditing ? (
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="w-full sm:w-auto rounded-2xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-600 transition hover:bg-gray-100"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto rounded-2xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-orange-600 shadow-md shadow-primary/20"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleStartEdit}
                                className="w-full sm:w-auto rounded-2xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-orange-600 shadow-lg shadow-primary/20"
                            >
                                Chỉnh sửa thông tin
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}