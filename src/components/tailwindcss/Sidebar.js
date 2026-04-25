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
            { href: '/admin/reviews', icon: Star, label: 'Đánh giá' },
            { href: '/admin/analytics', icon: BarChart3, label: 'Phân tích' },
            { href: '/admin/promotions', icon: Ticket, label: 'Khuyến mãi' },
            { href: '/admin/flash-sales', icon: Zap, label: 'Flash Sale' },
            { href: '/admin/combo-promotions', icon: Gift, label: 'Combo' },
        ]
    },
    {
        title: 'CÀI ĐẶT',
        items: [
            { href: '/admin/customer-groups', icon: UserCog, label: 'Nhóm khách hàng' },
            { href: '/admin/pages', icon: FileEdit, label: 'Nội dung' },
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
        ${noPadding ? '' : 'px-6 pt-5 pb-2'} text-xs font-bold uppercase tracking-wider
        flex items-center gap-2
        ${titleColor}
    `}>
        {Icon && <Icon size={14} />}
        {title}
    </h3>
);

export default function TailwindSidebar() {
    const pathname = usePathname();

    // Check if item is active
    const isItemActive = (href) => {
        if (href === '/admin') {
            return pathname === '/admin' || pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-52 h-screen bg-white border-r border-gray-200 flex flex-col hidden md:flex flex-shrink-0 shadow-lg">
            {/* Logo Header */}
            <div className="h-16 flex items-center px-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">
                            BÁNH TẰM
                        </h1>
                        <p className="text-xs text-gray-500 -mt-0.5 flex items-center gap-1">
                            <span>CÔ ĐÀO</span>
                            <span className="px-1.5 py-0.5 bg-red-600 text-white text-[11px] font-bold rounded-full">
                                ADMIN
                            </span>
                        </p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {menuSections.map((section, sectionIndex) => {
                    return (
                        <div key={sectionIndex}>
                            <SectionTitle
                                title={section.title}
                                icon={section.titleIcon}
                                titleColor={section.titleColor}
                            />

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
                    );
                })}
            </nav>

            {/* Footer - Visit Website & Info */}
            <div className="p-4 border-t border-gray-200 space-y-2 bg-gray-50">
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full bg-red-500 hover:bg-red-600 text-white hover:text-white transition-all text-sm font-medium border border-gray-200"
                >
                    <ExternalLink size={16} />
                    <span>Về trang chủ</span>
                </Link>

                {/* Info Badge */}
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

