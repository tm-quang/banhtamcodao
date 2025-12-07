/**
 * Admin dashboard page - ENHANCED VERSION
 * @file src/app/(admin)/page.js
 */
'use client';

import * as React from 'react';
import { Card, CardContent, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Box, MenuItem, Select, FormControl, InputLabel, Divider, Stack, Avatar, LinearProgress, alpha, useMediaQuery, useTheme, Skeleton } from '@mui/material';
import { BarChart, LineChart, PieChart } from '@mui/x-charts';
import { DollarSign, ShoppingCart, CheckCircle2, XCircle, Utensils, Layers, CalendarRange, CalendarDays, CalendarCheck2, Calendar, TrendingUp, TrendingDown, Users, Package, Activity, Clock, Truck, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * Format currency to VND
 */
const formatCurrency = (amount) => {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M ₫`;
    }
    if (amount >= 1000) {
        return `${Math.round(amount / 1000)}K ₫`;
    }
    return `${amount.toLocaleString('vi-VN')} ₫`;
};

/**
 * Enhanced StatCard with growth indicator
 */
const StatCard = ({ title, value, icon, color, growth, showGrowth = false }) => {
    const isPositive = growth >= 0;
    const GrowthIcon = isPositive ? ArrowUpRight : ArrowDownRight;

    return (
        <Card sx={{
            display: 'flex',
            alignItems: 'center',
            p: { xs: 2, sm: 2.5 },
            height: { xs: 'auto', sm: 120 },
            minHeight: { xs: 100, sm: 120 },
            width: '100%',
            mx: 'auto',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
            border: `1px solid ${alpha(color, 0.2)}`,
            '&:hover': {
                boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
                transform: 'translateY(-4px)',
                border: `1px solid ${alpha(color, 0.4)}`,
            },
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                backgroundColor: color,
            }
        }}>
            <Box sx={{
                p: { xs: 1.5, sm: 2.5 },
                borderRadius: '12px',
                mr: { xs: 1.5, sm: 2 },
                color: '#fff',
                background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${alpha(color, 0.4)}`,
                transition: 'all 0.3s ease',
                flexShrink: 0,
                '&:hover': {
                    transform: 'scale(1.1) rotate(5deg)',
                }
            }}>
                {icon}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    color="text.secondary"
                    gutterBottom
                    sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {title}
                </Typography>
                <Typography
                    variant="h5"
                    component="div"
                    sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        mb: showGrowth ? 0.5 : 0,
                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                >
                    {value}
                </Typography>
                {showGrowth && growth !== undefined && (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mt: 0.5
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: isPositive ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                        }}>
                            <GrowthIcon size={14} style={{ color: isPositive ? '#10b981' : '#ef4444' }} />
                            <Typography
                                variant="caption"
                                sx={{
                                    color: isPositive ? '#10b981' : '#ef4444',
                                    fontWeight: 700,
                                    fontSize: '0.75rem'
                                }}
                            >
                                {isPositive ? '+' : ''}{growth}%
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            vs kỳ trước
                        </Typography>
                    </Box>
                )}
            </Box>
        </Card>
    );
};

/**
 * Recent Activity Item Component
 */
const ActivityItem = ({ activity, isLast }) => (
    <Box sx={{
        display: 'flex',
        gap: 2,
        pb: isLast ? 0 : 2,
        borderLeft: isLast ? 'none' : '2px solid',
        borderColor: 'divider',
        ml: 1.5,
        pl: 2,
        position: 'relative',
        '&::before': {
            content: '""',
            position: 'absolute',
            left: -6,
            top: 4,
            width: 10,
            height: 10,
            borderRadius: '50%',
            bgcolor: activity.type === 'completed' ? '#10b981' :
                activity.type === 'cancelled' ? '#ef4444' :
                    activity.type === 'shipping' ? '#3b82f6' : '#f59e0b',
            border: '2px solid #fff',
            boxShadow: '0 0 0 2px rgba(0,0,0,0.1)'
        }
    }}>
        <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.25 }}>
                <span style={{ marginRight: 8 }}>{activity.icon}</span>
                {activity.message}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                    {activity.time}
                </Typography>
                {activity.amount && (
                    <>
                        <Typography variant="caption" color="text.secondary">•</Typography>
                        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                            {activity.amount}
                        </Typography>
                    </>
                )}
            </Stack>
        </Box>
    </Box>
);

