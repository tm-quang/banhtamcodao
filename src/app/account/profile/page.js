/**
 * Account profile page component - Enhanced UI/UX
 * @file src/app/account/profile/page.js
 */
'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
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
            className={`w-full rounded-2xl border px-4 py-3 text-[15px] transition shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-200'
                }`}
        />
        {helperText && <span className="mt-1.5 block text-[11px] text-gray-500">{helperText}</span>}
    </label>
);

// Membership badge component
const MembershipBadge = ({ level, totalSpent }) => {
    const badges = {
        'Thành viên VIP': { icon: Crown, color: 'from-yellow-400 to-amber-500', text: 'text-amber-900' },
        'Thành viên Vàng': { icon: Star, color: 'from-yellow-300 to-yellow-500', text: 'text-yellow-900' },
        'Thành viên Bạc': { icon: Award, color: 'from-gray-300 to-gray-400', text: 'text-gray-700' },
        'Thành viên thân thiết': { icon: ShieldCheck, color: 'from-blue-400 to-blue-600', text: 'text-white' },
    };
    const config = badges[level] || badges['Thành viên thân thiết'];
    const Icon = config.icon;

    return (
        <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${config.color} px-4 py-1.5 text-sm font-semibold ${config.text} shadow-md`}>
            <Icon size={16} />
            {level}
        </div>
    );
};

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const formRef = useRef(null);

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
                <div className="h-48 rounded-3xl bg-gray-200 shimmer" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl bg-gray-100 shimmer" />)}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2].map(i => <div key={i} className="h-32 rounded-2xl bg-gray-100 shimmer" />)}
                </div>
            </div>
        );
    }

    const displayName = user.full_name || user.username;
    const initials = displayName
        ? displayName.split(' ').map((part) => part.charAt(0).toUpperCase()).slice(0, 2).join('')
        : 'BT';
    const membershipLevel = user.membership_level || 'Thành viên thân thiết';

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
            color: 'from-emerald-500 to-teal-600',
        },
        {
            label: 'Điểm tích lũy',
            value: user.reward_points ?? 0,
            description: 'Đổi ưu đãi bất kỳ lúc nào',
            icon: Gift,
            color: 'from-purple-500 to-indigo-600',
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
        { label: 'Loại tài khoản', value: user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng' },
        { label: 'Ngày tham gia', value: user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : 'N/A' },
    ];

    return (
        <div className="space-y-6 pb-24">
            {/* Hero Section - User Profile Card */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-orange-500 to-rose-500 text-white shadow-xl">
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%), radial-gradient(circle at 20% 80%, #fff 0%, transparent 40%)' }} />
                <div className="relative p-6 sm:p-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 shadow-lg">
                                <span className="text-3xl font-bold text-white">{initials}</span>
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
                    <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center mb-3`}>
                            <Icon size={20} className={color} />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-secondary">{value}</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">{label}</p>
                    </div>
                ))}
            </section>

            {/* Financial Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {financialStats.map(({ label, value, description, icon: Icon, color }) => (
                    <div key={label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${color} p-5 text-white shadow-lg`}>
                        <div className="absolute top-0 right-0 opacity-20">
                            <Icon size={80} strokeWidth={1} />
                        </div>
                        <div className="relative">
                            <p className="text-sm text-white/80 mb-1">{label}</p>
                            <p className="text-2xl sm:text-3xl font-bold">{value}</p>
                            <p className="text-xs text-white/70 mt-2">{description}</p>
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
                            className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-primary/20"
                        >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} text-white shadow-md group-hover:scale-110 transition-transform`}>
                                <Icon size={24} />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-secondary group-hover:text-primary transition-colors">{label}</p>
                                <p className="text-sm text-gray-500">{description}</p>
                            </div>
                            <ChevronRight size={20} className="text-gray-300 group-hover:text-primary transition-colors" />
                        </Link>
                    ))}
                </div>
            </section>

            {/* Contact Information Form */}
            <form onSubmit={handleSave} className="space-y-6">
                <section ref={formRef} className="rounded-2xl border border-gray-100 bg-white shadow-sm scroll-mt-24">
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
                <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="p-5 sm:p-6">
                        <h3 className="text-lg font-semibold text-secondary mb-4">Thông tin tài khoản</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {accountInfo.map((item) => (
                                <div key={item.label} className="rounded-xl bg-gray-50 p-4">
                                    <span className="block text-xs uppercase tracking-wide text-gray-500 mb-1">{item.label}</span>
                                    <span className="block font-semibold text-secondary">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Password Change (visible only when editing) */}
                {isEditing && (
                    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
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
                    <div className="rounded-2xl border border-gray-100 bg-white/95 backdrop-blur p-4 shadow-lg sm:bg-transparent sm:border-0 sm:p-0 sm:shadow-none">
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
                                    className="w-full sm:w-auto rounded-2xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-orange-600 shadow-lg shadow-primary/20"
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