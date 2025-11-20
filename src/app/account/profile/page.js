// src/app/account/profile/page.js
'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { format } from 'date-fns';
import { UserCircle2, PackageSearch, Heart, MapPin, ShieldCheck, Pencil } from 'lucide-react';

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
    <label className="block text-sm font-medium text-gray-700">
        <span className="mb-1 block text-xs uppercase tracking-wide text-gray-500">{label}</span>
        <input
            type={type}
            name={name}
            id={name}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className={`w-full rounded-lg border px-3 py-2.5 text-[15px] transition shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary ${
                disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-200'
            }`}
        />
        {helperText && <span className="mt-1 block text-[11px] text-gray-500">{helperText}</span>}
    </label>
);

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

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
        return <p>Đang tải thông tin tài khoản...</p>;
    }

    const displayName = user.full_name || user.username;
    const initials = displayName
        ? displayName
              .split(' ')
              .map((part) => part.charAt(0).toUpperCase())
              .slice(0, 2)
              .join('')
        : 'BT';
    const shortName = displayName?.split(' ').slice(-2).join(' ') || 'Khách thân thiết';
    const membership = user.membership_level || 'Thành viên thân thiết';

    const infoItems = [
        { label: 'Tên tài khoản', value: user.username, helper: 'Không thể thay đổi' },
        { label: 'Ngày đăng ký', value: format(new Date(user.created_at), 'HH:mm dd/MM/yyyy') },
    ];

    const quickActions = [
        {
            href: '/order-tracking',
            label: 'Theo dõi đơn',
            description: 'Kiểm tra trạng thái giao hàng',
            icon: PackageSearch,
        },
        {
            href: '/wishlist',
            label: 'Danh sách yêu thích',
            description: 'Xem nhanh món đã lưu',
            icon: Heart,
        },
        {
            href: '/contact',
            label: 'Hỗ trợ & liên hệ',
            description: 'Tư vấn hoặc thay đổi đơn',
            icon: MapPin,
        },
    ];

    const stats = [
        {
            label: 'Đơn đã đặt',
            value: user.total_orders ?? 0,
            helper: 'Tính đến hiện tại',
        },
        {
            label: 'Điểm thưởng',
            value: user.reward_points ?? 0,
            helper: 'Đổi ưu đãi bất kỳ lúc nào',
        },
        {
            label: 'Địa chỉ giao hàng',
            value: user.address_count ?? (user.shipping_address ? 1 : 0),
            helper: 'Có thể lưu nhiều địa chỉ',
        },
    ];

    return (
        <div className="space-y-6 pb-24">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-800 to-blue-600 text-white shadow-lg">
                <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 0%, transparent 60%)' }} />
                <div className="relative flex flex-col gap-6 p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                            <span className="text-2xl font-bold text-white">{initials}</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-white/80">Xin chào,</p>
                            <h1 className="text-2xl font-semibold leading-tight">{displayName}</h1>
                            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
                                <ShieldCheck size={14} />
                                {membership}
                            </div>
                        </div>
                        {!isEditing && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="hidden rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30 sm:inline-flex"
                                aria-label="Chỉnh sửa thông tin"
                            >
                                <Pencil size={18} />
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {quickActions.map(({ href, label, description, icon: Icon }) => (
                            <Link
                                key={label}
                                href={href}
                                className="group flex items-center gap-3 rounded-2xl bg-white/10 p-4 transition hover:bg-white/20"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                                    <Icon size={22} />
                                </div>
                                <div className="text-sm">
                                    <p className="font-semibold text-white">{label}</p>
                                    <p className="text-xs text-white/80">{description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map(({ label, value, helper }) => (
                    <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
                        <p className="mt-2 text-2xl font-bold text-secondary">{value}</p>
                        <p className="mt-1 text-xs text-gray-500">{helper}</p>
                    </div>
                ))}
            </section>

            <form onSubmit={handleSave} className="space-y-6">
                <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-col gap-4 p-4 sm:p-6">
                    <div>
                        <h2 className="text-lg font-semibold text-secondary">Thông tin liên hệ</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Cập nhật thông tin để chúng tôi liên hệ giao hàng nhanh chóng hơn.
                        </p>
                    </div>

                    <div className="space-y-5">
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
                            label="Địa chỉ giao hàng mặc định"
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

            <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="p-4 sm:p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-secondary">Thông tin tài khoản</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {infoItems.map((item) => (
                            <div key={item.label} className="rounded-xl border border-dashed border-gray-200 p-4 text-sm bg-gray-50">
                                <span className="block text-xs uppercase tracking-wide text-gray-500">{item.label}</span>
                                <span className="mt-1 block font-semibold text-secondary">{item.value}</span>
                                {item.helper && <span className="mt-1 block text-xs text-gray-500">{item.helper}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {isEditing && (
                <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="p-4 sm:p-6 space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-secondary">Đổi mật khẩu đăng nhập</h3>
                            <p className="text-sm text-gray-500">
                                Để trống nếu bạn không muốn thay đổi mật khẩu.
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

            <div className="sticky bottom-3 sm:static">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-md sm:bg-transparent sm:border-0 sm:p-0 sm:shadow-none">
                    {isEditing ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="w-full sm:w-auto rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-600 transition hover:bg-gray-100"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="w-full sm:w-auto rounded-lg bg-primary px-4 py-2.5 font-semibold text-white transition hover:bg-orange-600"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="w-full sm:w-auto rounded-lg bg-primary px-4 py-2.5 font-semibold text-white transition hover:bg-orange-600"
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