'use client';
export const dynamic = 'force-dynamic';
import React, { useState } from 'react';
import {
    Box, Paper, Typography, Grid, Card, CardContent, Button, TextField, MenuItem,
    Chip, IconButton, Tooltip, alpha, Tab, Tabs, LinearProgress, Avatar
} from '@mui/material';
import {
    TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart,
    PieChart, BarChart3, LineChart, ArrowUpRight, ArrowDownRight, Calendar,
    RefreshCw, Download, Filter, Eye, ChevronRight, Star, Clock
} from 'lucide-react';

// Mock data
const mockStats = {
    totalRevenue: 856000000,
    totalOrders: 12450,
    totalCustomers: 3280,
    totalProducts: 56,
    avgOrderValue: 68750,
    revenueGrowth: 18.5,
    ordersGrowth: 12.3,
    customersGrowth: 8.7,
};

const mockRevenueByMonth = [
    { month: 'T1', value: 45000000 },
    { month: 'T2', value: 52000000 },
    { month: 'T3', value: 48000000 },
    { month: 'T4', value: 61000000 },
    { month: 'T5', value: 55000000 },
    { month: 'T6', value: 72000000 },
    { month: 'T7', value: 68000000 },
    { month: 'T8', value: 85000000 },
    { month: 'T9', value: 78000000 },
    { month: 'T10', value: 92000000 },
    { month: 'T11', value: 88000000 },
    { month: 'T12', value: 112000000 },
];

const mockCategoryStats = [
    { name: 'Bánh tằm', value: 45, color: '#10b981' },
    { name: 'Đồ uống', value: 25, color: '#3b82f6' },
    { name: 'Món thêm', value: 18, color: '#8b5cf6' },
    { name: 'Tráng miệng', value: 12, color: '#f59e0b' },
];

const mockOrdersByStatus = [
    { status: 'Hoàn thành', value: 8520, color: '#10b981' },
    { status: 'Đang giao', value: 1850, color: '#3b82f6' },
    { status: 'Chờ xác nhận', value: 1280, color: '#f59e0b' },
    { status: 'Đã hủy', value: 800, color: '#ef4444' },
];

const mockTopProducts = [
    { name: 'Bánh tằm bì', orders: 2450, revenue: 98000000 },
    { name: 'Bánh tằm xíu mại', orders: 1980, revenue: 79200000 },
    { name: 'Bánh tằm thập cẩm', orders: 1650, revenue: 82500000 },
    { name: 'Bánh tằm chả cá', orders: 1420, revenue: 56800000 },
    { name: 'Trà đào cam sả', orders: 1280, revenue: 32000000 },
];

const mockRecentActivity = [
    { type: 'order', text: 'Đơn hàng #12450 đã hoàn thành', time: '5 phút trước' },
    { type: 'customer', text: 'Khách hàng mới: Nguyễn Văn A', time: '15 phút trước' },
    { type: 'order', text: 'Đơn hàng #12449 đang giao', time: '30 phút trước' },
    { type: 'product', text: 'Cập nhật giá: Bánh tằm bì', time: '1 giờ trước' },
];

const formatCurrency = (amount) => {
    if (amount >= 1000000000) {
        return (amount / 1000000000).toFixed(1) + ' tỷ';
    }
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + ' tr';
    }
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

// Big Stat Card
const BigStatCard = ({ title, value, change, icon: Icon, color, suffix = '' }) => (
    <Card
        elevation={0}
        sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            height: '100%',
            background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, white 100%)`,
            transition: 'all 0.2s',
            '&:hover': {
                borderColor: color,
                boxShadow: `0 8px 30px ${alpha(color, 0.2)}`,
                transform: 'translateY(-2px)',
            }
        }}
    >
        <CardContent sx={{ p: 3 }}>
            <div className="flex items-start justify-between mb-4">
                <Box sx={{
                    width: 56, height: 56, borderRadius: 3,
                    background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 15px ${alpha(color, 0.4)}`,
                }}>
                    <Icon size={28} color="white" />
                </Box>
                <Chip
                    size="small"
                    icon={change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    label={`${change >= 0 ? '+' : ''}${change}%`}
                    sx={{
                        bgcolor: change >= 0 ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                        color: change >= 0 ? '#059669' : '#dc2626',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        '& .MuiChip-icon': { color: 'inherit' }
                    }}
                />
            </div>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                {typeof value === 'number' ? formatCurrency(value) : value}{suffix}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {title}
            </Typography>
        </CardContent>
    </Card>
);