export default function DashboardPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const [month, setMonth] = React.useState(new Date().getMonth() + 1);
    const [year, setYear] = React.useState(new Date().getFullYear());
    const [chartWidth, setChartWidth] = React.useState(800);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [dailyRevenueK, setDailyRevenueK] = React.useState([]);
    const [dailyOrders, setDailyOrders] = React.useState([]);
    const [days, setDays] = React.useState([]);

    // Enhanced state
    const [recentOrders, setRecentOrders] = React.useState([]);
    const [newCustomers, setNewCustomers] = React.useState([]);
    const [topProducts, setTopProducts] = React.useState([]);
    const [kpiStats, setKpiStats] = React.useState({});
    const [categoryDistribution, setCategoryDistribution] = React.useState([]);
    const [recentActivities, setRecentActivities] = React.useState([]);
    const [revenueTrend, setRevenueTrend] = React.useState([]);
    const [dataLoading, setDataLoading] = React.useState(true);

    const chartContainerRef = React.useRef(null);
    const lineChartRef = React.useRef(null);
    const [lineChartWidth, setLineChartWidth] = React.useState(700);

    // Fetch enhanced dashboard data
    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setDataLoading(true);
                const response = await fetch('/api/admin/dashboard/data');
                const result = await response.json();

                if (result.success) {
                    setRecentOrders(result.data.recentOrders || []);
                    setNewCustomers(result.data.newCustomers || []);
                    setTopProducts(result.data.topProducts || []);
                    setKpiStats(result.data.kpiStats || {});
                    setCategoryDistribution(result.data.categoryDistribution || []);
                    setRecentActivities(result.data.recentActivities || []);
                    setRevenueTrend(result.data.revenueTrend || []);
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setDataLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Fetch chart data
    React.useEffect(() => {
        const fetchChartData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/admin/dashboard/stats?month=${month}&year=${year}`);
                const result = await response.json();

                if (result.success) {
                    setDays(result.data.days);
                    setDailyRevenueK(result.data.dailyRevenueK);
                    setDailyOrders(result.data.dailyOrders);
                } else {
                    setError(result.message || 'Không thể tải dữ liệu');
                    const daysInMonth = new Date(year, month, 0).getDate();
                    setDays(Array.from({ length: daysInMonth }, (_, i) => i + 1));
                    setDailyRevenueK(Array(daysInMonth).fill(0));
                    setDailyOrders(Array(daysInMonth).fill(0));
                }
            } catch (err) {
                console.error('Error fetching chart data:', err);
                setError('Lỗi khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [month, year]);

    // Update chart widths
    React.useEffect(() => {
        const updateChartWidth = () => {
            if (chartContainerRef.current) {
                const containerWidth = chartContainerRef.current.clientWidth;
                setChartWidth(Math.min(containerWidth, window.innerWidth - 100));
            }
            if (lineChartRef.current) {
                setLineChartWidth(lineChartRef.current.clientWidth - 32);
            }
        };

        const timeoutId = setTimeout(updateChartWidth, 100);
        window.addEventListener('resize', updateChartWidth);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', updateChartWidth);
        };
    }, [month, year, days]);

    return (
        <Box sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            bgcolor: '#f8fafc',
            minHeight: '100vh'
        }}>
            {/* ROW 1: 6 KPI Cards */}
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: '100%', mb: 3 }}>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                        title="Đơn hàng"
                        value={dataLoading ? '...' : kpiStats.totalOrders?.value || 0}
                        icon={<ShoppingCart size={22} />}
                        color="#2563eb"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                        title="Đơn trong tháng"
                        value={dataLoading ? '...' : kpiStats.monthlyOrders?.value || 0}
                        icon={<CalendarRange size={22} />}
                        color="#7c3aed"
                        growth={kpiStats.monthlyOrders?.growth}
                        showGrowth={true}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                        title="Đã giao thành công"
                        value={dataLoading ? '...' : kpiStats.completedOrders?.value || 0}
                        icon={<CheckCircle2 size={22} />}
                        color="#10b981"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                        title="Đã hủy"
                        value={dataLoading ? '...' : kpiStats.cancelledOrders?.value || 0}
                        icon={<XCircle size={22} />}
                        color="#ef4444"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                        title="Tổng món ăn"
                        value={dataLoading ? '...' : kpiStats.productCount?.value || 0}
                        icon={<Utensils size={22} />}
                        color="#0ea5e9"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard
                        title="Danh mục"
                        value={dataLoading ? '...' : kpiStats.categoryCount?.value || 0}
                        icon={<Layers size={22} />}
                        color="#f59e0b"
                    />
                </Grid>
            </Grid>

            {/* ROW 2: 4 Revenue Cards with Growth */}
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: '100%', mb: 3 }}>
                <Grid item xs={12} sm={6} md={6} lg={3}>
                    <StatCard
                        title="Tổng doanh thu"
                        value={dataLoading ? '...' : formatCurrency(kpiStats.totalRevenue?.value || 0)}
                        icon={<DollarSign size={22} />}
                        color="#16a34a"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={3}>
                    <StatCard
                        title="Doanh thu tháng"
                        value={dataLoading ? '...' : formatCurrency(kpiStats.monthlyRevenue?.value || 0)}
                        icon={<CalendarDays size={22} />}
                        color="#22c55e"
                        growth={kpiStats.monthlyRevenue?.growth}
                        showGrowth={true}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={3}>
                    <StatCard
                        title="Doanh thu tuần"
                        value={dataLoading ? '...' : formatCurrency(kpiStats.weeklyRevenue?.value || 0)}
                        icon={<CalendarCheck2 size={22} />}
                        color="#059669"
                        growth={kpiStats.weeklyRevenue?.growth}
                        showGrowth={true}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={3}>
                    <StatCard
                        title="Doanh thu ngày"
                        value={dataLoading ? '...' : formatCurrency(kpiStats.dailyRevenue?.value || 0)}
                        icon={<Calendar size={22} />}
                        color="#34d399"
                        growth={kpiStats.dailyRevenue?.growth}
                        showGrowth={true}
                    />
                </Grid>
            </Grid>

            {/* ROW 3: Line Chart + Pie Chart */}
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: '100%', mb: 3 }}>
                {/* Line Chart - Revenue Trend */}
                <Grid item xs={12} md={9}>
                    <Card ref={lineChartRef} sx={{
                        height: '100%',
                        minHeight: 550,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
                                <Box sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    bgcolor: alpha('#2563eb', 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <TrendingUp size={20} style={{ color: '#2563eb' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                        Xu hướng doanh thu 7 ngày
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Đơn vị: nghìn đồng (K)
                                    </Typography>
                                </Box>
                            </Stack>
                            <Box sx={{ height: 450, width: '100%' }}>
                                {dataLoading ? (
                                    <Skeleton variant="rectangular" width="100%" height={450} sx={{ borderRadius: 2 }} />
                                ) : revenueTrend.length > 0 ? (
                                    <LineChart
                                        xAxis={[{
                                            scaleType: 'point',
                                            data: revenueTrend.map(d => d.date),
                                            tickLabelStyle: { fontSize: 13, fontWeight: 600, fill: '#374151' }
                                        }]}
                                        series={[{
                                            data: revenueTrend.map(d => d.revenue),
                                            color: '#2563eb',
                                            area: true,
                                            curve: 'catmullRom',
                                            showMark: true,
                                            valueFormatter: (v) => `${v}K ₫`
                                        }]}
                                        width={lineChartWidth > 0 ? lineChartWidth : 700}
                                        height={450}
                                        margin={{ left: 60, right: 30, top: 30, bottom: 50 }}
                                        sx={{
                                            '& .MuiAreaElement-root': {
                                                fill: 'url(#gradient)',
                                            }
                                        }}
                                    />
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                        <Typography color="text.secondary">Không có dữ liệu</Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Pie Chart - Category Distribution */}
                <Grid item xs={12} md={3}>
                    <Card sx={{
                        height: '100%',
                        minHeight: 550,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
                                <Box sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    bgcolor: alpha('#f59e0b', 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Layers size={20} style={{ color: '#f59e0b' }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                    Phân bố danh mục
                                </Typography>
                            </Stack>
                            <Box sx={{ height: 450, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {dataLoading ? (
                                    <Skeleton variant="circular" width={300} height={300} />
                                ) : categoryDistribution.length > 0 ? (
                                    <PieChart
                                        series={[{
                                            data: categoryDistribution.map((item, index) => ({
                                                id: index,
                                                value: item.value,
                                                label: item.name,
                                                color: item.color
                                            })),
                                            highlightScope: { fade: 'global', highlight: 'item' },
                                            innerRadius: 70,
                                            outerRadius: 130,
                                            paddingAngle: 3,
                                            cornerRadius: 6,
                                        }]}
                                        width={320}
                                        height={320}
                                        slotProps={{
                                            legend: {
                                                direction: 'column',
                                                position: { vertical: 'middle', horizontal: 'right' },
                                                padding: 0,
                                                itemMarkWidth: 10,
                                                itemMarkHeight: 10,
                                                markGap: 5,
                                                itemGap: 8,
                                                labelStyle: { fontSize: 11 }
                                            }
                                        }}
                                    />
                                ) : (
                                    <Typography color="text.secondary">Không có dữ liệu</Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ROW 4: Recent Orders, New Customers, Top Products */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, sm: 2.5, md: 3 },
                mb: 3,
                width: '100%'
            }}>
                {/* Recent Orders */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Card sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}>
                        <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                            <Box sx={{
                                p: { xs: 2, sm: 2.5 },
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                            }}>
                                <Stack direction="row" alignItems="center" gap={1.5}>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#2563eb', 0.1) }}>
                                        <ShoppingCart size={20} style={{ color: '#2563eb' }} />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                        Đơn hàng mới nhất
                                    </Typography>
                                </Stack>
                            </Box>
                            <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Mã ĐH</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Khách hàng</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Tổng tiền</TableCell>
                                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Trạng thái</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {dataLoading ? (
                                            [1, 2, 3, 4, 5].map(i => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton width="60%" /></TableCell>
                                                    <TableCell><Skeleton width="40%" /></TableCell>
                                                    <TableCell><Skeleton width="30%" /></TableCell>
                                                    <TableCell><Skeleton width={60} height={24} /></TableCell>
                                                </TableRow>
                                            ))
                                        ) : recentOrders.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">Không có dữ liệu</TableCell>
                                            </TableRow>
                                        ) : (
                                            recentOrders.map((row) => (
                                                <TableRow key={row.id} hover>
                                                    <TableCell sx={{ fontWeight: 600, color: '#2563eb', fontSize: '0.75rem' }}>{row.id}</TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                            <Avatar sx={{ width: 24, height: 24, bgcolor: alpha('#2563eb', 0.1), color: '#2563eb', fontSize: '0.7rem' }}>
                                                                {row.customer?.charAt(0)?.toUpperCase() || 'N'}
                                                            </Avatar>
                                                            <Typography variant="body2" sx={{ fontSize: '0.75rem', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {row.customer}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>{row.total}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={row.status}
                                                            color={row.status === 'Hoàn thành' || row.status === 'Đã giao' ? 'success' : 'default'}
                                                            size="small"
                                                            sx={{ fontSize: '0.65rem', height: 20 }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Box>

                {/* New Customers */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Card sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#7c3aed', 0.1) }}>
                                    <Users size={20} style={{ color: '#7c3aed' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                        Khách hàng mới
                                    </Typography>
                                    {kpiStats.newCustomers && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {kpiStats.newCustomers.value} tuần này
                                            </Typography>
                                            {kpiStats.newCustomers.growth !== undefined && (
                                                <Chip
                                                    label={`${kpiStats.newCustomers.growth >= 0 ? '+' : ''}${kpiStats.newCustomers.growth}%`}
                                                    size="small"
                                                    sx={{
                                                        height: 18,
                                                        fontSize: '0.65rem',
                                                        bgcolor: kpiStats.newCustomers.growth >= 0 ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                                        color: kpiStats.newCustomers.growth >= 0 ? '#10b981' : '#ef4444'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Stack>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, overflowY: 'auto' }}>
                                {dataLoading ? (
                                    [1, 2, 3].map(i => (
                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Skeleton variant="circular" width={36} height={36} />
                                            <Box sx={{ flex: 1 }}>
                                                <Skeleton width="60%" height={20} />
                                                <Skeleton width="40%" height={16} />
                                            </Box>
                                        </Box>
                                    ))
                                ) : newCustomers.length === 0 ? (
                                    <Typography color="text.secondary" align="center">Không có dữ liệu</Typography>
                                ) : (
                                    newCustomers.map((customer, index) => (
                                        <Box key={index} sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            p: 1,
                                            borderRadius: 2,
                                            '&:hover': { bgcolor: alpha('#7c3aed', 0.05) }
                                        }}>
                                            <Avatar sx={{
                                                width: 36,
                                                height: 36,
                                                bgcolor: alpha('#7c3aed', 0.1),
                                                color: '#7c3aed',
                                                fontWeight: 700,
                                                fontSize: '0.875rem'
                                            }}>
                                                {customer.name?.charAt(0)?.toUpperCase() || 'N'}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{customer.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{customer.phone}</Typography>
                                            </Box>
                                        </Box>
                                    ))
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Top Products */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Card sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
                                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#f59e0b', 0.1) }}>
                                    <Package size={20} style={{ color: '#f59e0b' }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                    Top 5 món bán chạy
                                </Typography>
                            </Stack>
                            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                                {dataLoading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                                            <Skeleton variant="circular" width={32} height={32} />
                                            <Box sx={{ flex: 1 }}>
                                                <Skeleton width="70%" height={18} />
                                                <Skeleton width="100%" height={4} sx={{ mt: 0.5 }} />
                                            </Box>
                                            <Skeleton width={50} height={22} />
                                        </Box>
                                    ))
                                ) : topProducts.length === 0 ? (
                                    <Typography color="text.secondary" align="center">Không có dữ liệu</Typography>
                                ) : (
                                    topProducts.map((p, i) => {
                                        const maxSold = Math.max(...topProducts.map(tp => tp.sold || 0), 1);
                                        const percentage = ((p.sold || 0) / maxSold) * 100;
                                        const rankColors = ['#fbbf24', '#94a3b8', '#f59e0b', '#64748b', '#d97706'];
                                        return (
                                            <Box key={i} sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.5,
                                                p: 1,
                                                borderRadius: 2,
                                                '&:hover': { bgcolor: alpha('#f59e0b', 0.05) }
                                            }}>
                                                <Box sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    bgcolor: alpha(rankColors[i], 0.1),
                                                    color: rankColors[i],
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 700,
                                                    fontSize: '0.875rem',
                                                    border: `2px solid ${alpha(rankColors[i], 0.3)}`
                                                }}>
                                                    {i + 1}
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{p.name}</Typography>
                                                    <Box sx={{ width: '100%', height: 4, borderRadius: 2, bgcolor: alpha('#f59e0b', 0.1) }}>
                                                        <Box sx={{
                                                            width: `${percentage}%`,
                                                            height: '100%',
                                                            bgcolor: rankColors[i],
                                                            borderRadius: 2
                                                        }} />
                                                    </Box>
                                                </Box>
                                                <Chip
                                                    label={`${p.sold} đơn`}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: '0.7rem',
                                                        height: 22,
                                                        bgcolor: alpha(rankColors[i], 0.1),
                                                        color: rankColors[i]
                                                    }}
                                                />
                                            </Box>
                                        );
                                    })
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* ROW 5: Recent Activities + Bar Chart */}
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: '100%' }}>
                {/* Recent Activities */}
                <Grid item xs={12} md={4}>
                    <Card sx={{
                        height: '100%',
                        minHeight: 400,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                            <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2.5 }}>
                                <Box sx={{
                                    p: 1,
                                    borderRadius: 2,
                                    bgcolor: alpha('#8b5cf6', 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Activity size={20} style={{ color: '#8b5cf6' }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                    Hoạt động gần đây
                                </Typography>
                            </Stack>
                            <Box sx={{ maxHeight: 320, overflowY: 'auto', pr: 1 }}>
                                {dataLoading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                            <Skeleton variant="circular" width={10} height={10} />
                                            <Box sx={{ flex: 1 }}>
                                                <Skeleton width="80%" height={18} />
                                                <Skeleton width="40%" height={14} />
                                            </Box>
                                        </Box>
                                    ))
                                ) : recentActivities.length === 0 ? (
                                    <Typography color="text.secondary" align="center">Không có hoạt động</Typography>
                                ) : (
                                    recentActivities.slice(0, 10).map((activity, index) => (
                                        <ActivityItem
                                            key={index}
                                            activity={activity}
                                            isLast={index === Math.min(recentActivities.length, 10) - 1}
                                        />
                                    ))
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Bar Chart - Daily Revenue & Orders */}
                <Grid item xs={12} md={8}>
                    <Card sx={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                alignItems={{ xs: 'flex-start', md: 'center' }}
                                justifyContent="space-between"
                                spacing={{ xs: 2, md: 0 }}
                                sx={{ mb: 2 }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                    Doanh thu và số đơn theo ngày
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <FormControl size="small" sx={{ minWidth: 100 }}>
                                        <InputLabel>Tháng</InputLabel>
                                        <Select
                                            label="Tháng"
                                            value={month}
                                            onChange={(e) => setMonth(e.target.value)}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            {Array.from({ length: 12 }).map((_, i) => (
                                                <MenuItem key={i + 1} value={i + 1}>{`Tháng ${i + 1}`}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl size="small" sx={{ minWidth: 100 }}>
                                        <InputLabel>Năm</InputLabel>
                                        <Select
                                            label="Năm"
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            {[year - 1, year, year + 1].map(y => (
                                                <MenuItem key={y} value={y}>{y}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Stack>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            {/* Legend */}
                            <Box sx={{ display: 'flex', gap: 3, mb: 2, p: 1, borderRadius: 2, bgcolor: alpha('#f3f4f6', 0.5) }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 14, height: 14, bgcolor: '#ea580c', borderRadius: 0.5 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Doanh thu (K)</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 14, height: 14, bgcolor: '#6366f1', borderRadius: 0.5 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Số đơn</Typography>
                                </Box>
                            </Box>
                            <Box ref={chartContainerRef} sx={{ height: { xs: 280, sm: 320, md: 350 }, width: '100%' }}>
                                {loading ? (
                                    <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
                                ) : error ? (
                                    <Typography color="error" align="center">{error}</Typography>
                                ) : days.length > 0 ? (
                                    <BarChart
                                        xAxis={[{
                                            scaleType: 'band',
                                            data: days,
                                            label: 'Ngày',
                                            tickLabelStyle: { fontSize: 10 }
                                        }]}
                                        series={[
                                            { data: dailyRevenueK, color: '#ea580c', label: 'Doanh thu (K)', valueFormatter: (v) => `${v}K` },
                                            { data: dailyOrders, color: '#6366f1', label: 'Số đơn' }
                                        ]}
                                        width={chartWidth}
                                        height={isMobile ? 260 : isTablet ? 300 : 330}
                                        slotProps={{ legend: { hidden: true } }}
                                    />
                                ) : (
                                    <Typography color="text.secondary" align="center">Không có dữ liệu</Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}