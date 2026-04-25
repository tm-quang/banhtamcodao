/**
 * Unified Admin Analytics & Reports Page - TailwindCSS Version
 * @file src/app/(admin)/admin/analytics/page.js
 */
'use client';

import React, { useState, useEffect } from 'react';
import {
    Activity, TrendingUp, DollarSign, ShoppingCart, Users,
    RefreshCw, Download, ChevronRight, Award, LayoutGrid,
    Utensils, UserCheck
} from 'lucide-react';
import { Button } from '@/components/tailwindcss/ui/Button';
import { Chip } from '@/components/tailwindcss/ui/Chip';
import { SkeletonStatsCard } from '@/components/tailwindcss/ui/Skeleton';

const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

// Mini Bar Component for Custom Charts
const SimpleBarChart = ({ data, color = 'bg-blue-600' }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="flex items-end gap-1 h-[200px] mt-4">
            {data.map((item, i) => (
                <div key={i} className="group relative flex-1 flex flex-col items-center gap-2">
                    <div
                        className={`w-full rounded-t-lg transition-all duration-300 hover:brightness-110 ${color}`}
                        style={{ height: `${(item.value / maxValue) * 100}%` }}
                    >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                            {formatCurrency(item.value)}
                        </div>
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 rotate-45 md:rotate-0 mt-1">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('thisMonth');
    const [activeSection, setActiveSection] = useState('overview'); // overview, revenue, products, customers
    const [data, setData] = useState({
        overview: {},
        revenueByTime: [],
        topProducts: [],
        categoryStats: [],
        customerGroupStats: []
    });

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/analytics?dateRange=${dateRange}`);
            const result = await res.json();
            console.log('Analytics API Response:', result);
            if (result.success && result.data && result.data.overview) {
                setData(result.data);
            } else {
                console.warn('Malformed analytics data received:', result);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        }
        setLoading(false);
    };

    useEffect(() => { fetchAnalytics(); }, [dateRange]);

    const sections = [
        { id: 'overview', label: 'Tổng quan', icon: LayoutGrid },
        { id: 'revenue', label: 'Doanh thu', icon: DollarSign },
        { id: 'products', label: 'Món ăn & Danh mục', icon: Utensils },
        { id: 'customers', label: 'Khách hàng', icon: UserCheck }
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">THỐNG KÊ & BÁO CÁO</h1>
                        <p className="text-sm text-gray-500 font-medium italic">Phân tích chuyên sâu dữ liệu kinh doanh</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                    >
                        <option value="thisMonth">Tháng này</option>
                        <option value="thisYear">Năm nay</option>
                        <option value="30days">30 ngày qua</option>
                    </select>
                    <Button
                        variant="outline"
                        startIcon={<RefreshCw size={16} />}
                        onClick={fetchAnalytics}
                        className="!bg-gray-500 !hover:bg-gray-600 text-white"
                    >
                        Làm mới
                    </Button>
                    <Button
                        variant="primary"
                        startIcon={<Download size={16} />}
                        className="!bg-indigo-600 !hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                    >
                        Xuất Excel
                    </Button>
                </div>
            </div>

            {/* Quick Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {loading ? <><SkeletonStatsCard /><SkeletonStatsCard /><SkeletonStatsCard /><SkeletonStatsCard /></> : (
                    <>
                        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-xl overflow-hidden hover:scale-105 transition-all">
                            <DollarSign size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <DollarSign size={32} className="mb-4 opacity-80" />
                                <p className="text-3xl font-black mb-1">{formatCurrency(data?.overview?.monthRevenue)}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold opacity-80">Doanh thu tháng</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${data?.overview?.monthGrowth >= 0 ? 'bg-white/20 text-white' : 'bg-red-500/30 text-white'}`}>
                                        {data?.overview?.monthGrowth >= 0 ? '+' : ''}{data?.overview?.monthGrowth}%
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-xl overflow-hidden hover:scale-105 transition-all">
                            <ShoppingCart size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <ShoppingCart size={32} className="mb-4 opacity-80" />
                                <p className="text-3xl font-black mb-1">{data?.overview?.totalOrders || 0}</p>
                                <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Tổng đơn hàng</p>
                            </div>
                        </div>
                        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xl overflow-hidden hover:scale-105 transition-all">
                            <Users size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <Users size={32} className="mb-4 opacity-80" />
                                <p className="text-3xl font-black mb-1">{data?.overview?.totalCustomers || 0}</p>
                                <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Tổng khách hàng</p>
                            </div>
                        </div>
                        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-xl overflow-hidden hover:scale-105 transition-all">
                            <TrendingUp size={80} className="absolute bottom-0 right-0 opacity-10" />
                            <div className="relative z-10">
                                <TrendingUp size={32} className="mb-4 opacity-80" />
                                <p className="text-3xl font-black mb-1">{formatCurrency(data?.overview?.totalRevenue)}</p>
                                <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Tổng doanh thu</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Main Content Tabs */}
            <div className="flex gap-3 mb-4 overflow-x-auto ml-2">
                {sections.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-3xl font-black uppercase tracking-tight transition-all shrink-0 ${activeSection === s.id
                            ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <s.icon size={18} />
                        <span className="text-sm">{s.label}</span>
                    </button>
                ))}
            </div>

            {/* Section Content */}
            <div className="flex-1 min-h-0">
                {activeSection === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Revenue Chart Box */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-green-500 rounded-full" />
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Biểu đồ doanh thu</h3>
                                </div>
                                <Chip variant="solid" className="bg-green-100 text-green-700 border-0 font-black">THEO THỜI GIAN</Chip>
                            </div>
                            <div className="flex-1">
                                <SimpleBarChart data={data?.revenueByTime || []} color="bg-green-500" />
                            </div>
                        </div>

                        {/* Top Products Box */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Top món ăn doanh thu cao</h3>
                                </div>
                                <Award size={20} className="text-amber-500" />
                            </div>
                            <div className="space-y-4">
                                {data?.topProducts?.slice(0, 5).map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-amber-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full font-black text-amber-600 shadow-sm">
                                                {i + 1}
                                            </span>
                                            <div>
                                                <p className="font-bold text-gray-900">{p.name}</p>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{p.qty} đơn hàng</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-amber-600">{formatCurrency(p.revenue)}</p>
                                            <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-500"
                                                    style={{ width: `${(p.revenue / (data?.topProducts?.[0]?.revenue || 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'revenue' && (
                    <div className="space-y-8">
                        {/* Category Stats */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Doanh thu theo danh mục</h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {data?.categoryStats?.map((c, i) => (
                                    <div key={i} className="p-6 bg-blue-50 rounded-2xl border border-blue-100 group hover:bg-blue-600 transition-all cursor-pointer">
                                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1 group-hover:text-white/80">{c.name}</p>
                                        <p className="text-2xl font-black text-gray-900 mb-4 group-hover:text-white">{formatCurrency(c.revenue)}</p>
                                        <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 group-hover:bg-blue-400"
                                                style={{ width: `${(c.revenue / (data?.categoryStats?.[0]?.revenue || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Daily Revenue Table */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-green-600 rounded-full" />
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Báo cáo doanh thu chi tiết</h3>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-gray-400">Thời gian</th>
                                            <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-gray-400 text-right">Doanh thu</th>
                                            <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-gray-400 text-right">Tỷ trọng</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {data?.revenueByTime?.map((d, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-4 font-bold text-gray-900">{d.label}</td>
                                                <td className="py-4 font-black text-green-600 text-right">{formatCurrency(d.value)}</td>
                                                <td className="py-4 text-right">
                                                    <span className="text-[11px] font-black text-gray-400">
                                                        {((d.value / (data?.overview?.monthRevenue || 1)) * 100).toFixed(1)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'products' && (
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-orange-600 rounded-full" />
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Báo cáo món ăn chi tiết</h3>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-gray-400">Tên món ăn</th>
                                        <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-gray-400 text-center">Số lượng bán</th>
                                        <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-gray-400 text-right">Tổng doanh thu</th>
                                        <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-gray-400 text-right">Tỷ trọng</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data?.topProducts?.map((p, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 font-bold text-gray-900">{p.name}</td>
                                            <td className="py-4 font-black text-gray-500 text-center">
                                                <span className="px-3 py-1 bg-gray-100 rounded-full">{p.qty}</span>
                                            </td>
                                            <td className="py-4 font-black text-green-600 text-right">{formatCurrency(p.revenue)}</td>
                                            <td className="py-4 text-right">
                                                <span className="text-[11px] font-black text-gray-400">
                                                    {((p.revenue / (data?.overview?.totalRevenue || 1)) * 100).toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeSection === 'customers' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Doanh thu theo nhóm khách</h3>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {data?.customerGroupStats?.map((g, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold text-gray-700">{g.name}</span>
                                            <span className="font-black text-indigo-600">{formatCurrency(g.revenue)}</span>
                                        </div>
                                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-600 rounded-full"
                                                style={{ width: `${(g.revenue / (data?.overview?.totalRevenue || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-center">
                            <Award size={48} className="mb-6 opacity-50" />
                            <h3 className="text-2xl font-black mb-4">Gợi ý tăng trưởng</h3>
                            <p className="opacity-80 leading-relaxed mb-6 font-medium">
                                Dựa trên dữ liệu 30 ngày qua, nhóm khách hàng <strong>"Thành viên Vàng"</strong> đang đóng góp 45% tổng doanh thu.
                                Bạn nên tạo thêm các chương trình khuyến mãi riêng biệt cho nhóm này để tối ưu lợi nhuận.
                            </p>
                            <Button className="!bg-white !text-indigo-600 w-fit font-black rounded-2xl">Xem đề xuất chi tiết</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
