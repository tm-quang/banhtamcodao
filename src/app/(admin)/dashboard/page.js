/**
 * Admin dashboard page - SMILE FOOD STYLE
 * @file src/app/(admin)/dashboard/page.js
 */
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
    Box, Typography, Skeleton, alpha, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper,
    FormControl, Select, MenuItem, Tooltip
} from '@mui/material';
import { PieChart, BarChart, LineChart } from '@mui/x-charts';
import {
    SlidersHorizontal, Calendar, Download, ShoppingBag, Clock,
    DollarSign, TrendingUp, TrendingDown, ChevronRight, Info,
    CheckCircle2, Clock3, XCircle, BarChart3, ChevronDown, UserPlus,
    Truck, Zap, Activity, Target
} from 'lucide-react';

/**
 * Format currency to VND
 */
const formatCurrency = (amount) => {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
        return `${Math.round(amount / 1000)}K`;
    }
    return amount.toLocaleString('vi-VN');
};

/**
 * Format date
 */
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Month names in Vietnamese
 */
const MONTHS = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

/**
 * Premium Glass Card Component
 */
const PremiumCard = ({ children, className = '', style = {} }) => (
    <div
        className={`bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-300 shadow-md overflow-hidden transition-all duration-500 ${className}`}
        style={style}
    >
        {children}
    </div>
);

/**
 * Enhanced StatCard with Premium Design
 */
