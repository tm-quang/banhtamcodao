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

// Menu structure với 3 sections
const menuSections = [
    {
        title: 'TỔNG QUAN',
        items: [
            { href: '/admin', icon: LayoutGrid, label: 'Dashboard' },
            { href: '/admin/products', icon: Package, label: 'Quản lý món' },
            { href: '/admin/categories', icon: FolderTree, label: 'Danh mục' },
            { href: '/admin/customers', icon: Users, label: 'Khách hàng' },
            { href: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng' },
            { href: '/admin/analytics', icon: BarChart3, label: 'Phân tích' },
            { href: '/admin/promotions', icon: Ticket, label: 'Khuyến mãi' },
            { href: '/admin/flash-sales', icon: Zap, label: 'Flash Sale' },
            { href: '/admin/combo-promotions', icon: Gift, label: 'Combo' },
        ]
    },
    {
        title: 'NỘI DUNG, PHẢN HỒI',
        items: [
            {
                label: 'Quản lý chung',
                icon: FileEdit,
                submenu: [
                    { href: '/admin/reviews', label: 'Quản lý đánh giá' },
                    { href: '/admin/content', label: 'Quản lý nội dung' },
                ]
            }
        ]
    },
    {
        title: 'CÀI ĐẶT',
        items: [
            { href: '/admin/customer-groups', icon: UserCog, label: 'Nhóm khách hàng' },
            { href: '/admin/banners', icon: PictureInPicture, label: 'Banner' },
            { href: '/admin/settings', icon: Settings, label: 'Cài đặt' },
            { href: '/admin/help', icon: HelpCircle, label: 'Trợ giúp' },
        ]
    }
];

import { ChevronDown, ChevronRight } from 'lucide-react';

// NavItem component
const NavItem = ({ item, isActive, pathname }) => {
    const [isOpen, setIsOpen] = React.useState(isActive || (item.submenu && item.submenu.some(sub => pathname.startsWith(sub.href))));
    const Icon = item.icon;

    if (item.submenu) {
        return (
            <li>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        w-full group relative flex items-center gap-3 px-4 py-2.5 mx-3 rounded-xl cursor-pointer 
                        transition-all duration-200
                        ${isOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}
                    `}
                >
                    <Icon
                        size={20}
                        className={`transition-colors flex-shrink-0 ${isOpen ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                    />
                    <span className="text-sm flex-1 text-left font-medium">{item.label}</span>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                
                {isOpen && (
                    <ul className="mt-1 ml-9 space-y-1 pr-3">
                        {item.submenu.map((sub) => {
                            const isSubActive = pathname.startsWith(sub.href);
                            return (
                                <li key={sub.href}>
                                    <Link
                                        href={sub.href}
                                        className={`
                                            block px-4 py-2 rounded-lg text-[13px] transition-all
                                            ${isSubActive 
                                                ? 'bg-blue-100 text-blue-700 font-bold' 
                                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                                            }
                                        `}
                                    >
                                        {sub.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
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

    // Check if item is active
    const isItemActive = (href) => {
        if (!href) return false;
        if (href === '/admin') {
            return pathname === '/admin' || pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-56 h-screen bg-white border-r border-gray-200 flex flex-col hidden md:flex flex-shrink-0 shadow-lg">
            {/* Logo Header */}
            <div className="h-20 flex items-center px-6 border-b border-gray-100 bg-white">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all transform group-hover:scale-105">
                        <Sparkles size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 tracking-tighter leading-none">
                            CÔ ĐÀO
                        </h1>
                        <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1 flex items-center gap-1 uppercase">
                            <span>Admin Panel</span>
                            <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></span>
                        </p>
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
                                        key={item.href || idx}
                                        item={item}
                                        isActive={isItemActive(item.href)}
                                        pathname={pathname}
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
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gray-900 hover:bg-black text-white transition-all text-xs font-bold shadow-sm"
                >
                    <ExternalLink size={14} />
                    <span>XEM WEBSITE</span>
                </Link>
            </div>
        </aside>
    );
}


