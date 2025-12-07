'use client';
import React, { useState, useMemo } from 'react';
import {
    Box, Paper, Typography, Grid, Card, CardContent, Button, TextField, MenuItem,
    Chip, IconButton, Tooltip, alpha, Tab, Tabs, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, LinearProgress
} from '@mui/material';
import {
    FileText, Download, Calendar, TrendingUp, TrendingDown, DollarSign,
    Package, Users, BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
    Filter, RefreshCw, Printer, FileSpreadsheet, ChevronRight
} from 'lucide-react';

// Mock data for demonstration
const mockRevenueData = {
    today: { value: 2450000, change: 12.5 },
    thisWeek: { value: 15680000, change: 8.2 },
    thisMonth: { value: 68500000, change: 15.3 },
    thisQuarter: { value: 198000000, change: 22.1 },
    thisYear: { value: 856000000, change: 18.7 },
};

const mockTopProducts = [
    { name: 'Bánh tằm bì', revenue: 45000000, orders: 1250, growth: 15.2 },
    { name: 'Bánh tằm xíu mại', revenue: 38000000, orders: 980, growth: 12.8 },
    { name: 'Bánh tằm thập cẩm', revenue: 32000000, orders: 750, growth: 8.5 },
    { name: 'Bánh tằm chả cá', revenue: 28000000, orders: 680, growth: -2.3 },
    { name: 'Bánh tằm giò heo', revenue: 25000000, orders: 520, growth: 5.1 },
];

const mockTopCategories = [
    { name: 'Bánh tằm', revenue: 120000000, percentage: 45 },
    { name: 'Đồ uống', revenue: 65000000, percentage: 24 },
    { name: 'Món thêm', revenue: 45000000, percentage: 17 },
    { name: 'Tráng miệng', revenue: 38000000, percentage: 14 },
];

const mockTopCustomers = [
    { name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', spent: 5200000, orders: 45 },
    { name: 'Trần Thị B', email: 'tranthib@gmail.com', spent: 4800000, orders: 38 },
    { name: 'Lê Văn C', email: 'levanc@gmail.com', spent: 4200000, orders: 35 },
    { name: 'Phạm Thị D', email: 'phamthid@gmail.com', spent: 3800000, orders: 32 },
    { name: 'Hoàng Văn E', email: 'hoangvane@gmail.com', spent: 3500000, orders: 28 },
];

const mockInventory = {
    inStock: 45,
    lowStock: 8,
    outOfStock: 3,
    items: [
        { name: 'Bì', status: 'low', quantity: 5, unit: 'kg' },
        { name: 'Xíu mại', status: 'out', quantity: 0, unit: 'phần' },
        { name: 'Chả cá', status: 'low', quantity: 3, unit: 'kg' },
        { name: 'Giò heo', status: 'out', quantity: 0, unit: 'kg' },
    ]
};

const formatCurrency = (amount) => {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'tr';
    }
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

const formatFullCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

// Stat Card Component
const StatCard = ({ title, value, change, icon: Icon, color, period }) => (
    <Card
        elevation={0}
        sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            height: '100%',
            transition: 'all 0.2s',
            '&:hover': {
                borderColor: color,
                boxShadow: `0 4px 20px ${alpha(color, 0.15)}`,
            }
        }}
    >
        <CardContent sx={{ p: 2.5 }}>
            <div className="flex items-start justify-between mb-3">
                <Box sx={{
                    width: 44, height: 44, borderRadius: 2,
                    bgcolor: alpha(color, 0.1),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={22} color={color} />
                </Box>
                <Chip
                    size="small"
                    icon={change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    label={`${change >= 0 ? '+' : ''}${change}%`}
                    sx={{
                        bgcolor: change >= 0 ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                        color: change >= 0 ? '#059669' : '#dc2626',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        '& .MuiChip-icon': { color: 'inherit' }
                    }}
                />
            </div>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                {formatFullCurrency(value)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {title} • <span className="text-xs">{period}</span>
            </Typography>
        </CardContent>
    </Card>
);

// Report Card Component
const ReportCard = ({ title, description, icon: Icon, color, onClick }) => (
    <Card
        elevation={0}
        sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
                borderColor: color,
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(color, 0.2)}`,
            }
        }}
        onClick={onClick}
    >
        <CardContent sx={{ p: 3 }}>
            <div className="flex items-center gap-3 mb-3">
                <Box sx={{
                    width: 48, height: 48, borderRadius: 2.5,
                    background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 15px ${alpha(color, 0.4)}`,
                }}>
                    <Icon size={24} color="white" />
                </Box>
                <div className="flex-1">
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{title}</Typography>
                    <Typography variant="body2" color="text.secondary">{description}</Typography>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
            </div>
        </CardContent>
    </Card>
);

