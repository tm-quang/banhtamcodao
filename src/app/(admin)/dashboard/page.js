/**
 * Admin dashboard page - SMILE FOOD STYLE
 * @file src/app/(admin)/dashboard/page.js
 */
'use client';

import * as React from 'react';
import {
    Box, Typography, Skeleton, alpha, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper,
    FormControl, Select, MenuItem
} from '@mui/material';
import { PieChart, BarChart } from '@mui/x-charts';
import {
    SlidersHorizontal, Calendar, Download, ShoppingBag, Clock,
    DollarSign, TrendingUp, TrendingDown, ChevronRight, Info,
    CheckCircle2, Clock3, XCircle, BarChart3, ChevronDown, UserPlus,
    Truck
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
 * Enhanced StatCard matching reference design
 */
const StatCard = ({ title, value, subtitle, growth, icon: Icon, iconBg, decorativeIcon }) => {
    const isPositive = growth >= 0;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            {/* Decorative Icon */}
            <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-70 transition-opacity">
                {decorativeIcon}
            </div>

            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconBg} shadow-lg`}>
                    <Icon size={26} className="text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                    <p className="text-sm text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>

                    {/* Growth indicator */}
                    {growth !== undefined && (
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className={`flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {isPositive ? '+' : ''}{growth}%
                            </span>
                            <span className="text-xs text-gray-400">vs tháng trước</span>
                        </div>
                    )}

                    {subtitle && (
                        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Status Badge Component
 */
const StatusBadge = ({ status }) => {
    const statusConfig = {
        'Hoàn thành': { bg: 'bg-green-50', text: 'text-green-600', icon: CheckCircle2 },
        'Đã giao': { bg: 'bg-green-50', text: 'text-green-600', icon: CheckCircle2 },
        'Chờ xử lý': { bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock3 },
        'Pending': { bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock3 },
        'Đã hủy': { bg: 'bg-red-50', text: 'text-red-500', icon: XCircle },
        'Failed': { bg: 'bg-red-50', text: 'text-red-500', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig['Chờ xử lý'];
    const IconComponent = config.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            <IconComponent size={12} />
            {status}
        </span>
    );
};

/**
 * Decorative icons for stat cards using lucide-react
 */
const DeliveryDecorativeIcon = () => (
    <Truck size={80} className="text-amber-200 opacity-50" strokeWidth={1.5} />
);

const ClockDecorativeIcon = () => (
    <Clock size={70} className="text-green-200 opacity-50" strokeWidth={1.5} />
);

const MoneyDecorativeIcon = () => (
    <DollarSign size={75} className="text-green-200 opacity-50" strokeWidth={1.5} />
);

export default function DashboardPage() {
    const [dataLoading, setDataLoading] = React.useState(true);
    const [kpiStats, setKpiStats] = React.useState({});
    const [recentOrders, setRecentOrders] = React.useState([]);
    const [categoryDistribution, setCategoryDistribution] = React.useState([]);
    const [newCustomers, setNewCustomers] = React.useState([]);

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
                const response = await fetch('/api/admin/dashboard/data');
                const result = await response.json();

                if (result.success) {
                    setRecentOrders(result.data.recentOrders || []);
                    setKpiStats(result.data.kpiStats || {});
                    setCategoryDistribution(result.data.categoryDistribution || []);
                    setNewCustomers(result.data.newCustomers || []);
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setDataLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

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
                    // Generate empty data for the month
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

    // Calculate totals for donut chart
    const totalOrders = categoryDistribution.reduce((sum, cat) => sum + cat.value, 0) || 0;

    // Generate year options (current year and 2 years back)
    const currentYear = new Date().getFullYear();
    const yearOptions = [currentYear - 2, currentYear - 1, currentYear];

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Filters Button */}
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <SlidersHorizontal size={16} />
                        Bộ lọc
                    </button>

                    {/* Date Range */}
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <Calendar size={16} />
                        30 ngày qua
                        <ChevronRight size={14} className="rotate-90 text-gray-400" />
                    </button>
                </div>

                {/* Export Button */}
                <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/25">
                    <Download size={16} />
                    Xuất PDF
                </button>
            </div>

            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <StatCard
                    title="Đơn hàng tháng"
                    value={dataLoading ? '...' : `${kpiStats.monthlyOrders?.value || 0} đơn`}
                    growth={kpiStats.monthlyOrders?.growth}
                    icon={ShoppingBag}
                    iconBg="bg-gradient-to-br from-amber-400 to-amber-500"
                    decorativeIcon={<DeliveryDecorativeIcon />}
                />
                <StatCard
                    title="Giờ làm việc tháng"
                    value={dataLoading ? '...' : `${kpiStats.workHours?.value || 158} giờ`}
                    growth={kpiStats.workHours?.growth || 20}
                    icon={Clock}
                    iconBg="bg-gradient-to-br from-green-400 to-green-500"
                    decorativeIcon={<ClockDecorativeIcon />}
                />
                <StatCard
                    title="Doanh thu"
                    value={dataLoading ? '...' : `${formatCurrency(kpiStats.monthlyRevenue?.value || 0)} ₫`}
                    growth={kpiStats.monthlyRevenue?.growth}
                    icon={DollarSign}
                    iconBg="bg-gradient-to-br from-green-500 to-green-600"
                    decorativeIcon={<MoneyDecorativeIcon />}
                />
            </div>

            {/* Charts Row - Pie Chart (left) + Bar Chart (right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                {/* Statistics - Donut Chart (Left - Fixed Width) */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Thống kê</h3>
                            <button className="text-sm text-green-600 font-medium hover:underline flex items-center gap-1">
                                Xem thêm <ChevronRight size={14} />
                            </button>
                        </div>

                        {dataLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <Skeleton variant="circular" width={180} height={180} />
                            </div>
                        ) : (
                            <>
                                {/* Donut Chart with inline legend */}
                                <div className="flex items-center justify-center gap-4">
                                    <Box sx={{ position: 'relative', flexShrink: 0 }}>
                                        <PieChart
                                            series={[{
                                                data: categoryDistribution.length > 0
                                                    ? categoryDistribution.map((item, index) => ({
                                                        id: index,
                                                        value: item.value,
                                                        label: item.name,
                                                        color: item.color
                                                    }))
                                                    : [{ id: 0, value: 1, color: '#e5e7eb' }],
                                                innerRadius: 50,
                                                outerRadius: 85,
                                                paddingAngle: 2,
                                                cornerRadius: 4,
                                                cx: 90,
                                                cy: 85,
                                            }]}
                                            width={190}
                                            height={180}
                                            slotProps={{
                                                legend: { hidden: true },
                                            }}
                                        />
                                        {/* Center Label */}
                                        <Box sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            textAlign: 'center'
                                        }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                                                Tổng đơn
                                            </Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                {totalOrders}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </div>

                                {/* Legend with percentages */}
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                                    {categoryDistribution.map((item, index) => {
                                        const percentage = totalOrders > 0
                                            ? ((item.value / totalOrders) * 100).toFixed(0)
                                            : 0;
                                        return (
                                            <div key={index} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="w-2.5 h-2.5 rounded-full"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span className="text-sm text-gray-600">{item.name}</span>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Bar Chart - Revenue & Orders by Day (Right - Flex) */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
                        <div className="flex flex-wrap items-center justify-between p-5 border-b border-gray-100 gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                    <BarChart3 size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Doanh thu & Đơn hàng theo ngày</h3>
                                    <p className="text-xs text-gray-500">Biểu đồ thống kê theo tháng</p>
                                </div>
                            </div>

                            {/* Month/Year Filters */}
                            <div className="flex items-center gap-2">
                                <FormControl size="small" sx={{ minWidth: 110 }}>
                                    <Select
                                        value={chartMonth}
                                        onChange={(e) => setChartMonth(e.target.value)}
                                        sx={{
                                            borderRadius: '10px',
                                            bgcolor: 'grey.50',
                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.200' },
                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                                            '& .MuiSelect-select': { py: 1, fontSize: '0.8rem', fontWeight: 500 }
                                        }}
                                        IconComponent={(props) => <ChevronDown size={14} {...props} style={{ right: 10, position: 'absolute', pointerEvents: 'none' }} />}
                                    >
                                        {MONTHS.map((name, index) => (
                                            <MenuItem key={index + 1} value={index + 1}>{name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 85 }}>
                                    <Select
                                        value={chartYear}
                                        onChange={(e) => setChartYear(e.target.value)}
                                        sx={{
                                            borderRadius: '10px',
                                            bgcolor: 'grey.50',
                                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.200' },
                                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                                            '& .MuiSelect-select': { py: 1, fontSize: '0.8rem', fontWeight: 500 }
                                        }}
                                        IconComponent={(props) => <ChevronDown size={14} {...props} style={{ right: 10, position: 'absolute', pointerEvents: 'none' }} />}
                                    >
                                        {yearOptions.map((year) => (
                                            <MenuItem key={year} value={year}>{year}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </div>
                        </div>

                        {/* Chart Container - Full width, no scroll */}
                        <div ref={chartContainerRef} className="p-4">
                            {/* Custom Legend */}
                            <div className="flex items-center justify-center gap-6 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-sm bg-green-600"></span>
                                    <span className="text-xs font-semibold text-gray-600">Doanh thu (K)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-sm bg-blue-600"></span>
                                    <span className="text-xs font-semibold text-gray-600">Đơn hàng</span>
                                </div>
                            </div>

                            {chartLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <Box sx={{ width: '100%', height: 280 }}>
                                    <BarChart
                                        xAxis={[{
                                            scaleType: 'band',
                                            data: days.map(d => `${d}`),
                                            tickLabelStyle: { fontSize: 9, fill: '#6b7280', fontWeight: 500 },
                                            categoryGapRatio: 0.3,
                                            barGapRatio: 0.1
                                        }]}
                                        yAxis={[
                                            {
                                                id: 'revenueAxis',
                                                scaleType: 'linear',
                                                tickLabelStyle: { fontSize: 10, fill: '#16a34a', fontWeight: 500 },
                                                valueFormatter: (v) => `${v}K`
                                            },
                                            {
                                                id: 'ordersAxis',
                                                scaleType: 'linear',
                                                tickLabelStyle: { fontSize: 10, fill: '#2563eb', fontWeight: 500 }
                                            }
                                        ]}
                                        series={[
                                            {
                                                data: dailyRevenueK,
                                                label: 'Doanh thu (K)',
                                                color: '#16a34a',
                                                yAxisId: 'revenueAxis',
                                                valueFormatter: (v) => `${v?.toLocaleString() || 0}K ₫`
                                            },
                                            {
                                                data: dailyOrders,
                                                label: 'Đơn hàng',
                                                color: '#2563eb',
                                                yAxisId: 'ordersAxis',
                                                valueFormatter: (v) => `${v || 0} đơn`
                                            }
                                        ]}
                                        width={chartWidth > 0 ? chartWidth : 700}
                                        height={280}
                                        margin={{ left: 45, right: 45, top: 20, bottom: 25 }}
                                        slotProps={{
                                            legend: {
                                                hidden: true
                                            }
                                        }}
                                        sx={{
                                            '& .MuiBarElement-root': { rx: 2, ry: 2 },
                                            '& .MuiChartsAxis-line': { stroke: '#e5e7eb' },
                                            '& .MuiChartsAxis-tick': { stroke: '#e5e7eb' }
                                        }}
                                    />
                                </Box>
                            )}
                        </div>

                        {/* Chart Summary - Compact */}
                        <div className="px-4 pb-4">
                            <div className="grid grid-cols-4 gap-3">
                                <div className="bg-green-50 rounded-lg p-3">
                                    <p className="text-xs text-green-700 font-medium mb-0.5">Tổng doanh thu</p>
                                    <p className="text-lg font-bold text-green-600">
                                        {formatCurrency(dailyRevenueK.reduce((a, b) => a + (b || 0), 0) * 1000)} ₫
                                    </p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3">
                                    <p className="text-xs text-blue-700 font-medium mb-0.5">Tổng đơn hàng</p>
                                    <p className="text-lg font-bold text-blue-600">
                                        {dailyOrders.reduce((a, b) => a + (b || 0), 0)} đơn
                                    </p>
                                </div>
                                <div className="bg-amber-50 rounded-lg p-3">
                                    <p className="text-xs text-amber-700 font-medium mb-0.5">Ngày cao nhất</p>
                                    <p className="text-lg font-bold text-amber-600">
                                        {formatCurrency(Math.max(...dailyRevenueK.filter(v => v > 0), 0) * 1000)} ₫
                                    </p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3">
                                    <p className="text-xs text-purple-700 font-medium mb-0.5">TB mỗi ngày</p>
                                    <p className="text-lg font-bold text-purple-600">
                                        {formatCurrency(Math.round((dailyRevenueK.reduce((a, b) => a + (b || 0), 0) / (days.length || 1)) * 1000))} ₫
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Customers & Orders History Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* New Customers - Left */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                                    <UserPlus size={16} className="text-white" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900">Khách hàng mới</h3>
                            </div>
                            <button className="text-sm text-green-600 font-medium hover:underline flex items-center gap-1">
                                Xem thêm <ChevronRight size={14} />
                            </button>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {dataLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="p-4 flex items-center gap-3">
                                        <Skeleton variant="circular" width={40} height={40} />
                                        <div className="flex-1">
                                            <Skeleton width="60%" height={16} />
                                            <Skeleton width="40%" height={12} sx={{ mt: 0.5 }} />
                                        </div>
                                    </div>
                                ))
                            ) : newCustomers.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Typography color="text.secondary" variant="body2">Chưa có khách hàng mới</Typography>
                                </div>
                            ) : (
                                newCustomers.slice(0, 6).map((customer, index) => (
                                    <div key={customer.id || index} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                            {customer.name?.charAt(0)?.toUpperCase() || 'K'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 text-sm truncate">
                                                {customer.name || `Khách hàng ${index + 1}`}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {customer.email || customer.phone || 'Không có thông tin'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">
                                                {formatDate(customer.created_at) || 'Hôm nay'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Orders History - Right */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900">Lịch sử đơn hàng</h3>
                            <button className="text-sm text-green-600 font-medium hover:underline flex items-center gap-1">
                                Xem thêm <ChevronRight size={14} />
                            </button>
                        </div>

                        <TableContainer component={Paper} elevation={0}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', py: 1.5 }}>
                                            Mã đơn hàng
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', py: 1.5 }}>
                                            Trạng thái
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', py: 1.5 }}>
                                            Ngày và Giờ
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', py: 1.5 }}>
                                            Số tiền
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem', py: 1.5, width: 50 }}>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dataLoading ? (
                                        [1, 2, 3, 4, 5].map(i => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton width="70%" /></TableCell>
                                                <TableCell><Skeleton width={70} height={24} /></TableCell>
                                                <TableCell><Skeleton width="80%" /></TableCell>
                                                <TableCell><Skeleton width="50%" /></TableCell>
                                                <TableCell><Skeleton width={20} /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : recentOrders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                                <Typography color="text.secondary" variant="body2">Chưa có đơn hàng</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentOrders.slice(0, 6).map((order, index) => (
                                            <TableRow
                                                key={order.id || index}
                                                hover
                                                sx={{
                                                    '&:hover': { bgcolor: 'grey.50' },
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <span className="font-semibold text-gray-900 text-sm">
                                                        #{order.id || `DH-${10250000 + index}`}
                                                    </span>
                                                </TableCell>
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <StatusBadge status={order.status || 'Hoàn thành'} />
                                                </TableCell>
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <div>
                                                        <span className="text-gray-900 text-xs">
                                                            {formatDate(order.created_at) || '1/10/2024'}
                                                        </span>
                                                        <span className="text-gray-400 text-xs ml-1">
                                                            lúc {formatTime(order.created_at) || '5:12 PM'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <span className="font-bold text-green-600 text-sm">
                                                        {typeof order.total === 'number'
                                                            ? order.total.toLocaleString('vi-VN') + ' ₫'
                                                            : order.total || `${78000 - index * 10000} ₫`}
                                                    </span>
                                                </TableCell>
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <button className="p-1 rounded-md hover:bg-gray-100 transition-colors">
                                                        <Info size={16} className="text-gray-400" />
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}