const StatCard = ({ title, value, subtitle, growth, icon: Icon, iconBg, decorativeIcon, delay = 0 }) => {
    const isPositive = growth >= 0;

    return (
        <PremiumCard className="p-4 relative group animate-fadeInUp" style={{ animationDelay: `${delay}ms` }}>
            {/* Decorative Shine Effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>

            {/* Background Decorative Icon */}
            <div className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700 pointer-events-none">
                {decorativeIcon}
            </div>

            <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg} shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon size={20} className="text-white" />
                </div>

                {growth !== undefined && (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {isPositive ? '+' : ''}{growth}%
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <p className="text-[11px] font-bold text-gray-400 mb-0.5 uppercase tracking-wider leading-none">{title}</p>
                <h3 className="text-2xl font-black text-gray-900 mb-1 tracking-tight">
                    {value}
                </h3>
                <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 truncate opacity-80">
                    <Activity size={10} />
                    {subtitle}
                </p>
            </div>
        </PremiumCard>
    );
};

/**
 * Status Badge Component - Modern Style
 */
const StatusBadge = ({ status }) => {
    const statusConfig = {
        'Hoàn thành': { bg: 'bg-green-100/50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2 },
        'Đã giao': { bg: 'bg-green-100/50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2 },
        'Chờ xử lý': { bg: 'bg-amber-100/50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock3 },
        'Pending': { bg: 'bg-amber-100/50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock3 },
        'Đã hủy': { bg: 'bg-red-100/50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
        'Failed': { bg: 'bg-red-100/50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig['Chờ xử lý'];
    const IconComponent = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${config.bg} ${config.text} ${config.border} backdrop-blur-md`}>
            <IconComponent size={12} strokeWidth={3} />
            {status.toUpperCase()}
        </span>
    );
};

export default function DashboardPage() {
    const [dataLoading, setDataLoading] = React.useState(true);
    const [kpiStats, setKpiStats] = React.useState({});
    const [recentOrders, setRecentOrders] = React.useState([]);
    const [categoryDistribution, setCategoryDistribution] = React.useState([]);
    const [newCustomers, setNewCustomers] = React.useState([]);
    const [revenueTrend, setRevenueTrend] = React.useState([]);
    const [topProducts, setTopProducts] = React.useState([]);
    const [trendStartDate, setTrendStartDate] = React.useState(
        new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
    );
    const [trendEndDate, setTrendEndDate] = React.useState(
        new Date().toISOString().split('T')[0]
    );

    // Bar chart state
    const [chartMonth, setChartMonth] = React.useState(new Date().getMonth() + 1);
    const [chartYear, setChartYear] = React.useState(new Date().getFullYear());
    const [chartLoading, setChartLoading] = React.useState(true);
    const [dailyRevenueK, setDailyRevenueK] = React.useState([]);
    const [dailyOrders, setDailyOrders] = React.useState([]);
    const [days, setDays] = React.useState([]);
    const chartContainerRef = React.useRef(null);
    const [chartWidth, setChartWidth] = React.useState(800);

    // Fetch dashboard data
    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setDataLoading(true);
                const response = await fetch(`/api/admin/dashboard/data?startDate=${trendStartDate}&endDate=${trendEndDate}`);
                const result = await response.json();

                if (result.success) {
                    setRecentOrders(result.data.recentOrders || []);
                    setKpiStats(result.data.kpiStats || {});
                    setCategoryDistribution(result.data.categoryDistribution || []);
                    setNewCustomers(result.data.newCustomers || []);
                    setRevenueTrend(result.data.revenueTrend || []);
                    setTopProducts(result.data.topProducts || []);
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setDataLoading(false);
            }
        };

        fetchDashboardData();
    }, [trendStartDate, trendEndDate]);

    // Fetch chart data by month/year
    React.useEffect(() => {
        const fetchChartData = async () => {
            try {
                setChartLoading(true);
                const response = await fetch(`/api/admin/dashboard/stats?month=${chartMonth}&year=${chartYear}`);
                const result = await response.json();

                if (result.success) {
                    setDays(result.data.days || []);
                    setDailyRevenueK(result.data.dailyRevenueK || []);
                    setDailyOrders(result.data.dailyOrders || []);
                } else {
                    const daysInMonth = new Date(chartYear, chartMonth, 0).getDate();
                    setDays(Array.from({ length: daysInMonth }, (_, i) => i + 1));
                    setDailyRevenueK(Array(daysInMonth).fill(0));
                    setDailyOrders(Array(daysInMonth).fill(0));
                }
            } catch (err) {
                console.error('Error fetching chart data:', err);
                const daysInMonth = new Date(chartYear, chartMonth, 0).getDate();
                setDays(Array.from({ length: daysInMonth }, (_, i) => i + 1));
                setDailyRevenueK(Array(daysInMonth).fill(0));
                setDailyOrders(Array(daysInMonth).fill(0));
            } finally {
                setChartLoading(false);
            }
        };

        fetchChartData();
    }, [chartMonth, chartYear]);

    // Update chart width on resize
    React.useEffect(() => {
        const updateChartWidth = () => {
            if (chartContainerRef.current) {
                setChartWidth(chartContainerRef.current.clientWidth - 48);
            }
        };

        updateChartWidth();
        window.addEventListener('resize', updateChartWidth);
        return () => window.removeEventListener('resize', updateChartWidth);
    }, []);

    const totalOrders = categoryDistribution.reduce((sum, cat) => sum + cat.value, 0) || 0;
    const currentYear = new Date().getFullYear();
    const yearOptions = [currentYear - 2, currentYear - 1, currentYear];

    return (
        <div className="min-h-screen pb-12 relative overflow-hidden w-full">
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-green-100/30 rounded-full blur-[140px]"></div>

            {/* Header / Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Tổng quan Dashboard</h1>
                    <p className="text-sm text-gray-500 font-medium">Quản lý nội dung</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white/70 backdrop-blur-md border border-gray-200/50 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-white transition-all shadow-sm">
                        <SlidersHorizontal size={16} />
                        Bộ lọc
                    </button>

                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white/70 backdrop-blur-md border border-gray-200/50 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-white transition-all shadow-sm">
                        <Calendar size={16} />
                        Tháng này
                        <ChevronDown size={14} className="text-gray-400" />
                    </button>

                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all active:scale-95 shadow-md">
                        <Download size={16} />
                        Xuất PDF
                    </button>
                </div>
            </div>

            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-4">
                <StatCard
                    title="Đơn hàng tháng"
                    value={dataLoading ? '...' : `${kpiStats.monthlyOrders?.value || 0}`}
                    subtitle="Đơn hàng đã hoàn thành"
                    growth={kpiStats.monthlyOrders?.growth}
                    icon={ShoppingBag}
                    iconBg="bg-gradient-to-br from-amber-400 to-orange-500"
                    decorativeIcon={<Truck size={120} strokeWidth={1} />}
                    delay={100}
                />
                <StatCard
                    title="Giờ làm việc tháng"
                    value={dataLoading ? '...' : `${kpiStats.workHours?.value || 158}`}
                    subtitle="Giờ phục vụ khách hàng"
                    growth={kpiStats.workHours?.growth || 20}
                    icon={Clock}
                    iconBg="bg-gradient-to-br from-indigo-400 to-blue-600"
                    decorativeIcon={<Clock size={110} strokeWidth={1} />}
                    delay={200}
                />
                <StatCard
                    title="Tổng doanh thu"
                    value={dataLoading ? '...' : `${formatCurrency(kpiStats.monthlyRevenue?.value || 0)} ₫`}
                    subtitle="Doanh thu dự kiến tháng này"
                    growth={kpiStats.monthlyRevenue?.growth}
                    icon={DollarSign}
                    iconBg="bg-gradient-to-br from-emerald-400 to-green-600"
                    decorativeIcon={<Target size={115} strokeWidth={1} />}
                    delay={300}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-4">
                {/* Donut Chart */}
                <div className="lg:col-span-4">
                    <PremiumCard className="p-4 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Cơ cấu món ăn</h3>
                                <p className="text-xs text-gray-500 font-medium">Theo số lượng đơn hàng</p>
                            </div>
                            <Link href="/admin/analytics" className="w-10 h-10 rounded-2xl bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-300 transition-all group">
                                <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>

                        {dataLoading ? (
                            <div className="flex flex-1 items-center justify-center">
                                <Skeleton variant="circular" width={200} height={200} className="rounded-full" />
                            </div>
                        ) : (
                            <div className="flex flex-col flex-1">
                                <div className="relative flex items-center justify-center py-4">
                                    <Box sx={{ position: 'relative', width: 220, height: 220 }}>
                                        <PieChart
                                            series={[{
                                                data: categoryDistribution.length > 0
                                                    ? categoryDistribution.map((item, index) => ({
                                                        id: index,
                                                        value: item.value,
                                                        label: item.name,
                                                        color: item.color
                                                    }))
                                                    : [{ id: 0, value: 1, color: '#f3f4f6' }],
                                                innerRadius: 70,
                                                outerRadius: 100,
                                                paddingAngle: 4,
                                                cornerRadius: 12,
                                                cx: 110,
                                                cy: 110,
                                            }]}
                                            width={220}
                                            height={220}
                                            slotProps={{ legend: { hidden: true } }}
                                        />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tổng cộng</span>
                                            <span className="text-3xl font-black text-gray-900">{totalOrders}</span>
                                        </div>
                                    </Box>
                                </div>

                                <div className="mt-auto pt-6 space-y-3">
                                    {categoryDistribution.map((item, index) => {
                                        const percentage = totalOrders > 0
                                            ? ((item.value / totalOrders) * 100).toFixed(0)
                                            : 0;
                                        return (
                                            <div key={index} className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                                                        style={{ backgroundColor: item.color, boxShadow: `0 0 12px ${item.color}40` }}
                                                    />
                                                    <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{item.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-medium text-gray-400">{item.value} đơn</span>
                                                    <span className="text-sm font-black text-gray-900 min-w-[32px] text-right">{percentage}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </PremiumCard>
                </div>

                {/* Bar Chart */}
                <div className="lg:col-span-8">
                    <PremiumCard className="h-full flex flex-col">
                        <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-100/50 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                                    <BarChart3 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Doanh thu & Đơn hàng</h3>
                                    <p className="text-xs text-gray-500 font-medium italic">Xu hướng tăng trưởng trong tháng</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-1.5 bg-gray-100/50 rounded-2xl backdrop-blur-sm border border-gray-200/50">
                                <Select
                                    value={chartMonth}
                                    onChange={(e) => setChartMonth(e.target.value)}
                                    variant="standard"
                                    disableUnderline
                                    sx={{
                                        px: 2, py: 0.5, fontSize: '0.8rem', fontWeight: 700, color: '#374151',
                                        '& .MuiSelect-select': { py: 0.5 }
                                    }}
                                >
                                    {MONTHS.map((name, index) => (
                                        <MenuItem key={index + 1} value={index + 1}>{name}</MenuItem>
                                    ))}
                                </Select>
                                <div className="w-px h-4 bg-gray-300"></div>
                                <Select
                                    value={chartYear}
                                    onChange={(e) => setChartYear(e.target.value)}
                                    variant="standard"
                                    disableUnderline
                                    sx={{
                                        px: 2, py: 0.5, fontSize: '0.8rem', fontWeight: 700, color: '#374151',
                                        '& .MuiSelect-select': { py: 0.5 }
                                    }}
                                >
                                    {yearOptions.map((year) => (
                                        <MenuItem key={year} value={year}>{year}</MenuItem>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div ref={chartContainerRef} className="p-6 flex-1 flex flex-col">
                            {/* Legend */}
                            <div className="flex items-center justify-center gap-8 mb-6">
                                <div className="flex items-center gap-2 group cursor-pointer">
                                    <div className="w-4 h-1.5 rounded-full bg-green-500 group-hover:w-6 transition-all duration-300"></div>
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider group-hover:text-green-600">Doanh thu (K)</span>
                                </div>
                                <div className="flex items-center gap-2 group cursor-pointer">
                                    <div className="w-4 h-1.5 rounded-full bg-blue-500 group-hover:w-6 transition-all duration-300"></div>
                                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider group-hover:text-blue-600">Đơn hàng</span>
                                </div>
                            </div>

                            {chartLoading ? (
                                <div className="flex-1 flex items-center justify-center h-64">
                                    <div className="relative">
                                        <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
                                        <Zap className="absolute inset-0 m-auto text-green-500 animate-pulse" size={16} />
                                    </div>
                                </div>
                            ) : (
                                <Box sx={{ width: '100%', height: 300 }}>
                                    <BarChart
                                        xAxis={[{
                                            scaleType: 'band',
                                            data: days.map(d => `${d}`),
                                            tickLabelStyle: { fontSize: 9, fill: '#9ca3af', fontWeight: 700 },
                                            categoryGapRatio: 0.4,
                                            barGapRatio: 0.1
                                        }]}
                                        yAxis={[
                                            {
                                                id: 'revenueAxis',
                                                scaleType: 'linear',
                                                tickLabelStyle: { fontSize: 10, fill: '#10b981', fontWeight: 700 },
                                                valueFormatter: (v) => `${v}K`
                                            },
                                            {
                                                id: 'ordersAxis',
                                                scaleType: 'linear',
                                                tickLabelStyle: { fontSize: 10, fill: '#3b82f6', fontWeight: 700 }
                                            }
                                        ]}
                                        series={[
                                            {
                                                data: dailyRevenueK,
                                                color: '#10b981',
                                                yAxisId: 'revenueAxis',
                                                valueFormatter: (v) => `${v?.toLocaleString() || 0}K ₫`
                                            },
                                            {
                                                data: dailyOrders,
                                                color: '#3b82f6',
                                                yAxisId: 'ordersAxis',
                                                valueFormatter: (v) => `${v || 0} đơn`
                                            }
                                        ]}
                                        width={chartWidth > 0 ? chartWidth : 700}
                                        height={300}
                                        margin={{ left: 50, right: 50, top: 20, bottom: 30 }}
                                        slotProps={{ legend: { hidden: true } }}
                                        sx={{
                                            '& .MuiBarElement-root': { rx: 4, ry: 4, transition: 'all 0.3s' },
                                            '& .MuiBarElement-root:hover': { filter: 'brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.1))' },
                                            '& .MuiChartsAxis-line': { stroke: 'transparent' },
                                            '& .MuiChartsAxis-tick': { stroke: '#f3f4f6' },
                                            '& .MuiChartsGrid-line': { strokeDasharray: '4 4', stroke: '#f3f4f6' }
                                        }}
                                    />
                                </Box>
                            )}
                        </div>

                        {/* Chart Summary - Premium Footer */}
                        <div className="p-6 pt-0">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100/50">
                                    <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">Tổng doanh thu</p>
                                    <p className="text-xl font-black text-green-600">
                                        {formatCurrency(dailyRevenueK.reduce((a, b) => a + (b || 0), 0) * 1000)} ₫
                                    </p>
                                </div>
                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                    <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">Tổng đơn hàng</p>
                                    <p className="text-xl font-black text-blue-600">
                                        {dailyOrders.reduce((a, b) => a + (b || 0), 0)} đơn
                                    </p>
                                </div>
                                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Ngày cao nhất</p>
                                    <p className="text-xl font-black text-amber-600">
                                        {formatCurrency(Math.max(...dailyRevenueK.filter(v => v > 0), 0) * 1000)} ₫
                                    </p>
                                </div>
                                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                    <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-1">Trung bình ngày</p>
                                    <p className="text-xl font-black text-indigo-600">
                                        {formatCurrency(Math.round((dailyRevenueK.reduce((a, b) => a + (b || 0), 0) / (days.length || 1)) * 1000))} ₫
                                    </p>
                                </div>
                            </div>
                        </div>
                    </PremiumCard>
                </div>
            </div>

            {/* New Row: Revenue Trend & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                {/* Revenue Trend Line Chart */}
                <div className="lg:col-span-8">
                    <PremiumCard className="p-5 h-full flex flex-col min-h-[400px]">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Doanh thu theo thời gian</h3>
                                    <p className="text-xs text-gray-500 font-medium">Xu hướng tăng trưởng</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
                                <input
                                    type="date"
                                    value={trendStartDate}
                                    onChange={(e) => setTrendStartDate(e.target.value)}
                                    className="bg-transparent text-[10px] font-bold text-gray-600 outline-none px-2 py-1"
                                />
                                <span className="text-gray-300 text-xs">-</span>
                                <input
                                    type="date"
                                    value={trendEndDate}
                                    onChange={(e) => setTrendEndDate(e.target.value)}
                                    className="bg-transparent text-[10px] font-bold text-gray-600 outline-none px-2 py-1"
                                />
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            {dataLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Skeleton variant="rectangular" width="100%" height={250} className="rounded-2xl" />
                                </div>
                            ) : (
                                <div className="h-[250px] w-full">
                                    <LineChart
                                        series={[{
                                            data: revenueTrend.map(item => item.revenue),
                                            label: 'Doanh thu (K)',
                                            color: '#10b981',
                                            area: true,
                                            showMark: true,
                                        }]}
                                        xAxis={[{
                                            scaleType: 'point',
                                            data: revenueTrend.map(item => item.date),
                                        }]}
                                        height={250}
                                        margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
                                        slotProps={{
                                            legend: { hidden: true },
                                        }}
                                        sx={{
                                            '.MuiLineElement-root': {
                                                strokeWidth: 3,
                                            },
                                            '.MuiAreaElement-root': {
                                                fill: 'url(#revenue-gradient)',
                                                fillOpacity: 0.1,
                                            },
                                        }}
                                    >
                                        <defs>
                                            <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                    </LineChart>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Doanh thu</span>
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đơn vị: Nghìn đồng (K)</span>
                        </div>
                    </PremiumCard>
                </div>

                {/* Top Selling Items Bar Chart */}
                <div className="lg:col-span-4">
                    <PremiumCard className="p-5 h-full flex flex-col min-h-[400px]">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Top món bán chạy</h3>
                                    <p className="text-xs text-gray-500 font-medium">Sản phẩm hiệu suất cao nhất</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
                                <Calendar size={12} className="text-amber-600" />
                                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Theo lọc thời gian</span>
                            </div>
                        </div>

                        <div className="flex-1">
                            {dataLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex flex-col gap-1">
                                            <Skeleton width="40%" height={10} />
                                            <Skeleton width="100%" height={24} className="rounded-lg" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-[250px]">
                                    <BarChart
                                        layout="horizontal"
                                        series={[{
                                            data: topProducts.map(item => item.sold),
                                            color: '#f59e0b',
                                        }]}
                                        yAxis={[{
                                            scaleType: 'band',
                                            data: topProducts.map(item => item.name),
                                        }]}
                                        height={250}
                                        margin={{ left: 100, right: 20, top: 10, bottom: 30 }}
                                        slotProps={{ legend: { hidden: true } }}
                                        sx={{
                                            '.MuiBarElement-root': {
                                                rx: 8,
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100">
                            <Link href="/admin/analytics" className="text-[10px] font-black text-green-600 uppercase tracking-widest hover:text-green-700 flex items-center gap-1">
                                Xem báo cáo chi tiết <ChevronRight size={12} />
                            </Link>
                        </div>
                    </PremiumCard>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* New Customers */}
                <div className="lg:col-span-4">
                    <PremiumCard className="h-full flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                                    <UserPlus size={20} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Khách hàng mới</h3>
                            </div>
                            <Link href="/admin/customers" className="text-xs font-bold text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-xl transition-all">
                                Xem tất cả
                            </Link>
                        </div>

                        <div className="flex-1 overflow-auto max-h-[400px] scrollbar-hide">
                            {dataLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="px-5 py-3 flex items-center gap-4">
                                        <Skeleton variant="circular" width={48} height={48} className="rounded-2xl" />
                                        <div className="flex-1">
                                            <Skeleton width="70%" height={16} />
                                            <Skeleton width="40%" height={12} sx={{ mt: 1 }} />
                                        </div>
                                    </div>
                                ))
                            ) : newCustomers.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-300">
                                        <UserPlus size={24} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium">Chưa có khách hàng mới</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {newCustomers.slice(0, 6).map((customer, index) => (
                                        <div key={customer.id || index} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50/80 transition-all cursor-pointer group">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400/20 to-green-600/20 border border-green-100 flex items-center justify-center text-green-700 font-black text-base group-hover:scale-110 transition-transform shadow-sm">
                                                {customer.name?.charAt(0)?.toUpperCase() || 'K'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 text-sm truncate group-hover:text-green-600 transition-colors">
                                                    {customer.name || `Khách hàng ${index + 1}`}
                                                </p>
                                                <p className="text-xs text-gray-400 font-medium truncate">
                                                    {customer.email || customer.phone || 'Không có thông tin'}
                                                </p>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-wider mb-1">Đăng ký</span>
                                                <span className="text-xs font-bold text-gray-500">
                                                    {formatDate(customer.created_at) || 'Hôm nay'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </PremiumCard>
                </div>

                {/* Orders History */}
                <div className="lg:col-span-8">
                    <PremiumCard className="h-full flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                                    <ShoppingBag size={20} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">Đơn hàng vừa nhận</h3>
                            </div>
                            <Link href="/admin/orders" className="text-xs font-bold text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded-xl transition-all">
                                Xem báo cáo
                            </Link>
                        </div>

                        <div className="flex-1 overflow-auto scrollbar-hide">
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ '& th': { borderBottom: '1px solid #f3f4f6', py: 2.5 } }}>
                                            <TableCell sx={{ fontWeight: 800, color: '#9ca3af', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', pl: 3 }}>
                                                Mã Đơn
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#9ca3af', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                Trạng Thái
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#9ca3af', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                Thời Gian
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 800, color: '#9ca3af', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>
                                                Tổng Tiền
                                            </TableCell>
                                            <TableCell sx={{ width: 60, pr: 3 }}></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {dataLoading ? (
                                            [1, 2, 3, 4, 5].map(i => (
                                                <TableRow key={i}>
                                                    <TableCell sx={{ pl: 3 }}><Skeleton width="60%" height={20} /></TableCell>
                                                    <TableCell><Skeleton width={80} height={24} className="rounded-full" /></TableCell>
                                                    <TableCell><Skeleton width="70%" height={20} /></TableCell>
                                                    <TableCell sx={{ textAlign: 'right' }}><Skeleton width="50%" height={20} sx={{ ml: 'auto' }} /></TableCell>
                                                    <TableCell sx={{ pr: 3 }}><Skeleton variant="circular" width={32} height={32} /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : recentOrders.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 8, border: 0 }}>
                                                    <div className="flex flex-col items-center opacity-30">
                                                        <ShoppingBag size={48} className="mb-2" />
                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Chưa có đơn hàng nào</Typography>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            recentOrders.slice(0, 6).map((order, index) => (
                                                <TableRow
                                                    key={order.id || index}
                                                    sx={{
                                                        '&:hover': { bgcolor: 'rgba(243, 244, 246, 0.4)' },
                                                        '& td': { borderBottom: '1px solid #f9fafb', py: 2 },
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <TableCell sx={{ pl: 3 }}>
                                                        <span className="font-black text-gray-900 text-sm tracking-tighter">
                                                            #{order.id || `DH-${10250000 + index}`}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={order.status || 'Hoàn thành'} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-900 text-xs font-bold">
                                                                {formatDate(order.created_at) || 'Hôm nay'}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase">
                                                                lúc {formatTime(order.created_at) || 'Vừa xong'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'right' }}>
                                                        <span className="font-black text-green-600 text-sm">
                                                            {typeof order.total === 'number'
                                                                ? order.total.toLocaleString('vi-VN') + ' ₫'
                                                                : order.total || `${78000 - index * 10000} ₫`}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell sx={{ pr: 3, textAlign: 'right' }}>
                                                        <button className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all">
                                                            <Info size={16} strokeWidth={3} />
                                                        </button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    </PremiumCard>
                </div>
            </div>
        </div>
    );
}