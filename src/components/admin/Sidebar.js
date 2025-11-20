// src/components/admin/Sidebar.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    Home, Package, ShoppingCart, Users, Star, Ticket,
    PictureInPicture, Settings, ChevronDown, List, LayoutGrid, Tags, Palette, Ruler
} from 'lucide-react';

const navItems = [
    { label: "QUẢN LÝ NỘI DUNG", isTitle: true },
    { href: '/admin', icon: <Home size={20} />, label: 'Tổng quan' },
    {
        icon: <Package size={20} />, label: 'Quản lý sản phẩm',
        subItems: [
            { href: '/admin/products', icon: <List size={18} />, label: 'Danh sách sản phẩm' },
            { href: '/admin/categories', icon: <LayoutGrid size={18} />, label: 'Danh mục' },
        ]
    },
    { href: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Quản lý đơn hàng' },
    {
        icon: <Users size={20} />, label: 'Quản lý khách hàng',
        // --- SỬA LỖI TẠI ĐÂY ---
        subItems: [
            { href: '/admin/customers', icon: <List size={18} />, label: 'Danh sách khách hàng' },
            { href: '#', icon: <Users size={18} />, label: 'Nhóm khách hàng' },
        ]
    },
    { href: '/admin/reviews', icon: <Star size={20} />, label: 'Quản lý đánh giá' },
    { label: "CÀI ĐẶT WEBSITE", isTitle: true },
    { href: '/admin/promotions', icon: <Ticket size={20} />, label: 'Quản lý khuyến mãi' },
    { href: '/admin/banners', icon: <PictureInPicture size={20} />, label: 'Cài đặt Banner' },
    { href: '/admin/settings', icon: <Settings size={20} />, label: 'Cài đặt chung' },
];

const NavItem = ({ item }) => {
    const pathname = usePathname();
    // Logic kiểm tra active cho cả mục cha và mục con
    const isActive = item.href === pathname || item.subItems?.some(sub => pathname.startsWith(sub.href));
    const [isOpen, setIsOpen] = useState(isActive);

    const hasSubItems = item.subItems && item.subItems.length > 0;

    if (item.isTitle) {
        return <h3 className="px-4 pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</h3>;
    }

    const effectiveHref = hasSubItems ? '#' : item.href;
    const LinkComponent = hasSubItems ? 'div' : Link;

    return (
        <li>
            <LinkComponent
                href={effectiveHref}
                onClick={(e) => {
                    if (hasSubItems) {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    }
                }}
                className={`flex items-center justify-between p-3 mx-2 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
            >
                <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                </div>
                {hasSubItems && <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
            </LinkComponent>
            {hasSubItems && isOpen && (
                <ul className="pl-8 py-1 space-y-1">
                    {item.subItems.map(subItem => (
                        <li key={subItem.href}>
                            <Link href={subItem.href} className={`flex items-center gap-3 text-sm p-2 rounded-md ${pathname === subItem.href ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'}`}>
                                {subItem.icon}
                                <span>{subItem.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
};


export default function Sidebar() {
    return (
        <aside className="w-64 bg-gray-800 text-light flex-col hidden md:flex flex-shrink-0">
            <div className="h-16 flex items-center justify-center border-b border-gray-700">
                <h1 className="text-2xl font-bold tracking-widest text-white">ADMIN</h1>
            </div>
            <nav className="flex-grow pt-2 overflow-y-auto">
                <ul className="space-y-1">
                    {navItems.map((item, index) => (
                        <NavItem key={index} item={item} />
                    ))}
                </ul>
            </nav>
            <div className="p-4 text-xs text-center text-gray-500 border-t border-gray-700">
                Phiên bản V01.25
            </div>
        </aside>
    );
}