/**
 * Admin Settings Management Page - TailwindCSS Version
 * @file src/app/(admin)/admin/settings/page.js
 */
'use client';


import React, { useState, useEffect } from 'react';
import {
    Settings, Globe, Phone, Share2, Palette, Save, RefreshCw,
    Shield, Mail, MapPin, Facebook, Instagram, Twitter, Bell,
    Clock, CheckCircle, Info, AlertCircle, Camera
} from 'lucide-react';
import { Button } from '@/components/tailwindcss/ui/Button';
import { Input } from '@/components/tailwindcss/ui/Input';
import { AlertModal } from '@/components/tailwindcss/ui/AlertModal';

export default function SettingsPageTailwind() {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        general: { site_name: '', site_description: '', logo_url: '' },
        contact: { phone: '', email: '', address: '' },
        social: { facebook: '', instagram: '', tiktok: '' },
        appearance: { primary_color: '#F59E0B', dark_mode: false }
    });
    const [alert, setAlert] = useState({ open: false, title: '', message: '', type: 'info' });

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data.success) {
                setSettings(prev => ({
                    ...prev,
                    ...data.settings
                }));
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
        setLoading(false);
    };

    useEffect(() => { fetchSettings(); }, []);

    const handleSave = async (key) => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value: settings[key] })
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setAlert({
                    open: true,
                    title: 'Thành công',
                    message: `Đã lưu cấu hình ${key} thành công!`,
                    type: 'success'
                });
            } else {
                setAlert({
                    open: true,
                    title: 'Lỗi',
                    message: result.message || 'Không thể lưu cài đặt.',
                    type: 'error'
                });
            }
        } catch (error) {
            setAlert({ open: true, title: 'Lỗi', message: 'Lỗi kết nối server.', type: 'error' });
        }
        setSaving(false);
    };

    const tabs = [
        { id: 'general', label: 'Chung', icon: Globe },
        { id: 'contact', label: 'Liên hệ', icon: Phone },
        { id: 'social', label: 'Mạng xã hội', icon: Share2 },
        { id: 'appearance', label: 'Giao diện', icon: Palette }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <RefreshCw className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
                        <Settings size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Cài đặt hệ thống</h1>
                        <p className="text-sm text-gray-500 font-medium">Quản lý thông tin và cấu hình toàn bộ trang web</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-8 min-h-0">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-3 space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 font-bold ${
                                    activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                                }`}
                            >
                                <tab.icon size={20} />
                                <span className="text-[15px]">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl text-white shadow-xl shadow-blue-100 hidden md:block">
                        <Shield size={32} className="mb-4 opacity-50" />
                        <h3 className="font-bold mb-2">Bảo mật tuyệt đối</h3>
                        <p className="text-xs opacity-80 leading-relaxed">
                            Mọi thay đổi cấu hình sẽ được cập nhật ngay lập tức và đồng bộ trên tất cả thiết bị của người dùng.
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-blue-600 rounded-full" />
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
                                {tabs.find(t => t.id === activeTab).label}
                            </h2>
                        </div>
                        <Button
                            variant="primary"
                            startIcon={<Save size={18} />}
                            onClick={() => handleSave(activeTab)}
                            disabled={saving}
                            className="!bg-green-600 !hover:bg-green-700 shadow-lg shadow-green-100 px-6 py-6"
                        >
                            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        {activeTab === 'general' && (
                            <div className="max-w-2xl space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-3">Tên trang web</label>
                                        <Input
                                            value={settings.general.site_name}
                                            onChange={(e) => setSettings({ ...settings, general: { ...settings.general, site_name: e.target.value } })}
                                            placeholder="VD: Bánh Tằm Cô Đào"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-3">Mô tả ngắn (SEO)</label>
                                        <textarea
                                            value={settings.general.site_description}
                                            onChange={(e) => setSettings({ ...settings, general: { ...settings.general, site_description: e.target.value } })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-700 min-h-[120px]"
                                            placeholder="Mô tả về thương hiệu..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-3">Logo URL</label>
                                        <div className="flex gap-4 items-start">
                                            <div className="flex-1">
                                                <Input
                                                    value={settings.general.logo_url}
                                                    onChange={(e) => setSettings({ ...settings, general: { ...settings.general, logo_url: e.target.value } })}
                                                    placeholder="URL hình ảnh logo..."
                                                    startIcon={<Camera size={16} />}
                                                />
                                            </div>
                                            {settings.general.logo_url && (
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden">
                                                    <img src={settings.general.logo_url} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'contact' && (
                            <div className="max-w-2xl space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-3">Số điện thoại hotline</label>
                                        <Input
                                            value={settings.contact.phone}
                                            onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, phone: e.target.value } })}
                                            placeholder="0123 456 789"
                                            startIcon={<Phone size={16} />}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-3">Email liên hệ</label>
                                        <Input
                                            value={settings.contact.email}
                                            onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })}
                                            placeholder="contact@banhtamcodao.com"
                                            startIcon={<Mail size={16} />}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-3">Địa chỉ cửa hàng</label>
                                        <textarea
                                            value={settings.contact.address}
                                            onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, address: e.target.value } })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-700 min-h-[100px]"
                                            placeholder="Địa chỉ chi tiết..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'social' && (
                            <div className="max-w-2xl space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-3">Facebook Fanpage</label>
                                        <Input
                                            value={settings.social.facebook}
                                            onChange={(e) => setSettings({ ...settings, social: { ...settings.social, facebook: e.target.value } })}
                                            placeholder="https://facebook.com/..."
                                            startIcon={<Facebook size={16} />}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-3">Instagram</label>
                                        <Input
                                            value={settings.social.instagram}
                                            onChange={(e) => setSettings({ ...settings, social: { ...settings.social, instagram: e.target.value } })}
                                            placeholder="https://instagram.com/..."
                                            startIcon={<Instagram size={16} />}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-3">TikTok Shop / Profile</label>
                                        <Input
                                            value={settings.social.tiktok}
                                            onChange={(e) => setSettings({ ...settings, social: { ...settings.social, tiktok: e.target.value } })}
                                            placeholder="https://tiktok.com/@..."
                                            startIcon={<Share2 size={16} />}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="max-w-2xl space-y-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-black uppercase tracking-tight text-gray-700 mb-3">Màu sắc chủ đạo (Primary Color)</label>
                                        <div className="flex gap-4 items-center">
                                            <input
                                                type="color"
                                                value={settings.appearance.primary_color}
                                                onChange={(e) => setSettings({ ...settings, appearance: { ...settings.appearance, primary_color: e.target.value } })}
                                                className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-gray-100 overflow-hidden"
                                            />
                                            <div className="flex-1">
                                                <Input
                                                    value={settings.appearance.primary_color}
                                                    onChange={(e) => setSettings({ ...settings, appearance: { ...settings.appearance, primary_color: e.target.value } })}
                                                    placeholder="#000000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">Chế độ tối (Dark Mode)</h4>
                                            <p className="text-xs text-gray-500 font-medium">Bật chế độ giao diện tối cho toàn bộ trang web</p>
                                        </div>
                                        <button
                                            onClick={() => setSettings({ ...settings, appearance: { ...settings.appearance, dark_mode: !settings.appearance.dark_mode } })}
                                            className={`w-14 h-8 rounded-full relative transition-all duration-300 ${settings.appearance.dark_mode ? 'bg-blue-600' : 'bg-gray-300'}`}
                                        >
                                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${settings.appearance.dark_mode ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center gap-2 text-gray-400">
                        <Clock size={14} />
                        <span className="text-[11px] font-black uppercase tracking-widest">Tự động sao lưu mỗi khi bạn lưu thay đổi</span>
                    </div>
                </div>
            </div>

            <AlertModal
                open={alert.open}
                onClose={() => setAlert({ ...alert, open: false })}
                title={alert.title}
                message={alert.message}
                type={alert.type}
            />
        </div>
    );
}
