// src/app/account/layout.js
'use client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, History, Ticket, Settings, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

const tabs = [
    { name: 'Thông tin tài khoản', short: 'Thông tin tài khoản', href: '/account/profile', icon: User },
    { name: 'Lịch sử đơn hàng', short: 'Lịch sử đơn hàng', href: '/account/orders', icon: History },
    { name: 'Khuyến mãi, tích điểm', short: 'Khuyến mãi, tích điểm', href: '/account/rewards', icon: Ticket },
    // { name: 'Cài đặt tài khoản', short: 'Cài đặt tài khoản', href: '/account/settings', icon: Settings },
];

const AccountLayoutSkeleton = () => (
    <div className="bg-slate-50 min-h-screen pt-24 pb-10">
        <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 animate-pulse">
            <div className="flex flex-col gap-2">
                <div className="h-4 w-40 rounded bg-slate-200" />
                <div className="h-8 w-64 rounded bg-slate-300" />
            </div>

            <div className="mt-6 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <div className="border-b border-slate-100 px-6 py-4">
                    <div className="h-10 w-full rounded-full bg-slate-200" />
                </div>
                <div className="space-y-4 px-4 py-6 sm:px-8">
                    <div className="h-6 w-40 rounded bg-slate-200" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="h-32 rounded-2xl bg-slate-100" />
                        <div className="h-32 rounded-2xl bg-slate-100" />
                    </div>
                    <div className="h-64 rounded-2xl bg-slate-100" />
                </div>
            </div>
        </div>
    </div>
);

export default function AccountLayout({ children }) {
    const { user, loading } = useAuth();
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

    if (loading) {
        return <AccountLayoutSkeleton />;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="bg-slate-50 min-h-screen pt-24 pb-10">
            <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-6">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-base font-medium font text-slate-500">THÔNG TIN TÀI KHOẢN</span>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Xin chào: {user.full_name}
                        </h1>
                    </div>

                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                        <div className="border-b border-slate-100">
                            <div className="hidden overflow-x-auto px-6 py-2 sm:block">
                                <nav className="flex gap-2">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = pathname.startsWith(tab.href);
                                        return (
                                            <Link
                                                key={tab.name}
                                                href={tab.href}
                                                className={`group relative flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                                                    isActive
                                                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                                }`}
                                            >
                                                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                                                {tab.name}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>

                            <div className="sm:hidden">
                                <button
                                    type="button"
                                    onClick={() => setMobileTabsOpen((prev) => !prev)}
                                    className="flex w-full items-center justify-between px-4 py-3 text-lg font-medium text-slate-700"
                                >
                                    <span className="flex items-center gap-2">
                                        {activeTab.icon && <activeTab.icon size={18} />}
                                        {activeTab.short}
                                    </span>
                                    <ChevronDown className={`transition ${mobileTabsOpen ? 'rotate-180' : ''}`} size={18} />
                                </button>
                                {mobileTabsOpen && (
                                    <div className="border-t border-slate-100">
                                        {tabs.map((tab) => {
                                            const Icon = tab.icon;
                                            const isActive = pathname.startsWith(tab.href);
                                            return (
                                                <Link
                                                    key={tab.name}
                                                    href={tab.href}
                                                    onClick={() => setMobileTabsOpen(false)}
                                                    className={`flex items-center justify-between px-4 py-3 text-lg ${
                                                        isActive
                                                            ? 'font-semibold text-slate-900'
                                                            : 'text-slate-500 hover:text-slate-900'
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <Icon size={18} />
                                                        {tab.short}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-4 py-5 sm:px-8 sm:py-7 bg-gradient-to-b from-white via-white to-slate-50/60 rounded-b-2xl">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}