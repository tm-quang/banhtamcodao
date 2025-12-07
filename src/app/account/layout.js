/**
 * Account layout component - Enhanced UI
 * @file src/app/account/layout.js
 */
'use client';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, History, Ticket, ChevronDown, LogOut } from 'lucide-react';

const tabs = [
    { name: 'Thông tin tài khoản', short: 'Tài khoản', href: '/account/profile', icon: User },
    { name: 'Lịch sử đơn hàng', short: 'Đơn hàng', href: '/account/orders', icon: History },
    { name: 'Khuyến mãi & Tích điểm', short: 'Ưu đãi', href: '/account/rewards', icon: Ticket },
];

const AccountLayoutSkeleton = () => (
    <div className="min-h-screen pt-20 pb-10">
        <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6">
            <div className="flex flex-col gap-2 mb-6">
                <div className="h-4 w-32 rounded-lg shimmer" />
                <div className="h-8 w-64 rounded-lg shimmer" />
            </div>

            <div className="rounded-3xl bg-white shadow-sm border border-gray-100">
                <div className="border-b border-gray-100 px-6 py-4">
                    <div className="h-12 w-full rounded-2xl shimmer" />
                </div>
                <div className="space-y-4 p-6">
                    <div className="h-48 rounded-2xl shimmer" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-2xl shimmer" />)}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default function AccountLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileTabsOpen, setMobileTabsOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, router]);

    const activeTab = useMemo(
        () => tabs.find((tab) => pathname.startsWith(tab.href)) || tabs[0],
        [pathname]
    );

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (loading) {
        return <AccountLayoutSkeleton />;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen pt-20 pb-24 sm:pb-10">
            <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6">
                <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-end justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-gray-500">Quản lý tài khoản</span>
                            <h1 className="text-2xl sm:text-3xl font-medium text-secondary font-lobster">
                                Xin chào, {user.full_name?.split(' ').slice(-2).join(' ') || 'Khách hàng'}!
                            </h1>
                        </div>
                    </div>

                    {/* Main Container */}
                    <div className="rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                        {/* Desktop Tabs */}
                        <div className="border-b border-gray-100">
                            <div className="hidden sm:block px-6 py-3">
                                <nav className="flex items-center gap-2">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = pathname.startsWith(tab.href);
                                        return (
                                            <Link
                                                key={tab.name}
                                                href={tab.href}
                                                className={`group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${isActive
                                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                    : 'text-gray-500 hover:text-primary hover:bg-primary/5'
                                                    }`}
                                            >
                                                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'} />
                                                {tab.name}
                                            </Link>
                                        );
                                    })}

                                    {/* Mobile Logout in Tabs */}
                                    <button
                                        onClick={handleLogout}
                                        className="bg-rose-50 text-rose-600 ml-auto flex items-center gap-2 px-4 py-2.5 rounded-3xl text-sm font-medium hover:text-rose-600 hover:bg-rose-200 transition-colors"
                                    >
                                        <LogOut size={18} />
                                        <span className="hidden lg:inline">Đăng xuất</span>
                                    </button>
                                </nav>
                            </div>

                            {/* Mobile Tabs Dropdown */}
                            <div className="sm:hidden">
                                <button
                                    type="button"
                                    onClick={() => setMobileTabsOpen((prev) => !prev)}
                                    className="flex w-full items-center justify-between px-5 py-4 text-base font-semibold text-secondary"
                                >
                                    <span className="flex items-center gap-3">
                                        {activeTab.icon && <activeTab.icon size={20} className="text-primary" />}
                                        {activeTab.short}
                                    </span>
                                    <ChevronDown className={`text-gray-400 transition-transform ${mobileTabsOpen ? 'rotate-180' : ''}`} size={20} />
                                </button>

                                {mobileTabsOpen && (
                                    <div className="border-t border-gray-100 bg-gray-50/50">
                                        {tabs.map((tab) => {
                                            const Icon = tab.icon;
                                            const isActive = pathname.startsWith(tab.href);
                                            return (
                                                <Link
                                                    key={tab.name}
                                                    href={tab.href}
                                                    onClick={() => setMobileTabsOpen(false)}
                                                    className={`flex items-center gap-3 px-5 py-3.5 text-base border-b border-gray-100 last:border-b-0 ${isActive
                                                        ? 'font-semibold text-primary bg-primary/5'
                                                        : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                                                        }`}
                                                >
                                                    <Icon size={20} className={isActive ? 'text-primary' : 'text-gray-400'} />
                                                    {tab.name}
                                                </Link>
                                            );
                                        })}

                                        {/* Mobile Logout */}
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-3 px-5 py-3.5 text-base text-rose-600 hover:bg-rose-50"
                                        >
                                            <LogOut size={20} />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 sm:p-8">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}