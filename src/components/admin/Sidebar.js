// src/components/admin/Sidebar.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    LayoutGrid, Package, FolderTree, Users, ShoppingCart,
    User, BarChart3, FileText, Ticket, PictureInPicture,
    FileEdit, Settings, HelpCircle, ChevronDown, ExternalLink, Star, Zap, Gift, UserCog, Sparkles, ChevronRight
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
            { href: '/admin/reviews', icon: Star, label: 'Đánh giá' },
            { href: '/admin/statistics', icon: BarChart3, label: 'Thống kê' },
            { href: '/admin/reports', icon: FileText, label: 'Báo cáo' },
            { href: '/admin/promotions', icon: Ticket, label: 'Khuyến mãi' },
            { href: '/admin/flash-sales', icon: Zap, label: 'Flash Sale' },
            { href: '/admin/combo-promotions', icon: Gift, label: 'Combo' },
        ]
    },
    {
        title: 'CÀI ĐẶT',
        items: [
            { href: '/admin/customer-groups', icon: UserCog, label: 'Nhóm khách hàng' },
            { href: '/admin/content', icon: FileEdit, label: 'Nội dung' },
            { href: '/admin/banners', icon: PictureInPicture, label: 'Banner' },
            { href: '/admin/settings', icon: Settings, label: 'Cài đặt' },
            { href: '/admin/help', icon: HelpCircle, label: 'Trợ giúp' },
        ]
    },
    {
        title: 'TAILWIND CSS VERSION',
        titleIcon: Sparkles,
        titleColor: 'text-purple-600',
        collapsible: true,
        items: [
            {
                href: '/admin/tw/categories',
                icon: FolderTree,
                label: 'Danh mục (TW)',
                badge: 'NEW',
                badgeColor: 'bg-purple-500'
            },
            {
                href: '/admin/tw/customers',
                icon: Users,
                label: 'Khách hàng (TW)',
                badge: 'NEW',
                badgeColor: 'bg-purple-500'
            },
            {
                href: '/admin/tw/products',
                icon: Package,
                label: 'Quản lý món (TW)',
                badge: 'NEW',
                badgeColor: 'bg-purple-500'
            },
            {
                href: '/admin/tw/orders',
                icon: ShoppingCart,
                label: 'Đơn hàng (TW)',
                badge: 'NEW',
                badgeColor: 'bg-purple-500'
            },
            {
                href: '/admin/tw/reviews',
                icon: Star,
                label: 'Đánh giá (TW)',
                badge: 'NEW',
                badgeColor: 'bg-purple-500'
            },
            {
                href: '/admin/tw/banners',
                icon: PictureInPicture,
                label: 'Banner (TW)',
                badge: 'NEW',
                badgeColor: 'bg-purple-500'
            },
            {
                href: '/admin/tw/promotions',
                icon: Ticket,
                label: 'Khuyến mãi (TW)',
                badge: 'NEW',
                badgeColor: 'bg-purple-500'
            },
            {
                href: '/admin/tw/flash-sales',
                icon: Zap,
                label: 'Flash Sale (TW)',
                badge: 'NEW',
                badgeColor: 'bg-purple-500'
            },
            {
                href: '/admin/tw/combo-promotions',
                icon: Gift,
                label: 'Combo (TW)',
                badge: 'NEW',
                badgeColor: 'bg-purple-500'
            },
            {
                href: '/admin/tw/customer-groups',
                icon: UserCog,
                label: 'Nhóm khách hàng (TW)',
                badge: 'NEW',
                badgeColor: 'bg-purple-500'
            },
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
                    group relative flex items-center gap-3 px-4 py-2.5 mx-3 rounded-xl cursor-pointer 
                    transition-all duration-200
                    ${isActive
                        ? 'bg-green-50 text-green-600 font-semibold shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                `}
            >
                <Icon
                    size={20}
                    className={`transition-colors flex-shrink-0 ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                />
                <span className="text-sm flex-1">{item.label}</span>
                {item.badge && (
                    <span className={`
                        px-2 py-0.5 text-xs font-bold rounded-full text-white
                        ${item.badgeColor || 'bg-green-500'}
                    `}>
                        {item.badge}
                    </span>
                )}
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-600 rounded-r-full" />
                )}
            </Link>
        </li>
    );
};

// Section Title với icon tùy chọn
const SectionTitle = ({ title, icon: Icon, titleColor = 'text-gray-400', collapsible = false, isExpanded = true, onToggle }) => {
    if (collapsible) {
        return (
            <button
                onClick={onToggle}
                className={`w-full px-6 pt-5 pb-2 flex items-center justify-between group hover:bg-gray-50/50 rounded-lg transition-colors`}
            >
                <h3 className={`
                    text-xs font-bold uppercase tracking-wider flex items-center gap-2
                    ${titleColor}
                `}>
                    {Icon && <Icon size={14} />}
                    {title}
                </h3>
                {isExpanded ? (
                    <ChevronDown size={14} className={titleColor} />
                ) : (
                    <ChevronRight size={14} className={titleColor} />
                )}
            </button>
        );
    }

    return (
        <h3 className={`
            px-6 pt-5 pb-2 text-xs font-bold uppercase tracking-wider
            flex items-center gap-2
            ${titleColor}
        `}>
            {Icon && <Icon size={14} />}
            {title}
        </h3>
    );
};

export default function Sidebar() {
    const pathname = usePathname();
    const [expandedSections, setExpandedSections] = useState({
        tailwind: true, // Mặc định mở section Tailwind
    });

    // Check if item is active
    const isItemActive = (href) => {
        if (href === '/admin') {
            return pathname === '/admin' || pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    const toggleSection = (sectionKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

    return (
        <aside className="w-72 h-screen bg-white border-r border-gray-100 flex flex-col hidden md:flex flex-shrink-0 shadow-sm">
            {/* Logo Header */}
            <div className="h-16 flex items-center px-6 border-b border-gray-100">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">B</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">BÁNH TẦM</h1>
                        <p className="text-xs text-gray-400 -mt-0.5">CÔ ĐÀO</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {menuSections.map((section, sectionIndex) => {
                    const isTailwindSection = section.title === 'TAILWIND CSS VERSION';
                    const sectionKey = isTailwindSection ? 'tailwind' : sectionIndex;
                    const isExpanded = expandedSections[sectionKey] !== false;

                    return (
                        <div key={sectionIndex}>
                            <SectionTitle
                                title={section.title}
                                icon={section.titleIcon}
                                titleColor={section.titleColor}
                                collapsible={section.collapsible}
                                isExpanded={isExpanded}
                                onToggle={() => toggleSection(sectionKey)}
                            />
                            {isExpanded && (
                                <ul className="space-y-0.5">
                                    {section.items.map((item) => (
                                        <NavItem
                                            key={item.href}
                                            item={item}
                                            isActive={isItemActive(item.href)}
                                        />
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer - Visit Website & Info */}
            <div className="p-4 border-t border-gray-100 space-y-2">
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all text-sm font-medium"
                >
                    <ExternalLink size={16} />
                    <span>Xem trang chủ</span>
                </Link>

                {/* Info Badge cho Tailwind */}
                {/* <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 border border-purple-200">
                    <Sparkles size={14} className="text-purple-600 flex-shrink-0" />
                    <p className="text-xs text-purple-700 font-medium">
                        Trang Tailwind CSS đang được phát triển
                    </p>
                </div> */}
            </div>
        </aside>
    );
}