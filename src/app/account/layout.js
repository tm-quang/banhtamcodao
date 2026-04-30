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
    <div className="min-h-screen pt-28 md:pt-36">
        <div className="mx-auto w-full max-w-[1100px] px-2 sm:px-6">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 px-1">
                    <div className="h-3 w-20 rounded bg-gray-100" />
                    <div className="h-8 w-48 rounded-lg bg-gray-100" />
                </div>
                <div className="rounded-2xl bg-white h-[500px] border border-gray-100 shadow-sm" />
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

    if (loading && !user) {
        return <AccountLayoutSkeleton />;
    }

    if (!user && !loading) {
        return null;
    }

    return (
        <div className="min-h-screen pt-28 md:pt-36 pb-10">
            <div className="mx-auto w-full max-w-[1100px] px-2 sm:px-6">
                <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-end justify-between px-2">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Thông tin tài khoản</span>
                            <h1 className="text-2xl sm:text-3xl font-medium text-secondary font-lobster tracking-tight">
                                Xin chào, {user.full_name?.split(' ').slice(-2).join(' ') || 'Nhật Minh'}!
                            </h1>
                        </div>
                    </div>

                    {/* Main Container */}
                    <div className="rounded-2xl bg-white shadow-md border border-gray-300 overflow-hidden">
                        {/* Desktop & Mobile Navigation */}
                        <div className="border-b border-gray-100/80 bg-gray-50/30">
                            {/* Desktop Tabs */}
                            <div className="hidden sm:block px-8 py-5">
                                <nav className="flex items-center gap-3">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = pathname.startsWith(tab.href);
                                        return (
                                            <Link
                                                key={tab.name}
                                                href={tab.href}
                                                className={`group relative flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${isActive
                                                    ? 'bg-primary text-white shadow-sm'
                                                    : 'text-gray-500 hover:text-primary'
                                                    }`}
                                            >
                                                <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'} />
                                                {tab.short}
                                            </Link>
                                        );
                                    })}

                                    {/* Logout Button */}
                                    <button
                                        onClick={handleLogout}
                                        className="ml-auto group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all duration-300"
                                    >
                                        <LogOut size={18} />
                                        <span>Thoát</span>
                                    </button>
                                </nav>
                            </div>

                            {/* Mobile Navigation Dropdown */}
                            <div className="sm:hidden relative">
                                <button
                                    type="button"
                                    onClick={() => setMobileTabsOpen((prev) => !prev)}
                                    className="flex w-full items-center justify-between px-3 py-3 rounded-2xl bg-white border border-gray-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-primary shadow-sm border border-orange-100/50">
                                            {activeTab.icon && <activeTab.icon size={20} />}
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 leading-none mb-1">Đang chọn chức năng</span>
                                            <span className="text-md font-bold text-secondary leading-none">{activeTab.name}</span>
                                        </div>
                                    </div>
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${mobileTabsOpen ? 'bg-primary text-white rotate-180' : 'bg-gray-50 text-gray-400'}`}>
                                        <ChevronDown size={18} strokeWidth={2.5} />
                                    </div>
                                </button>

                                {mobileTabsOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10 bg-black/5"
                                            onClick={() => setMobileTabsOpen(false)}
                                        />
                                        <div className="absolute top-full left-0 right-0 z-20 mt-2 p-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
                                            <div className="space-y-1">
                                                {tabs.map((tab) => {
                                                    const Icon = tab.icon;
                                                    const isActive = pathname.startsWith(tab.href);
                                                    return (
                                                        <Link
                                                            key={tab.name}
                                                            href={tab.href}
                                                            onClick={() => setMobileTabsOpen(false)}
                                                            className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all ${isActive
                                                                ? 'bg-orange-50/70 text-primary shadow-sm ring-1 ring-orange-100'
                                                                : 'text-gray-600 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isActive ? 'bg-white shadow-sm border border-orange-100/50' : 'bg-gray-50'}`}>
                                                                <Icon size={18} className={isActive ? 'text-primary' : 'text-gray-400'} />
                                                            </div>
                                                            <span className={`text-sm font-bold ${isActive ? 'text-primary' : 'text-gray-700'}`}>{tab.name}</span>
                                                        </Link>
                                                    );
                                                })}
                                                <div className="mx-2 my-1.5 h-px bg-gray-100" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
                                                >
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50/50">
                                                        <LogOut size={18} />
                                                    </div>
                                                    Đăng xuất tài khoản
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-4 sm:p-8 bg-white">
                            {children}
                        </div>
                    </div>

                    {/* Footer Info / Support */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 text-center sm:text-left">
                        <p className="text-sm text-gray-400">
                            Bạn cần hỗ trợ? <Link href="/contact" className="text-primary font-bold hover:underline">Liên hệ chúng tôi</Link>
                        </p>
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <span>Bảo mật</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span>Điều khoản</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
