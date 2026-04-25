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
    Crown, Star, Gift, ChevronRight, Award, History as HistoryIcon, Ticket
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
            className={`w-full rounded-xl border px-4 py-3 text-[15px] transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-200 hover:border-gray-300'
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

    // Auto-refresh user data every 30 seconds
    useEffect(() => {
        if (!loading && user) {
            const interval = setInterval(() => {
                refreshUser();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [loading, user, refreshUser]);

    const handleStartEdit = () => {
        setIsEditing(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const initialForm = useMemo(() => {
        if (!user) return { fullName: '', phone: '', email: '', address: '', city: '', district: '', newPassword: '', confirmPassword: '' };
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

    useEffect(() => { setFormData(initialForm); }, [initialForm]);

    const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        // Guard: only save when explicitly in editing mode
        if (!isEditing) return;

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
            refreshUser();
        } else {
            showToast('Cập nhật thất bại!', 'error');
        }
    };

    if (loading && !user) {
        return (
            <div className="space-y-6">
                <div className="h-40 rounded-2xl bg-gray-100" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-50" />)}
                </div>
            </div>
        );
    }

    const displayName = user.full_name || user.username || 'Khách hàng';
    const membershipLevel = user.membership_level || 'Khách hàng mới';

    const stats = [
        { label: 'Tổng đơn hàng', value: user.total_orders ?? 0, icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { label: 'Giao thành công', value: user.successful_orders ?? 0, icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
        { label: 'Đã hủy', value: user.cancelled_orders ?? 0, icon: XCircle, color: 'text-rose-600', bgColor: 'bg-rose-50' },
        { label: 'Đang xử lý', value: user.pending_orders ?? 0, icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    ];

    const financialStats = [
        {
            label: 'TỔNG CHI TIÊU',
            value: formatCurrency(user.total_spent ?? 0),
            description: 'Dựa trên đơn hàng thành công',
            icon: Wallet,
            gradient: 'from-blue-600 to-indigo-700',
        },
        {
            label: 'ĐIỂM TÍCH LŨY',
            value: `${user.reward_points ?? 0} ĐIỂM`,
            description: 'Đổi quà & ưu đãi hấp dẫn',
            icon: Gift,
            gradient: 'from-emerald-600 to-teal-700',
        },
    ];

    const quickActions = [
        { href: '/account/orders', label: 'Lịch sử mua hàng', description: 'Xem chi tiết các đơn đã đặt', icon: HistoryIcon, iconBg: 'bg-slate-800' },
        { href: '/account/rewards', label: 'Ưu đãi của tôi', description: 'Kiểm tra điểm & quà tặng', icon: Ticket, iconBg: 'bg-primary' },
    ];

    return (
        <div className="space-y-3">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF6F30] via-[#FF8C5A] to-[#FF6F30] p-4 sm:p-5 text-white">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black/10 blur-2xl" />

                <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <div className="relative">
                        <div className="h-28 w-28 p-2.5 shadow-mg">
                            <Image
                                src="/images/banner-logo/banhtamcodao-logo.png"
                                alt="Logo"
                                width={90}
                                height={90}
                                className="object-contain"
                            />
                        </div>
                        <div className="absolute bottom-3 right-3 h-7 w-7 rounded-full flex items-center justify-center bg-blue-50">
                            <CheckCircle2 size={32} className="text-blue-600" />
                        </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/80 mb-2 block">Khách hàng thành viên</span>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{displayName}</h1>
                        <MembershipBadge level={membershipLevel} />
                    </div>

                    <div className="flex gap-2">
                        {!isEditing && (
                            <button
                                onClick={handleStartEdit}
                                className="flex items-center gap-2 rounded-2xl bg-white/20 backdrop-blur-md px-6 py-3 text-sm font-bold border border-white/30 transition-all hover:bg-white/30"
                            >
                                <Pencil size={18} />
                                <span>Chỉnh sửa thông tin</span>
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {stats.map(({ label, value, icon: Icon, color, bgColor }) => (
                    <div key={label} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center shrink-0`}>
                            <Icon size={18} className={color} />
                        </div>
                        <div className="space-y-0">
                            <p className="text-xl font-black text-secondary tracking-tight leading-none">{value}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Financial Highlights */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {financialStats.map(({ label, value, description, icon: Icon, gradient }) => (
                    <div key={label} className={`relative overflow-hidden rounded-xl p-4 sm:p-5 text-white shadow-sm bg-gradient-to-br ${gradient} transition-all hover:shadow-md`}>
                        <div className="absolute top-0 right-0 opacity-10">
                            <Icon size={100} strokeWidth={1} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[9px] font-bold text-white/70 mb-1 uppercase tracking-widest">{label}</p>
                            <p className="text-2xl font-black tracking-tight">{value}</p>
                            <p className="text-[11px] text-white/80 font-medium">{description}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Quick Actions */}
            <section className="space-y-2">
                <h2 className="text-base font-bold text-secondary px-1">Truy cập nhanh</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {quickActions.map(({ href, label, description, icon: Icon, iconBg }) => (
                        <Link
                            key={label}
                            href={href}
                            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-primary/20"
                        >
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg} text-white`}>
                                <Icon size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-secondary leading-tight">{label}</p>
                                <p className="text-[11px] text-gray-500 font-medium leading-tight">{description}</p>
                            </div>
                            <ChevronRight size={14} className="text-gray-300" />
                        </Link>
                    ))}
                </div>
            </section>

            {/* Main Form Section */}
            <section ref={formRef} className="rounded-2xl overflow-hidden">
                <div className="px-2 sm:px-4 py-5 border-b border-gray-300 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-secondary tracking-tight">Hồ sơ cá nhân</h2>
                        <p className="text-[12px] text-gray-500 font-medium">Cập nhật thông tin cá nhân</p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={handleStartEdit}
                            className="p-3 rounded-full bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-primary transition-colors"
                        >
                            <Pencil size={20} />
                        </button>
                    )}
                </div>

                <form
                    onSubmit={handleSave}
                    className="p-2 sm:p-4 space-y-2"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !isEditing) e.preventDefault(); }}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormInput label="Họ và tên" name="fullName" value={formData.fullName} onChange={handleChange} disabled={!isEditing} placeholder="Nhập họ tên của bạn" />
                        <FormInput label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} placeholder="0xxxxxxxxx" />
                        <FormInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={!isEditing} placeholder="example@email.com" />
                        <FormInput label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} disabled={!isEditing} placeholder="Số nhà, tên đường..." />
                        <FormInput label="Quận / Huyện" name="district" value={formData.district} onChange={handleChange} disabled={!isEditing} placeholder="Quận/Huyện" />
                        <FormInput label="Tỉnh / Thành phố" name="city" value={formData.city} onChange={handleChange} disabled={!isEditing} placeholder="Tỉnh/Thành phố" />
                    </div>

                    {isEditing && (
                        <div className="pt-8 border-t border-gray-100 space-y-6 animate-in slide-in-from-top-4">
                            <div>
                                <h3 className="text-lg font-bold text-secondary">Đổi mật khẩu</h3>
                                <p className="text-sm text-gray-500">Để trống nếu không muốn thay đổi</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormInput label="Mật khẩu mới" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} />
                                <FormInput label="Xác nhận mật khẩu" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex items-center justify-end gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => { setIsEditing(false); setFormData(initialForm); }}
                                    className="px-8 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="px-10 py-3.5 rounded-2xl font-bold text-white shadow-md transition-all bg-primary hover:bg-orange-600 shadow-primary/20"
                                >
                                    Lưu thay đổi
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={handleStartEdit}
                                className="px-10 py-3.5 rounded-2xl font-bold text-white shadow-md transition-all bg-secondary hover:bg-slate-800 shadow-secondary/20"
                            >
                                Cập nhật thông tin
                            </button>
                        )}
                    </div>
                </form>
            </section>
        </div>
    );
}