// Tab Panel
function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [dateRange, setDateRange] = useState('thisMonth');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format) => {
        setIsExporting(true);
        // Simulate export
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsExporting(false);
        alert(`Đã xuất báo cáo định dạng ${format.toUpperCase()}`);
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">BÁO CÁO & PHÂN TÍCH</h1>
                    <p className="text-sm text-gray-500 mt-1">Theo dõi doanh thu, chi tiêu và tồn kho</p>
                </div>
                <div className="flex items-center gap-2">
                    <Tooltip title="Làm mới" arrow>
                        <IconButton sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <RefreshCw size={18} />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="outlined"
                        startIcon={<Printer size={16} />}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                        onClick={() => window.print()}
                    >
                        In
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Download size={16} />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            bgcolor: '#10b981',
                            '&:hover': { bgcolor: '#059669' }
                        }}
                        onClick={() => handleExport('excel')}
                        disabled={isExporting}
                    >
                        {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6} md={2.4}>
                    <StatCard
                        title="Doanh thu"
                        value={mockRevenueData.today.value}
                        change={mockRevenueData.today.change}
                        icon={DollarSign}
                        color="#10b981"
                        period="Hôm nay"
                    />
                </Grid>
                <Grid item xs={6} md={2.4}>
                    <StatCard
                        title="Doanh thu"
                        value={mockRevenueData.thisWeek.value}
                        change={mockRevenueData.thisWeek.change}
                        icon={TrendingUp}
                        color="#3b82f6"
                        period="Tuần này"
                    />
                </Grid>
                <Grid item xs={6} md={2.4}>
                    <StatCard
                        title="Doanh thu"
                        value={mockRevenueData.thisMonth.value}
                        change={mockRevenueData.thisMonth.change}
                        icon={BarChart3}
                        color="#8b5cf6"
                        period="Tháng này"
                    />
                </Grid>
                <Grid item xs={6} md={2.4}>
                    <StatCard
                        title="Doanh thu"
                        value={mockRevenueData.thisQuarter.value}
                        change={mockRevenueData.thisQuarter.change}
                        icon={PieChart}
                        color="#f59e0b"
                        period="Quý này"
                    />
                </Grid>
                <Grid item xs={12} md={2.4}>
                    <StatCard
                        title="Doanh thu"
                        value={mockRevenueData.thisYear.value}
                        change={mockRevenueData.thisYear.change}
                        icon={Calendar}
                        color="#ef4444"
                        period="Năm nay"
                    />
                </Grid>
            </Grid>

            {/* Report Categories */}
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 2 }}>
                Loại Báo cáo
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <ReportCard
                        title="Doanh thu theo thời gian"
                        description="Ngày, tuần, tháng, quý, năm"
                        icon={Calendar}
                        color="#10b981"
                        onClick={() => setActiveTab(0)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <ReportCard
                        title="Doanh thu theo món"
                        description="Top sản phẩm bán chạy"
                        icon={Package}
                        color="#3b82f6"
                        onClick={() => setActiveTab(1)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <ReportCard
                        title="Chi tiêu khách hàng"
                        description="Khách hàng thân thiết"
                        icon={Users}
                        color="#8b5cf6"
                        onClick={() => setActiveTab(2)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <ReportCard
                        title="Tồn kho"
                        description="Còn hàng, hết hàng, sắp hết"
                        icon={BarChart3}
                        color="#f59e0b"
                        onClick={() => setActiveTab(3)}
                    />
                </Grid>
            </Grid>

            {/* Tabs Content */}
            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    minHeight: 700,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, flexShrink: 0 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, v) => setActiveTab(v)}
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                minHeight: 56,
                            }
                        }}
                    >
                        <Tab label="Doanh thu" icon={<DollarSign size={16} />} iconPosition="start" />
                        <Tab label="Theo món" icon={<Package size={16} />} iconPosition="start" />
                        <Tab label="Khách hàng" icon={<Users size={16} />} iconPosition="start" />
                        <Tab label="Tồn kho" icon={<BarChart3 size={16} />} iconPosition="start" />
                    </Tabs>
                </Box>

                <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
                    {/* Tab 0: Revenue by Time */}
                    <TabPanel value={activeTab} index={0}>
                        <div className="flex items-center justify-between mb-4">
                            <Typography sx={{ fontWeight: 600 }}>Doanh thu theo thời gian</Typography>
                            <TextField
                                select
                                size="small"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                sx={{ width: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            >
                                <MenuItem value="today">Hôm nay</MenuItem>
                                <MenuItem value="thisWeek">Tuần này</MenuItem>
                                <MenuItem value="thisMonth">Tháng này</MenuItem>
                                <MenuItem value="thisQuarter">Quý này</MenuItem>
                                <MenuItem value="thisYear">Năm nay</MenuItem>
                            </TextField>
                        </div>

                        {/* Placeholder for chart */}
                        <Box sx={{
                            height: 300,
                            bgcolor: alpha('#10b981', 0.05),
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px dashed',
                            borderColor: alpha('#10b981', 0.3),
                            mb: 3
                        }}>
                            <div className="text-center">
                                <BarChart3 size={48} className="text-green-300 mx-auto mb-2" />
                                <Typography color="text.secondary">
                                    Biểu đồ doanh thu sẽ hiển thị ở đây
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    (Tích hợp với thư viện chart như Recharts hoặc Chart.js)
                                </Typography>
                            </div>
                        </Box>

                        <div className="flex gap-2">
                            <Button
                                variant="outlined"
                                startIcon={<FileSpreadsheet size={16} />}
                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                onClick={() => handleExport('csv')}
                            >
                                Xuất CSV
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<FileText size={16} />}
                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                onClick={() => handleExport('pdf')}
                            >
                                Xuất PDF
                            </Button>
                        </div>
                    </TabPanel>

                    {/* Tab 1: Revenue by Product */}
                    <TabPanel value={activeTab} index={1}>
                        <Typography sx={{ fontWeight: 600, mb: 3 }}>Top món bán chạy</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                        <TableCell sx={{ fontWeight: 600 }}>Tên món</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Doanh thu</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Số đơn</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Tăng trưởng</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {mockTopProducts.map((product, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                                        ${index === 0 ? 'bg-amber-100 text-amber-600' :
                                                            index === 1 ? 'bg-gray-100 text-gray-600' :
                                                                index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500'}`}>
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-medium">{product.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: '#10b981' }}>
                                                {formatFullCurrency(product.revenue)}
                                            </TableCell>
                                            <TableCell align="right">{product.orders}</TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    size="small"
                                                    label={`${product.growth >= 0 ? '+' : ''}${product.growth}%`}
                                                    sx={{
                                                        bgcolor: product.growth >= 0 ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
                                                        color: product.growth >= 0 ? '#059669' : '#dc2626',
                                                        fontWeight: 600,
                                                        fontSize: '0.7rem',
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Typography sx={{ fontWeight: 600, mt: 4, mb: 3 }}>Doanh thu theo danh mục</Typography>
                        <Grid container spacing={2}>
                            {mockTopCategories.map((cat, index) => (
                                <Grid item xs={6} md={3} key={index}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                                            {cat.percentage}%
                                        </Typography>
                                        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatCurrency(cat.revenue)}
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={cat.percentage}
                                            sx={{
                                                mt: 1.5,
                                                height: 6,
                                                borderRadius: 3,
                                                bgcolor: alpha('#3b82f6', 0.1),
                                                '& .MuiLinearProgress-bar': { bgcolor: '#3b82f6', borderRadius: 3 }
                                            }}
                                        />
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </TabPanel>

                    {/* Tab 2: Customer Spending */}
                    <TabPanel value={activeTab} index={2}>
                        <Typography sx={{ fontWeight: 600, mb: 3 }}>Top khách hàng chi tiêu</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                        <TableCell sx={{ fontWeight: 600 }}>Khách hàng</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Tổng chi tiêu</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Số đơn</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>Hạng</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {mockTopCustomers.map((customer, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                                                        ${index === 0 ? 'bg-amber-500' :
                                                            index === 1 ? 'bg-gray-400' :
                                                                index === 2 ? 'bg-orange-400' : 'bg-blue-400'}`}>
                                                        {customer.name.charAt(0)}
                                                    </div>
                                                    <span className="font-medium">{customer.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-500">{customer.email}</span>
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: '#8b5cf6' }}>
                                                {formatFullCurrency(customer.spent)}
                                            </TableCell>
                                            <TableCell align="right">{customer.orders} đơn</TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    size="small"
                                                    label={index < 3 ? 'VIP' : 'Thân thiết'}
                                                    sx={{
                                                        bgcolor: index < 3 ? alpha('#f59e0b', 0.1) : alpha('#3b82f6', 0.1),
                                                        color: index < 3 ? '#d97706' : '#2563eb',
                                                        fontWeight: 600,
                                                        fontSize: '0.7rem',
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>

                    {/* Tab 3: Inventory */}
                    <TabPanel value={activeTab} index={3}>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={4}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        bgcolor: alpha('#10b981', 0.1),
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#059669' }}>
                                        {mockInventory.inStock}
                                    </Typography>
                                    <Typography color="text.secondary">Còn hàng</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={4}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        bgcolor: alpha('#f59e0b', 0.1),
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#d97706' }}>
                                        {mockInventory.lowStock}
                                    </Typography>
                                    <Typography color="text.secondary">Sắp hết</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={4}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        bgcolor: alpha('#ef4444', 0.1),
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#dc2626' }}>
                                        {mockInventory.outOfStock}
                                    </Typography>
                                    <Typography color="text.secondary">Hết hàng</Typography>
                                </Paper>
                            </Grid>
                        </Grid>

                        <Typography sx={{ fontWeight: 600, mb: 2 }}>Nguyên liệu cần bổ sung</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                        <TableCell sx={{ fontWeight: 600 }}>Nguyên liệu</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Số lượng</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>Hành động</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {mockInventory.items.map((item, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>
                                                <span className="font-medium">{item.name}</span>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    size="small"
                                                    label={item.status === 'out' ? 'Hết hàng' : 'Sắp hết'}
                                                    sx={{
                                                        bgcolor: item.status === 'out'
                                                            ? alpha('#ef4444', 0.1)
                                                            : alpha('#f59e0b', 0.1),
                                                        color: item.status === 'out' ? '#dc2626' : '#d97706',
                                                        fontWeight: 600,
                                                        fontSize: '0.7rem',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                {item.quantity} {item.unit}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontSize: '0.75rem',
                                                    }}
                                                >
                                                    Bổ sung
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </TabPanel>
                </Box>
            </Paper>
        </Box>
    );
}
