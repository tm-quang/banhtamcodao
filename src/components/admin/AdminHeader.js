// src/components/admin/AdminHeader.js
'use client';

import { TextField, InputAdornment, IconButton, Badge, Avatar, Menu, MenuItem } from '@mui/material';
import { Search, Bell, Moon, Sun, Settings, Ticket, PictureInPicture, Menu as MenuIcon, X } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function AdminHeader() {
    // State cho dark mode (ví dụ)
    const [darkMode, setDarkMode] = React.useState(false);
    
    // State cho menu tài khoản
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    // State cho mobile admin settings menu
    const [isMobileSettingsOpen, setIsMobileSettingsOpen] = React.useState(false);

    return (
        <>
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-6 flex-shrink-0">
            {/* Nút mở menu cài đặt (Mobile) */}
            <button
                className="md:hidden p-2 rounded-md border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition"
                onClick={() => setIsMobileSettingsOpen(true)}
                aria-label="Mở menu cài đặt admin"
            >
                <MenuIcon size={20} />
            </button>

            {/* Thanh tìm kiếm */}
            <div className="w-1/2 md:w-1/3 max-w-md hidden sm:block">
                 <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Tìm kiếm sản phẩm, đơn hàng..."
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={20} color="gray" />
                            </InputAdornment>
                        ),
                    }}
                />
            </div>

            {/* Các icon chức năng */}
            <div className="flex items-center gap-2 md:gap-4">
                <IconButton onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </IconButton>
                <IconButton>
                    <Badge badgeContent={4} color="error">
                        <Bell size={20} />
                    </Badge>
                </IconButton>

                {/* Tài khoản Admin */}
                <div className="hidden sm:flex items-center gap-2 cursor-pointer" onClick={handleClick}>
                    <Avatar sx={{ width: 32, height: 32 }}>A</Avatar>
                    <div>
                        <p className="font-semibold text-sm">Admin</p>
                        <p className="text-xs text-gray-500">Quản trị viên</p>
                    </div>
                </div>
                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                    <MenuItem onClick={handleClose}>Thông tin tài khoản</MenuItem>
                    <MenuItem onClick={handleClose}>Đăng xuất</MenuItem>
                </Menu>
            </div>
        </header>

        {/* Mobile Admin Settings Drawer */}
        <div
            className={`fixed inset-0 z-[200] ${isMobileSettingsOpen ? '' : 'pointer-events-none'}`}
            aria-hidden={!isMobileSettingsOpen}
        >
            {/* Overlay */}
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isMobileSettingsOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => setIsMobileSettingsOpen(false)}
            />
            {/* Panel */}
            <div
                className={`absolute top-0 left-0 h-full w-80 max-w-[85%] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isMobileSettingsOpen ? 'translate-x-0' : '-translate-x-full'}`}
                role="dialog"
                aria-label="Menu cài đặt admin"
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <Settings size={18} />
                        <h3 className="text-base font-semibold">Khu vực Admin</h3>
                    </div>
                    <button
                        className="p-2 rounded-md hover:bg-gray-100"
                        onClick={() => setIsMobileSettingsOpen(false)}
                        aria-label="Đóng menu"
                    >
                        <X size={18} />
                    </button>
                </div>
                <nav className="p-2">
                    <ul className="flex flex-col">
                        <li>
                            <Link
                                href="/admin/promotions"
                                className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-gray-100 text-secondary"
                                onClick={() => setIsMobileSettingsOpen(false)}
                            >
                                <Ticket size={18} />
                                <span>Quản lý khuyến mãi</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/admin/banners"
                                className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-gray-100 text-secondary"
                                onClick={() => setIsMobileSettingsOpen(false)}
                            >
                                <PictureInPicture size={18} />
                                <span>Cài đặt Banner</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/admin/settings"
                                className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-gray-100 text-secondary"
                                onClick={() => setIsMobileSettingsOpen(false)}
                            >
                                <Settings size={18} />
                                <span>Cài đặt chung</span>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
        </>
    );
}