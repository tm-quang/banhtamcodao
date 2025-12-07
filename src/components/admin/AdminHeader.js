// src/components/admin/AdminHeader.js
'use client';

import { useState } from 'react';
import {
    Search, Bell, User, ChevronDown, Menu as MenuIcon, X, Settings, LogOut,
    LayoutGrid, Package, FolderTree, Users, ShoppingCart, BarChart3,
    FileText, Ticket, PictureInPicture, FileEdit, HelpCircle, ExternalLink, Star
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Menu items matching Sidebar structure
const menuItems = [
    {
        title: 'TỔNG QUAN', items: [
            { href: '/admin', icon: LayoutGrid, label: 'Dashboard' },
            { href: '/admin/products', icon: Package, label: 'Quản lý món' },
            { href: '/admin/categories', icon: FolderTree, label: 'Danh mục' },
            { href: '/admin/customers', icon: Users, label: 'Khách hàng' },
            { href: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng' },
            { href: '/admin/reviews', icon: Star, label: 'Đánh giá' },
            { href: '/admin/statistics', icon: BarChart3, label: 'Thống kê' },
            { href: '/admin/reports', icon: FileText, label: 'Báo cáo' },
            { href: '/admin/promotions', icon: Ticket, label: 'Khuyến mãi' },
        ]
    },
    {
        title: 'CÀI ĐẶT', items: [
            { href: '/admin/content', icon: FileEdit, label: 'Nội dung' },
            { href: '/admin/banners', icon: PictureInPicture, label: 'Banner' },
            { href: '/admin/settings', icon: Settings, label: 'Cài đặt' },
            { href: '/admin/help', icon: HelpCircle, label: 'Trợ giúp' },
        ]
    }
];

export default function AdminHeader() {
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const isItemActive = (href) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    return (
        <>
            <header className="h-16 md:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 lg:px-8 flex-shrink-0">
                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all"
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-label="Mở menu"
                >
                    <MenuIcon size={20} className="text-gray-600" />
                </button>

                {/* Greeting - hidden on mobile */}
                <div className="hidden md:block">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                        Xin chào, <span className="text-green-600">Admin!</span>
                    </h1>
                </div>

                {/* Mobile Brand - shown on mobile */}
                <div className="md:hidden">
                    <h1 className="text-lg font-bold text-gray-900">Bánh Tầm Cô Đào</h1>
                </div>

                {/* Search Bar - hidden on small mobile */}
                <div className="hidden sm:flex flex-1 max-w-md mx-4 lg:mx-8">
                    <div className="relative w-full">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Tìm kiếm..."
                            className="w-full h-10 md:h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-full text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        />
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Notification */}
                    <button className="relative p-2 md:p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                        <Bell size={20} className="text-gray-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                                <span className="text-white font-bold text-sm md:text-base">A</span>
                            </div>
                            <ChevronDown
                                size={16}
                                className={`text-gray-400 transition-transform duration-200 hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsProfileOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="font-semibold text-gray-900">Admin</p>
                                        <p className="text-sm text-gray-500">admin@banhtamcodao.com</p>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            href="/admin/profile"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <User size={18} className="text-gray-400" />
                                            Thông tin tài khoản
                                        </Link>
                                        <Link
                                            href="/admin/settings"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <Settings size={18} className="text-gray-400" />
                                            Cài đặt
                                        </Link>
                                    </div>
                                    <div className="border-t border-gray-100 pt-1">
                                        <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                            <LogOut size={18} />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Menu Drawer */}
            <div
                className={`fixed inset-0 z-[200] ${isMobileMenuOpen ? '' : 'pointer-events-none'}`}
                aria-hidden={!isMobileMenuOpen}
            >
                {/* Overlay */}
                <div
                    className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
                {/* Panel */}
                <div
                    className={`absolute top-0 left-0 h-full w-80 max-w-[85%] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    role="dialog"
                    aria-label="Menu admin"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">B</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">BÁNH TẦM</h3>
                                <p className="text-xs text-gray-400">CÔ ĐÀO</p>
                            </div>
                        </div>
                        <button
                            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-label="Đóng menu"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 overflow-y-auto py-2">
                        {menuItems.map((section, sectionIdx) => (
                            <div key={sectionIdx}>
                                <h4 className="px-5 pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {section.title}
                                </h4>
                                <ul className="space-y-0.5">
                                    {section.items.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = isItemActive(item.href);
                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className={`flex items-center gap-3 mx-3 px-4 py-2.5 rounded-xl transition-colors ${isActive
                                                        ? 'bg-green-50 text-green-600 font-semibold'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <Icon size={20} className={isActive ? 'text-green-600' : 'text-gray-400'} />
                                                    <span className="text-sm">{item.label}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100">
                        <Link
                            href="/"
                            target="_blank"
                            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all text-sm font-medium"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <ExternalLink size={16} />
                            <span>Xem trang chủ</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}