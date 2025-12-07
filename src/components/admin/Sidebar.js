// src/components/admin/Sidebar.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    LayoutGrid, Package, FolderTree, Users, ShoppingCart,
    User, BarChart3, FileText, Ticket, PictureInPicture,
    FileEdit, Settings, HelpCircle, ChevronDown, ExternalLink, Star, Zap
} from 'lucide-react';

// Menu structure với 2 section chính
const menuSections = [
    {
        title: 'TỔNG QUAN',
        items: [
            { href: '/admin', icon: LayoutGrid, label: 'Dashboard' },
            { href: '/admin/products', icon: Package, label: 'Quản lý món' },
            { href: '/admin/categories', icon: FolderTree, label: 'Danh mục' },
            { href: '/admin/customers', icon: Users, label: 'Khách hàng' },
            { href: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng' },
            { href: '/admin/reviews', icon: Star, label: 'Đánh giá' },
            { href: '/admin/statistics', icon: BarChart3, label: 'Thống kê' },
            { href: '/admin/reports', icon: FileText, label: 'Báo cáo' },
            { href: '/admin/promotions', icon: Ticket, label: 'Khuyến mãi' },
            { href: '/admin/flash-sales', icon: Zap, label: 'Flash Sale' },
        ]
    },
    {
        title: 'CÀI ĐẶT',
        items: [
            { href: '/admin/content', icon: FileEdit, label: 'Nội dung' },
            { href: '/admin/banners', icon: PictureInPicture, label: 'Banner' },
            { href: '/admin/settings', icon: Settings, label: 'Cài đặt' },
            { href: '/admin/help', icon: HelpCircle, label: 'Trợ giúp' },
        ]
    }
];

// NavItem component
const NavItem = ({ item, isActive }) => {
    const Icon = item.icon;

    return (
        <li>
            <Link
                href={item.href}
                className={`
                    flex items-center gap-3 px-4 py-2.5 mx-3 rounded-xl cursor-pointer 
                    transition-all duration-200 group
                    ${isActive
                        ? 'bg-green-50 text-green-600 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                `}
            >
                <Icon
                    size={20}
                    className={`transition-colors ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                />
                <span className="text-sm">{item.label}</span>
            </Link>
        </li>
    );
};

// Section Title
const SectionTitle = ({ title }) => (
    <h3 className="px-6 pt-5 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
        {title}
    </h3>
);

export default function Sidebar() {
    const pathname = usePathname();

    // Check if item is active
    const isItemActive = (href) => {
        if (href === '/admin') {
            return pathname === '/admin' || pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-72 h-screen bg-white border-r border-gray-100 flex flex-col hidden md:flex flex-shrink-0 shadow-sm">
            {/* Logo Header */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                        <span className="text-white font-bold text-lg">B</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">BÁNH TẦM</h1>
                        <p className="text-xs text-gray-400 -mt-0.5">CÔ ĐÀO</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-2">
                {menuSections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                        <SectionTitle title={section.title} />
                        <ul className="space-y-0.5">
                            {section.items.map((item) => (
                                <NavItem
                                    key={item.href}
                                    item={item}
                                    isActive={isItemActive(item.href)}
                                />
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer - Visit Website */}
            <div className="p-4 border-t border-gray-100">
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all text-sm font-medium"
                >
                    <ExternalLink size={16} />
                    <span>Xem trang chủ</span>
                </Link>
            </div>
        </aside>
    );
}