/**
 * Sidebar component với Tailwind CSS
 * Bao gồm cả link đến các trang MUI và Tailwind mới
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid, Package, FolderTree, Users, ShoppingCart,
    BarChart3, FileText, Ticket, PictureInPicture,
    FileEdit, Settings, HelpCircle, ExternalLink, Star,
    Zap, Gift, UserCog, Sparkles
} from 'lucide-react';

// Menu structure with groups
const menuSections = [
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

import { ChevronDown, ChevronRight } from 'lucide-react';

// NavItem component
const NavItem = ({ item, isActive, pathname, isOpen, onToggle }) => {
    const Icon = item.icon;

    if (item.submenu) {
        return (
            <li>
                <button
                    onClick={onToggle}
                    className={`
                        flex items-center gap-3 px-4 py-2.5 mx-3 rounded-xl cursor-pointer 
                        transition-all duration-200 flex-1
                        ${isOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}
                    `}
                >
                    <Icon
                        size={20}
                        className={`transition-colors flex-shrink-0 ${isOpen ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                    />
                    <span className="text-sm flex-1 text-left font-medium">{item.label}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                    <ul className="ml-9 space-y-1 pr-3">
                        {item.submenu.map((sub) => {
                            const isSubActive = pathname === sub.href;
                            const SubIcon = sub.icon;
                            return (
                                <li key={sub.href}>
                                    <Link
                                        href={sub.href}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] transition-all
                                            ${isSubActive
                                                ? 'bg-blue-100 text-blue-700 font-bold'
                                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                                            }
                                        `}
                                    >
                                        {SubIcon && <SubIcon size={16} className={isSubActive ? 'text-blue-700' : 'text-gray-400'} />}
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
        <li>
            <Link
                href={item.href}
                className={`
                    group relative flex items-center gap-3 px-4 py-2.5 mx-3 rounded-xl cursor-pointer 
                    transition-all duration-200
                    ${isActive
                        ? 'bg-blue-200 text-blue-600 font-semibold shadow-sm'
                        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }
                `}
            >
                <Icon
                    size={20}
                    className={`transition-colors flex-shrink-0 ${isActive
                        ? 'text-blue-600'
                        : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                />
                <span className="text-sm flex-1">{item.label}</span>
                {item.badge && (
                    <span className={`
                        px-2 py-0.5 text-xs font-bold rounded-lg text-white
                        ${item.badgeColor || 'bg-green-500'}
                    `}>
                        {item.badge}
                    </span>
                )}
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                )}
            </Link>
        </li>
    );
};

// Section Title với icon tùy chọn
const SectionTitle = ({ title, icon: Icon, titleColor = 'text-gray-400', noPadding = false }) => (
    <h3 className={`
        ${noPadding ? '' : 'px-6 pt-5 pb-2'} text-[10px] font-black uppercase tracking-[0.15em]
        flex items-center gap-2
        ${titleColor}
    `}>
        {Icon && <Icon size={14} />}
        {title}
    </h3>
);

import React from 'react';

export default function TailwindSidebar() {
    const pathname = usePathname();
    const [openSubmenu, setOpenSubmenu] = React.useState(null);

    // Check if item is active
    const isItemActive = (href) => {
        if (!href) return false;
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col hidden md:flex flex-shrink-0 shadow-lg">
            {/* Logo Header */}
            <div className="h-20 flex items-center px-4 border-b border-gray-100 bg-white">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="relative w-45 h-25 transition-transform duration-300 group-hover:scale-105">
                        <img
                            src="/images/banner-logo/banner-codao.png"
                            alt="Bánh Tầm Cô Đào Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                {menuSections.map((section, sectionIndex) => {
                    return (
                        <div key={sectionIndex} className="mb-4">
                            <SectionTitle
                                title={section.title}
                                icon={section.titleIcon}
                                titleColor={section.titleColor}
                            />

                            <ul className="space-y-1">
                                {section.items.map((item, idx) => (
                                    <NavItem
                                        key={item.href || idx || item.label}
                                        item={item}
                                        isActive={isItemActive(item.href)}
                                        pathname={pathname}
                                        isOpen={openSubmenu === item.label}
                                        onToggle={() => setOpenSubmenu(openSubmenu === item.label ? null : item.label)}
                                    />
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </nav>

            {/* Footer - Visit Website & Info */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all text-xs font-bold shadow-sm"
                >
                    <ExternalLink size={14} />
                    <span>VỀ TRANG CHỦ</span>
                </Link>
            </div>
        </aside>
    );
}