// Chart Placeholder with visual bars
const BarChartPlaceholder = ({ data, title, color }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    return (
        <Box>
            <Typography sx={{ fontWeight: 600, mb: 2 }}>{title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 150 }}>
                {data.map((item, index) => (
                    <Tooltip key={index} title={`${item.month}: ${formatCurrency(item.value)}`} arrow>
                        <Box sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                        }}>
                            <Box sx={{
                                width: '100%',
                                height: `${(item.value / maxValue) * 120}px`,
                                bgcolor: alpha(color, 0.7 + (index * 0.02)),
                                borderRadius: '4px 4px 0 0',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: color,
                                    transform: 'scaleY(1.05)',
                                }
                            }} />
                            <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.65rem', color: 'text.secondary' }}>
                                {item.month}
                            </Typography>
                        </Box>
                    </Tooltip>
                ))}
            </Box>
        </Box>
    );
};

// Pie Chart Placeholder
const PieChartPlaceholder = ({ data, title }) => {
    const total = data.reduce((acc, d) => acc + d.value, 0);
    let cumulativePercent = 0;

    return (
        <Box>
            <Typography sx={{ fontWeight: 600, mb: 2 }}>{title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {/* Simple visual representation */}
                <Box sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `conic-gradient(${data.map((d, i) => {
                        const start = cumulativePercent;
                        cumulativePercent += (d.value / total) * 100;
                        return `${d.color} ${start}% ${cumulativePercent}%`;
                    }).join(', ')})`,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                }} />

                {/* Legend */}
                <Box sx={{ flex: 1 }}>
                    {data.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: item.color }} />
                            <Typography variant="body2" sx={{ flex: 1 }}>{item.name}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.value}%</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

// Horizontal Bar Chart
const HorizontalBarChart = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    return (
        <Box>
            <Typography sx={{ fontWeight: 600, mb: 2 }}>{title}</Typography>
            {data.map((item, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{item.status}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.value.toLocaleString()}
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={(item.value / maxValue) * 100}
                        sx={{
                            height: 10,
                            borderRadius: 2,
                            bgcolor: alpha(item.color, 0.15),
                            '& .MuiLinearProgress-bar': {
                                bgcolor: item.color,
                                borderRadius: 2
                            }
                        }}
                    />
                </Box>
            ))}
        </Box>
    );
};

