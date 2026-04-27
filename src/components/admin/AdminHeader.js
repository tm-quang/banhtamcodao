// src/components/admin/AdminHeader.js
'use client';

import { useState } from 'react';
import {
    Search, Bell, User, ChevronDown, Menu as MenuIcon, X, Settings, LogOut,
    LayoutGrid, Package, FolderTree, Users, ShoppingCart, BarChart3,
    FileText, Ticket, PictureInPicture, FileEdit, HelpCircle, ExternalLink, Star, UserCog,
    Zap, Gift
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Menu items matching Sidebar structure
const menuItems = [
    {
        title: 'TỔNG QUAN',
        items: [
            { href: '/admin', icon: LayoutGrid, label: 'Dashboard' },
            { href: '/admin/orders', icon: ShoppingCart, label: 'Quản lý đơn hàng' },
        ]
    },
    {
        title: 'SẢN PHẨM',
        items: [
            {
                label: 'Danh mục & Thực đơn',
                icon: Package,
                submenu: [
                    { href: '/admin/categories', label: 'Danh mục món', icon: FolderTree },
                    { href: '/admin/products', label: 'Quản lý món', icon: Package },
                ]
            }
        ]
    },
    {
        title: 'KHÁCH HÀNG',
        items: [
            {
                label: 'Quản lý khách hàng',
                icon: Users,
                submenu: [
                    { href: '/admin/customer-groups', label: 'Nhóm khách hàng', icon: UserCog },
                    { href: '/admin/customers', label: 'Danh sách khách hàng', icon: Users },
                ]
            }
        ]
    },
    {
        title: 'TIẾP THỊ',
        items: [
            {
                label: 'Khuyến mãi',
                icon: Ticket,
                submenu: [
                    { href: '/admin/promotions', label: 'Khuyến mãi', icon: Ticket },
                    { href: '/admin/flash-sales', label: 'Flash Sale', icon: Zap },
                    { href: '/admin/combo-promotions', label: 'Combo', icon: Gift },
                ]
            }
        ]
    },
    {
        title: 'BÁO CÁO',
        items: [
            { href: '/admin/analytics', icon: BarChart3, label: 'Báo cáo & Thống kê' },
        ]
    },
    {
        title: 'NỘI DUNG',
        items: [
            {
                label: 'Quản lý nội dung',
                icon: FileEdit,
                submenu: [
                    { href: '/admin/reviews', label: 'Quản lý đánh giá', icon: Star },
                    { href: '/admin/content', label: 'Quản lý nội dung', icon: FileEdit },
                ]
            }
        ]
    },
    {
        title: 'HỆ THỐNG',
        items: [
            {
                label: 'Cài đặt website',
                icon: Settings,
                submenu: [
                    { href: '/admin/banners', label: 'Banner', icon: PictureInPicture },
                    { href: '/admin/help', label: 'Trợ giúp', icon: HelpCircle },
                    { href: '/admin/settings', label: 'Cài đặt', icon: Settings },
                ]
            }
        ]
    }
];

export default function AdminHeader() {
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [openSubmenu, setOpenSubmenu] = useState(null);

    const isItemActive = (href) => {
        if (href === '/admin') return pathname === '/admin';
        return href ? pathname.startsWith(href) : false;
    };

    return (
        <>
            <header className="h-16 md:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-2 md:px-4 lg:px-6 flex-shrink-0">
                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all"
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-label="Mở menu"
                >
                    <MenuIcon size={20} className="text-gray-600" />
                </button>

                <div className="hidden md:block">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                        Xin chào, <span className="text-blue-600">Admin!</span>
                    </h1>
                </div>

                <div className="md:hidden">
                    <img 
                        src="/images/banner-logo/banner-codao.png" 
                        alt="Bánh Tầm Cô Đào Logo" 
                        className="h-8 w-auto object-contain"
                    />
                </div>

                <div className="hidden sm:flex flex-1 max-w-md mx-4 lg:mx-8">
                    <div className="relative w-full">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder="Tìm kiếm..."
                            className="w-full h-10 md:h-11 pl-11 pr-4 bg-gray-50 border border-gray-200 rounded-full text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <button className="relative p-2 md:p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                        <Bell size={20} className="text-gray-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <span className="text-white font-bold text-sm md:text-base">A</span>
                            </div>
                            <ChevronDown
                                size={16}
                                className={`text-gray-400 transition-transform duration-200 hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

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
                <div
                    className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
                <div
                    className={`absolute top-0 left-0 h-full w-80 max-w-[85%] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    role="dialog"
                    aria-label="Menu admin"
                >
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <img 
                                src="/images/banner-logo/banner-codao.png" 
                                alt="Bánh Tầm Cô Đào Logo" 
                                className="h-10 w-auto object-contain"
                            />
                        </div>
                        <button
                            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-label="Đóng menu"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-2">
                        {menuItems.map((section, sectionIdx) => (
                            <div key={sectionIdx}>
                                <h4 className="px-5 pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {section.title}
                                </h4>
                                <ul className="space-y-0.5">
                                    {section.items.map((item, itemIdx) => {
                                        const Icon = item.icon;
                                        const isActive = isItemActive(item.href);
                                        const isOpen = openSubmenu === item.label;

                                        if (item.submenu) {
                                            return (
                                                <li key={itemIdx}>
                                                    <button
                                                        onClick={() => setOpenSubmenu(isOpen ? null : item.label)}
                                                        className={`flex items-center gap-3 mx-3 px-4 py-2.5 rounded-xl transition-colors ${isOpen
                                                            ? 'bg-blue-50 text-blue-900 font-semibold'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <Icon size={20} className={isOpen ? 'text-blue-600' : 'text-gray-400'} />
                                                        <span className="text-sm flex-1 text-left">{item.label}</span>
                                                        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    
                                                    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                                        <ul className="ml-12 space-y-1">
                                                            {item.submenu.map((sub, subIdx) => {
                                                                const isSubActive = pathname === sub.href;
                                                                const SubIcon = sub.icon;
                                                                return (
                                                                    <li key={subIdx}>
                                                                        <Link
                                                                            href={sub.href}
                                                                            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${isSubActive
                                                                                ? 'text-blue-600 font-bold bg-blue-50'
                                                                                : 'text-gray-500 hover:text-gray-800'
                                                                                }`}
                                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                                        >
                                                                            {SubIcon && <SubIcon size={16} className={isSubActive ? 'text-blue-600' : 'text-gray-400'} />}
                                                                            <span>{sub.label}</span>
                                                                        </Link>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                </li>
                                            );
                                        }

                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className={`flex items-center gap-3 mx-3 px-4 py-2.5 rounded-xl transition-colors ${isActive
                                                        ? 'bg-blue-50 text-blue-600 font-semibold'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <Icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
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
                            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all text-sm font-medium"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <ExternalLink size={16} />
                            <span>VỀ TRANG CHỦ</span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}