// src/app/(admin)/dashboard/page.js
'use client';

import * as React from 'react';
import { Card, CardContent, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Box, MenuItem, Select, FormControl, InputLabel, Divider, Stack, Avatar, LinearProgress, alpha, useMediaQuery, useTheme, Skeleton } from '@mui/material';
import { BarChart } from '@mui/x-charts';
import { DollarSign, ShoppingCart, CheckCircle2, XCircle, Utensils, Layers, CalendarRange, CalendarDays, CalendarCheck2, Calendar, TrendingUp, Users, Package } from 'lucide-react';

const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
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
                    mb: trend ? 0.5 : 0,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}
            >
                {value}
            </Typography>
            {trend && trendValue && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <TrendingUp size={14} style={{ color: '#10b981' }} />
                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                        {trendValue}
                    </Typography>
                </Box>
            )}
        </Box>
    </Card>
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
    
    // State cho dữ liệu dashboard
    const [recentOrders, setRecentOrders] = React.useState([]);
    const [newCustomers, setNewCustomers] = React.useState([]);
    const [topProducts, setTopProducts] = React.useState([]);
    const [dataLoading, setDataLoading] = React.useState(true);
    
    const chartContainerRef = React.useRef(null);
    const months = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
    
    // Fetch dữ liệu dashboard (orders, customers, products)
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
                } else {
                    // Fallback về dữ liệu rỗng
                    setRecentOrders([]);
                    setNewCustomers([]);
                    setTopProducts([]);
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setRecentOrders([]);
                setNewCustomers([]);
                setTopProducts([]);
            } finally {
                setDataLoading(false);
            }
        };
        
        fetchDashboardData();
    }, []);
    
    // Fetch dữ liệu biểu đồ từ API
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
                    // Fallback về dữ liệu rỗng
                    const daysInMonth = new Date(year, month, 0).getDate();
                    setDays(Array.from({ length: daysInMonth }, (_, i) => i + 1));
                    setDailyRevenueK(Array(daysInMonth).fill(0));
                    setDailyOrders(Array(daysInMonth).fill(0));
                }
            } catch (err) {
                console.error('Error fetching chart data:', err);
                setError('Lỗi khi tải dữ liệu');
                // Fallback về dữ liệu rỗng
                const daysInMonth = new Date(year, month, 0).getDate();
                setDays(Array.from({ length: daysInMonth }, (_, i) => i + 1));
                setDailyRevenueK(Array(daysInMonth).fill(0));
                setDailyOrders(Array(daysInMonth).fill(0));
            } finally {
                setLoading(false);
            }
        };
        
        fetchChartData();
    }, [month, year]);
    
    React.useEffect(() => {
        const updateChartWidth = () => {
            if (chartContainerRef.current) {
                // Lấy chiều rộng thực tế của container (không bao gồm padding)
                const containerWidth = chartContainerRef.current.clientWidth;
                // Giới hạn chiều rộng tối đa bằng chiều rộng container
                setChartWidth(Math.min(containerWidth, window.innerWidth - 100));
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
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: '100%', position: 'relative' }}>
            {/* ROW 1: 6 cards - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop, 6 cols large */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard title="Đơn hàng" value="0" icon={<ShoppingCart size={22} />} color="#2563eb" />
                    </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard title="Đơn hàng trong tháng" value="0" icon={<CalendarRange size={22} />} color="#7c3aed" />
                    </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard title="Đã giao thành công" value="0" icon={<CheckCircle2 size={22} />} color="#10b981" />
                    </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard title="Đã hủy" value="0" icon={<XCircle size={22} />} color="#ef4444" />
                    </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard title="Tổng món ăn" value="0" icon={<Utensils size={22} />} color="#0ea5e9" />
                    </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
                        <StatCard title="Danh mục" value="0" icon={<Layers size={22} />} color="#f59e0b" />
            </Grid>

            {/* ROW 2: 4 cards - Responsive: 1 col mobile, 2 cols tablet, 2 cols desktop, 3 cols large (căn giữa) */}
            <Grid item xs={12} sm={6} md={6} lg={3}>
                        <StatCard title="Tổng doanh thu" value="0 đ" icon={<DollarSign size={22} />} color="#16a34a" />
                    </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
                        <StatCard title="Doanh thu tháng" value="0 đ" icon={<CalendarDays size={22} />} color="#22c55e" />
                    </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
                        <StatCard title="Doanh thu tuần" value="0 đ" icon={<CalendarCheck2 size={22} />} color="#059669" />
                    </Grid>
            <Grid item xs={12} sm={6} md={6} lg={3}>
                        <StatCard title="Doanh thu ngày" value="0 đ" icon={<Calendar size={22} />} color="#34d399" />
                    </Grid>
        </Grid>

        {/* Hàng 3: Đơn hàng mới nhất, Khách hàng mới, Top món bán chạy - Cùng 1 hàng, chia đều */}
        <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, sm: 2.5, md: 3 },
            mt: { xs: 2, sm: 2.5, md: 3 },
            width: '100%'
        }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Card sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    }
                }}>
                    <CardContent sx={{ 
                        p: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ 
                            p: { xs: 2, sm: 2.5 }, 
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                            flexShrink: 0
                        }}>
                            <Stack direction="row" alignItems="center" gap={1.5}>
                                <Box sx={{ 
                                    p: { xs: 0.75, sm: 1 }, 
                                    borderRadius: 2, 
                                    bgcolor: alpha('#2563eb', 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <ShoppingCart size={20} style={{ color: '#2563eb' }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                    Đơn hàng mới nhất
                                </Typography>
                            </Stack>
                        </Box>
                        <TableContainer sx={{ 
                            flex: 1,
                            overflowY: 'auto',
                            overflowX: 'auto',
                            '&::-webkit-scrollbar': {
                                width: 6,
                                height: 6,
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: alpha('#000', 0.2),
                                borderRadius: 3,
                            }
                        }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: alpha('#f3f4f6', 0.5) }}>
                                        <TableCell sx={{ 
                                            fontWeight: 700, 
                                            color: 'text.primary',
                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                            py: { xs: 0.75, sm: 1 },
                                            whiteSpace: 'nowrap'
                                        }}>Mã ĐH</TableCell>
                                        <TableCell sx={{ 
                                            fontWeight: 700, 
                                            color: 'text.primary',
                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                            py: { xs: 0.75, sm: 1 }
                                        }}>Khách hàng</TableCell>
                                        <TableCell sx={{ 
                                            fontWeight: 700, 
                                            color: 'text.primary',
                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                            py: { xs: 0.75, sm: 1 }
                                        }}>Tổng tiền</TableCell>
                                        <TableCell sx={{ 
                                            fontWeight: 700, 
                                            color: 'text.primary',
                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                            py: { xs: 0.75, sm: 1 }
                                        }}>Trạng thái</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dataLoading ? (
                                        <>
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                                                    <TableCell><Skeleton variant="text" width="40%" /></TableCell>
                                                    <TableCell><Skeleton variant="text" width="30%" /></TableCell>
                                                    <TableCell><Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} /></TableCell>
                                                </TableRow>
                                            ))}
                                        </>
                                    ) : recentOrders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Không có dữ liệu
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentOrders.map((row, index) => (
                                        <TableRow 
                                            key={row.id} 
                                            hover
                                            sx={{ 
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    bgcolor: alpha('#2563eb', 0.04),
                                                    transform: 'scale(1.01)',
                                                },
                                                '&:last-child td': { borderBottom: 0 }
                                            }}
                                        >
                                            <TableCell sx={{ 
                                                fontWeight: 600, 
                                                color: '#2563eb',
                                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                py: { xs: 0.75, sm: 1 },
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {row.id}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                    <Avatar sx={{ 
                                                        width: { xs: 24, sm: 28 }, 
                                                        height: { xs: 24, sm: 28 }, 
                                                        bgcolor: alpha('#2563eb', 0.1), 
                                                        color: '#2563eb', 
                                                        fontSize: { xs: '0.7rem', sm: '0.75rem' }, 
                                                        fontWeight: 600 
                                                    }}>
                                                        {row.customer?.charAt(0)?.toUpperCase() || 'N'}
                                                    </Avatar>
                                                    <Typography variant="body2" sx={{ 
                                                        fontWeight: 500,
                                                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        maxWidth: { xs: 60, sm: 100 }
                                                    }}>
                                                        {row.customer}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ 
                                                fontWeight: 600, 
                                                color: 'text.primary',
                                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {row.total}
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={row.status} 
                                                    color={row.status === 'Hoàn thành' || row.status === 'Đã giao' ? 'success' : 'default'} 
                                                    size="small"
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                                        height: { xs: 18, sm: 22 },
                                                        boxShadow: `0 2px 4px ${alpha('#10b981', 0.2)}`
                                                    }}
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
            
            {/* Khách hàng mới nhất */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Card sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    }
                }}>
                    <CardContent sx={{ 
                        p: { xs: 2, sm: 2.5 }, 
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        overflow: 'hidden'
                    }}>
                        <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: { xs: 2, sm: 2.5 } }}>
                            <Box sx={{ 
                                p: { xs: 0.75, sm: 1 }, 
                                borderRadius: 2, 
                                bgcolor: alpha('#7c3aed', 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Users size={20} style={{ color: '#7c3aed' }} />
                            </Box>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 700,
                                fontSize: { xs: '1rem', sm: '1.25rem' }
                            }}>
                                Khách hàng mới nhất
                            </Typography>
                        </Stack>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: { xs: 1.5, sm: 2 },
                            flex: 1,
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': {
                                width: 6,
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: alpha('#000', 0.2),
                                borderRadius: 3,
                            }
                        }}>
                            {dataLoading ? (
                                <Box sx={{ py: 2, px: 2 }}>
                                    {[1, 2, 3].map((i) => (
                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <Skeleton variant="circular" width={36} height={36} />
                                            <Box sx={{ flex: 1 }}>
                                                <Skeleton variant="text" width="60%" height={20} />
                                                <Skeleton variant="text" width="40%" height={16} />
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            ) : newCustomers.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Không có dữ liệu
                                    </Typography>
                                </Box>
                            ) : (
                                newCustomers.map((customer, index) => (
                                    <Box 
                                        key={index} 
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: { xs: 1.5, sm: 2 },
                                            p: { xs: 1, sm: 1.5 },
                                            borderRadius: 2,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                bgcolor: alpha('#7c3aed', 0.05),
                                                ...(isMobile ? {} : { transform: 'translateX(4px)' }),
                                            }
                                        }}
                                    >
                                        <Avatar sx={{ 
                                            width: { xs: 32, sm: 36 }, 
                                            height: { xs: 32, sm: 36 }, 
                                            bgcolor: `linear-gradient(135deg, ${alpha('#7c3aed', 0.2)} 0%, ${alpha('#7c3aed', 0.1)} 100%)`,
                                            color: '#7c3aed',
                                            fontWeight: 700,
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                            boxShadow: `0 2px 8px ${alpha('#7c3aed', 0.2)}`
                                        }}>
                                            {customer.name?.charAt(0)?.toUpperCase() || 'N'}
                                        </Avatar>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="body2" sx={{ 
                                                fontWeight: 600, 
                                                mb: 0.25,
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {customer.name || 'N/A'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 0.5,
                                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                            }}>
                                                {customer.phone || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Box>
            
            {/* Top 5 món bán chạy */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Card sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    }
                }}>
                    <CardContent sx={{ 
                        p: { xs: 2, sm: 2.5 }, 
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        overflow: 'hidden'
                    }}>
                        <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: { xs: 2, sm: 2.5 } }}>
                            <Box sx={{ 
                                p: { xs: 0.75, sm: 1 }, 
                                borderRadius: 2, 
                                bgcolor: alpha('#f59e0b', 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Package size={20} style={{ color: '#f59e0b' }} />
                            </Box>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 700,
                                fontSize: { xs: '1rem', sm: '1.25rem' }
                            }}>
                                Top 5 món bán chạy
                            </Typography>
                        </Stack>
                        <TableContainer sx={{
                            flex: 1,
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': {
                                width: 6,
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: alpha('#000', 0.2),
                                borderRadius: 3,
                            }
                        }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: alpha('#f3f4f6', 0.5) }}>
                                        <TableCell sx={{ 
                                            fontWeight: 700, 
                                            color: 'text.primary', 
                                            width: { xs: 50, sm: 60 },
                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                            py: { xs: 0.75, sm: 1 }
                                        }}>#</TableCell>
                                        <TableCell sx={{ 
                                            fontWeight: 700, 
                                            color: 'text.primary',
                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                            py: { xs: 0.75, sm: 1 }
                                        }}>Tên món</TableCell>
                                        <TableCell align="right" sx={{ 
                                            fontWeight: 700, 
                                            color: 'text.primary',
                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                            py: { xs: 0.75, sm: 1 }
                                        }}>Đã bán</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dataLoading ? (
                                        <>
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Skeleton variant="circular" width={32} height={32} /></TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            <Skeleton variant="text" width="70%" height={18} />
                                                            <Skeleton variant="rectangular" width="100%" height={4} sx={{ mt: 0.5, borderRadius: 1 }} />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right"><Skeleton variant="rectangular" width={50} height={22} sx={{ borderRadius: 1, ml: 'auto' }} /></TableCell>
                                                </TableRow>
                                            ))}
                                        </>
                                    ) : topProducts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Không có dữ liệu
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        topProducts.map((p, i) => {
                                            const maxSold = Math.max(...topProducts.map(tp => tp.sold || 0), 1);
                                            const percentage = ((p.sold || 0) / maxSold) * 100;
                                            const rankColors = ['#fbbf24', '#94a3b8', '#f59e0b', '#64748b', '#d97706'];
                                            return (
                                                <TableRow 
                                                    key={i} 
                                                    hover
                                                    sx={{ 
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            bgcolor: alpha('#f59e0b', 0.04),
                                                        },
                                                        '&:last-child td': { borderBottom: 0 }
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Box sx={{ 
                                                            width: { xs: 28, sm: 32 }, 
                                                            height: { xs: 28, sm: 32 }, 
                                                            borderRadius: '50%', 
                                                            bgcolor: alpha(rankColors[i] || '#f59e0b', 0.1),
                                                            color: rankColors[i] || '#f59e0b',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 700,
                                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                            border: `2px solid ${alpha(rankColors[i] || '#f59e0b', 0.3)}`
                                                        }}>
                                                            {i + 1}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                            <Typography variant="body2" sx={{ 
                                                                fontWeight: 600,
                                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {p.name || 'N/A'}
                                                            </Typography>
                                                            <Box sx={{ 
                                                                width: '100%', 
                                                                height: 4, 
                                                                borderRadius: 2, 
                                                                bgcolor: alpha('#f59e0b', 0.1),
                                                                overflow: 'hidden'
                                                            }}>
                                                                <Box sx={{ 
                                                                    width: `${percentage}%`, 
                                                                    height: '100%', 
                                                                    bgcolor: rankColors[i] || '#f59e0b',
                                                                    borderRadius: 2,
                                                                    transition: 'width 0.5s ease',
                                                                    boxShadow: `0 2px 4px ${alpha(rankColors[i] || '#f59e0b', 0.3)}`
                                                                }} />
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Chip 
                                                            label={`${p.sold || 0} đơn`}
                                                            sx={{ 
                                                                fontWeight: 700,
                                                                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                                                height: { xs: 18, sm: 22 },
                                                                bgcolor: alpha(rankColors[i] || '#f59e0b', 0.1),
                                                                color: rankColors[i] || '#f59e0b',
                                                                border: `1px solid ${alpha(rankColors[i] || '#f59e0b', 0.3)}`
                                                            }}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Box>
        </Box>

        {/* Hàng 5: Biểu đồ cột mới - Grouped Bar Chart */}
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ width: '100%', mt: { xs: 2, sm: 2.5, md: 3 } }}>
            <Grid item xs={12} sx={{ width: '100%' }}>
                <Card sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.3s ease',
                    width: '100%',
                    '&:hover': {
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    }
                }}>
                    <CardContent sx={{ 
                        p: { xs: 2, sm: 2.5, md: 3 }, 
                        width: '100%' 
                    }}>
                        <Stack 
                            direction={{ xs: 'column', md: 'row' }} 
                            alignItems={{ xs: 'flex-start', md: 'center' }} 
                            justifyContent="space-between" 
                            spacing={{ xs: 2, md: 0 }}
                            sx={{ mb: { xs: 2, md: 3 } }}
                        >
                            <Box>
                                <Typography variant="h5" sx={{ 
                                    fontWeight: 700, 
                                    mb: 0.5,
                                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                                }}>
                                    Doanh thu và số đơn theo ngày
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    display: { xs: 'none', sm: 'block' }
                                }}>
                                    Phân tích chi tiết doanh thu và đơn hàng theo từng ngày
                                </Typography>
                            </Box>
                            <Stack 
                                direction="row" 
                                spacing={{ xs: 1, sm: 2 }}
                                sx={{ width: { xs: '100%', md: 'auto' } }}
                            >
                                <FormControl size="small" sx={{ 
                                    minWidth: { xs: '48%', md: 130 },
                                    width: { xs: '48%', md: 'auto' }
                                }}>
                                    <InputLabel sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Tháng</InputLabel>
                                    <Select 
                                        label="Tháng" 
                                        value={month} 
                                        onChange={(e) => setMonth(e.target.value)}
                                        sx={{ 
                                            borderRadius: 2,
                                            fontSize: { xs: '0.875rem', sm: '1rem' },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: alpha('#2563eb', 0.3),
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: alpha('#2563eb', 0.5),
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#2563eb',
                                            }
                                        }}
                                    >
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <MenuItem key={i+1} value={i+1}>{`Tháng ${i+1}`}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" sx={{ 
                                    minWidth: { xs: '48%', md: 130 },
                                    width: { xs: '48%', md: 'auto' }
                                }}>
                                    <InputLabel sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Năm</InputLabel>
                                    <Select 
                                        label="Năm" 
                                        value={year} 
                                        onChange={(e) => setYear(e.target.value)}
                                        sx={{ 
                                            borderRadius: 2,
                                            fontSize: { xs: '0.875rem', sm: '1rem' },
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: alpha('#2563eb', 0.3),
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: alpha('#2563eb', 0.5),
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#2563eb',
                                            }
                                        }}
                                    >
                                        {[year-1, year, year+1].map(y => (
                                            <MenuItem key={y} value={y}>{y}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Stack>
                        <Divider sx={{ mb: { xs: 2, md: 3 }, borderColor: alpha('#000', 0.1) }} />
                        {/* Custom legend với thiết kế đẹp hơn */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: { xs: 2, sm: 3, md: 4 }, 
                            mb: 2,
                            p: { xs: 1, sm: 1.5 },
                            borderRadius: 2,
                            bgcolor: alpha('#f3f4f6', 0.5),
                            flexWrap: { xs: 'wrap', sm: 'nowrap' }
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ 
                                    width: { xs: 12, sm: 16 }, 
                                    height: { xs: 12, sm: 16 }, 
                                    bgcolor: '#ea580c', 
                                    borderRadius: 1,
                                    boxShadow: `0 2px 4px ${alpha('#ea580c', 0.3)}`
                                }} />
                                <Typography variant="body2" sx={{ 
                                    fontWeight: 600,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }}>
                                    Doanh thu (ngàn ₫)
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ 
                                    width: { xs: 12, sm: 16 }, 
                                    height: { xs: 12, sm: 16 }, 
                                    bgcolor: '#6366f1',
                                    borderRadius: 1,
                                    boxShadow: `0 2px 4px ${alpha('#6366f1', 0.3)}`
                                }} />
                                <Typography variant="body2" sx={{ 
                                    fontWeight: 600,
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                }}>
                                    Số đơn
                                </Typography>
                            </Box>
                        </Box>
                        <Box 
                            ref={chartContainerRef}
                            sx={{ 
                                height: { xs: 300, sm: 350, md: 400 },
                                borderRadius: 2,
                                bgcolor: '#ffffff',
                                p: { xs: 1, sm: 1.5, md: 2 },
                                border: `1px solid ${alpha('#e5e7eb', 0.5)}`,
                                width: '100%',
                                maxWidth: '100%',
                                overflow: { xs: 'auto', md: 'hidden' },
                                boxSizing: 'border-box',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&::-webkit-scrollbar': {
                                    height: 6,
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: alpha('#000', 0.2),
                                    borderRadius: 3,
                                }
                            }}
                        >
                            {loading ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 4 }}>
                                    <Skeleton variant="rectangular" width="80%" height={300} sx={{ borderRadius: 2 }} />
                                    <Skeleton variant="text" width="40%" height={24} />
                                </Box>
                            ) : error ? (
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body1" color="error">
                                        {error}
                                    </Typography>
                                </Box>
                            ) : days.length > 0 && dailyRevenueK.length > 0 ? (
                            <BarChart
                                    xAxis={[{ 
                                        scaleType: 'band', 
                                        data: days, 
                                        label: 'Ngày', 
                                        tickLabelStyle: { fontSize: 11, fontWeight: 500 } 
                                    }]}
                                    yAxis={[{ 
                                        label: 'Giá trị', 
                                        tickLabelStyle: { fontSize: 11, fontWeight: 500 } 
                                    }]}
                                    series={[
                                        { 
                                            data: dailyRevenueK, 
                                            color: '#ea580c', 
                                            label: 'Doanh thu (ngàn ₫)',
                                            valueFormatter: (v) => `${v}k`
                                        },
                                        { 
                                            data: dailyOrders, 
                                            color: '#6366f1', 
                                            label: 'Số đơn',
                                            valueFormatter: (v) => `${v}`
                                        }
                                    ]}
                                    width={chartWidth}
                                    height={isMobile ? 280 : isTablet ? 330 : 380}
                                    slotProps={{ 
                                        legend: { 
                                            direction: 'row',
                                            position: { vertical: 'top', horizontal: 'right' },
                                            padding: 0
                                        } 
                                    }}
                                />
                            ) : (
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Không có dữ liệu
                                    </Typography>
                            </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

        </Grid>
        </Box>
    );
}