export default function StatisticsPage() {
    const [dateRange, setDateRange] = useState('thisMonth');

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Thống kê</h1>
                    <p className="text-sm text-gray-500 mt-1">Tổng quan hoạt động kinh doanh</p>
                </div>
                <div className="flex items-center gap-2">
                    <TextField
                        select
                        size="small"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        sx={{
                            width: 150,
                            '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' }
                        }}
                    >
                        <MenuItem value="today">Hôm nay</MenuItem>
                        <MenuItem value="thisWeek">Tuần này</MenuItem>
                        <MenuItem value="thisMonth">Tháng này</MenuItem>
                        <MenuItem value="thisQuarter">Quý này</MenuItem>
                        <MenuItem value="thisYear">Năm nay</MenuItem>
                    </TextField>
                    <Tooltip title="Làm mới" arrow>
                        <IconButton sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <RefreshCw size={18} />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="contained"
                        startIcon={<Download size={16} />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            bgcolor: '#3b82f6',
                            '&:hover': { bgcolor: '#2563eb' }
                        }}
                    >
                        Xuất báo cáo
                    </Button>
                </div>
            </div>

            {/* Big Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6} md={3}>
                    <BigStatCard
                        title="Tổng doanh thu"
                        value={mockStats.totalRevenue}
                        change={mockStats.revenueGrowth}
                        icon={DollarSign}
                        color="#10b981"
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <BigStatCard
                        title="Tổng đơn hàng"
                        value={mockStats.totalOrders.toLocaleString()}
                        change={mockStats.ordersGrowth}
                        icon={ShoppingCart}
                        color="#3b82f6"
                        suffix=" đơn"
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <BigStatCard
                        title="Khách hàng"
                        value={mockStats.totalCustomers.toLocaleString()}
                        change={mockStats.customersGrowth}
                        icon={Users}
                        color="#8b5cf6"
                        suffix=" người"
                    />
                </Grid>
                <Grid item xs={6} md={3}>
                    <BigStatCard
                        title="Giá trị TB/đơn"
                        value={mockStats.avgOrderValue}
                        change={5.2}
                        icon={TrendingUp}
                        color="#f59e0b"
                    />
                </Grid>
            </Grid>

            {/* Charts Row 1 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Revenue Chart */}
                <Grid item xs={12} md={8}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            height: '100%'
                        }}
                    >
                        <BarChartPlaceholder
                            data={mockRevenueByMonth}
                            title="Doanh thu theo tháng (2024)"
                            color="#10b981"
                        />
                    </Paper>
                </Grid>

                {/* Category Pie Chart */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            height: '100%'
                        }}
                    >
                        <PieChartPlaceholder
                            data={mockCategoryStats}
                            title="Phân bố doanh thu theo danh mục"
                        />
                    </Paper>
                </Grid>
            </Grid>

            {/* Charts Row 2 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Orders by Status */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <HorizontalBarChart
                            data={mockOrdersByStatus}
                            title="Đơn hàng theo trạng thái"
                        />
                    </Paper>
                </Grid>

                {/* Top Products */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Typography sx={{ fontWeight: 600, mb: 2 }}>Top món bán chạy</Typography>
                        {mockTopProducts.map((product, index) => (
                            <Box key={index} sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                py: 1.5,
                                borderBottom: index < mockTopProducts.length - 1 ? '1px solid' : 'none',
                                borderColor: 'divider',
                            }}>
                                <Box sx={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    bgcolor: index < 3 ? ['#fef3c7', '#e5e7eb', '#fed7aa'][index] : '#f1f5f9',
                                    color: index < 3 ? ['#d97706', '#4b5563', '#ea580c'][index] : '#64748b',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '0.75rem',
                                }}>
                                    {index + 1}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {product.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {product.orders.toLocaleString()} đơn
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>
                                    {formatCurrency(product.revenue)}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                {/* Recent Activity */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Typography sx={{ fontWeight: 600, mb: 2 }}>Hoạt động gần đây</Typography>
                        {mockRecentActivity.map((activity, index) => (
                            <Box key={index} sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 2,
                                py: 1.5,
                                borderBottom: index < mockRecentActivity.length - 1 ? '1px solid' : 'none',
                                borderColor: 'divider',
                            }}>
                                <Box sx={{
                                    width: 32, height: 32, borderRadius: 2,
                                    bgcolor: activity.type === 'order' ? alpha('#3b82f6', 0.1) :
                                        activity.type === 'customer' ? alpha('#10b981', 0.1) :
                                            alpha('#8b5cf6', 0.1),
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {activity.type === 'order' ? <ShoppingCart size={16} color="#3b82f6" /> :
                                        activity.type === 'customer' ? <Users size={16} color="#10b981" /> :
                                            <Package size={16} color="#8b5cf6" />}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2">{activity.text}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Clock size={10} /> {activity.time}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
            </Grid>

            {/* Quick Insights */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    background: 'linear-gradient(135deg, #f8fafc 0%, white 100%)',
                }}
            >
                <Typography sx={{ fontWeight: 600, mb: 3 }}>💡 Insights nhanh</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <Box sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha('#10b981', 0.1),
                            border: '1px solid',
                            borderColor: alpha('#10b981', 0.2),
                        }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                📈 Doanh thu tháng này <strong>tăng 18.5%</strong> so với tháng trước
                            </Typography>
                            <Button size="small" sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}>
                                Xem chi tiết →
                            </Button>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Box sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha('#3b82f6', 0.1),
                            border: '1px solid',
                            borderColor: alpha('#3b82f6', 0.2),
                        }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                🛒 <strong>Bánh tằm bì</strong> là món bán chạy nhất với 2,450 đơn
                            </Typography>
                            <Button size="small" sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}>
                                Xem chi tiết →
                            </Button>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Box sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha('#f59e0b', 0.1),
                            border: '1px solid',
                            borderColor: alpha('#f59e0b', 0.2),
                        }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                ⏰ Khung giờ <strong>11h-13h</strong> có lượng đơn cao nhất
                            </Typography>
                            <Button size="small" sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}>
                                Xem chi tiết →
                            </Button>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Box sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha('#8b5cf6', 0.1),
                            border: '1px solid',
                            borderColor: alpha('#8b5cf6', 0.2),
                        }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                👥 <strong>156 khách mới</strong> trong tuần này
                            </Typography>
                            <Button size="small" sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}>
                                Xem chi tiết →
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}
