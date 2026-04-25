// src/components/admin/ProductTable.js
'use client';
import React, { useState, useMemo } from 'react';
import {
    Box, Button, IconButton, TextField, MenuItem, Paper, Chip, Switch, Typography,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Stack, Avatar, InputAdornment, alpha, Tooltip,
    useMediaQuery, useTheme
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PlusCircle, Edit, Trash2, Search, Package, ShoppingBag, EyeOff, Star, X, Utensils, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import ProductModal from './ProductModal';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

// Confirmation Dialog
const ConfirmationDialog = ({ open, onClose, onConfirm, title, description }) => (
    <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
            sx: {
                borderRadius: 3,
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }
        }}
    >
        <DialogTitle sx={{
            fontWeight: 700,
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
        }}>
            <Trash2 size={22} />
            {title}
        </DialogTitle>
        <DialogContent>
            <DialogContentText>{description}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
                Hủy
            </Button>
            <Button onClick={onConfirm} variant="contained" color="error" autoFocus sx={{ borderRadius: 2, fontWeight: 600 }}>
                Xác nhận xóa
            </Button>
        </DialogActions>
    </Dialog>
);

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === 0) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Mảng màu sắc có sẵn để gán cho các danh mục
const CATEGORY_COLORS = [
    { color: '#3b82f6', bgcolor: alpha('#3b82f6', 0.1), borderColor: alpha('#3b82f6', 0.3) }, // Xanh dương
    { color: '#f59e0b', bgcolor: alpha('#f59e0b', 0.1), borderColor: alpha('#f59e0b', 0.3) }, // Cam
    { color: '#10b981', bgcolor: alpha('#10b981', 0.1), borderColor: alpha('#10b981', 0.3) }, // Xanh lá
    { color: '#2563eb', bgcolor: alpha('#2563eb', 0.1), borderColor: alpha('#2563eb', 0.3) }, // Blue
    { color: '#ef4444', bgcolor: alpha('#ef4444', 0.1), borderColor: alpha('#ef4444', 0.3) }, // Đỏ
    { color: '#06b6d4', bgcolor: alpha('#06b6d4', 0.1), borderColor: alpha('#06b6d4', 0.3) }, // Cyan
    { color: '#ec4899', bgcolor: alpha('#ec4899', 0.1), borderColor: alpha('#ec4899', 0.3) }, // Hồng
    { color: '#14b8a6', bgcolor: alpha('#14b8a6', 0.1), borderColor: alpha('#14b8a6', 0.3) }, // Teal
    { color: '#f97316', bgcolor: alpha('#f97316', 0.1), borderColor: alpha('#f97316', 0.3) }, // Orange
    { color: '#6366f1', bgcolor: alpha('#6366f1', 0.1), borderColor: alpha('#6366f1', 0.3) }, // Indigo
    { color: '#6b7280', bgcolor: alpha('#6b7280', 0.1), borderColor: alpha('#6b7280', 0.3) }, // Xám
    { color: '#84cc16', bgcolor: alpha('#84cc16', 0.1), borderColor: alpha('#84cc16', 0.3) }, // Lime
    { color: '#a855f7', bgcolor: alpha('#a855f7', 0.1), borderColor: alpha('#a855f7', 0.3) }, // Purple
    { color: '#f43f5e', bgcolor: alpha('#f43f5e', 0.1), borderColor: alpha('#f43f5e', 0.3) }, // Rose
];

// Compact Stats Badge
const StatBadge = ({ label, value, color }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${color}`}>
        <span className="text-sm font-bold">{value}</span>
        <span className="text-xs opacity-80">{label}</span>
    </div>
);

// Inventory Cell Component
const InventoryCell = ({ product, inventory, isUpdating, color, bgColor, onUpdate }) => {
    const [editingValue, setEditingValue] = React.useState(inventory?.toString() || '');
    const [isEditing, setIsEditing] = React.useState(false);

    React.useEffect(() => {
        setEditingValue(inventory?.toString() || '');
    }, [inventory]);

    const handleSave = () => {
        const newValue = editingValue === '' ? null : parseInt(editingValue, 10);
        if (newValue !== inventory) {
            onUpdate(product, newValue);
        }
        setIsEditing(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setEditingValue(inventory?.toString() || '');
            setIsEditing(false);
        }
    };

    if (isEditing && !isUpdating) {
        return (
            <TextField
                type="number"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyPress}
                size="small"
                autoFocus
                disabled={isUpdating}
                sx={{
                    width: 80,
                    '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        borderRadius: 1,
                        fontSize: '0.875rem',
                    }
                }}
                onClick={(e) => e.stopPropagation()}
            />
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                cursor: 'pointer',
                '&:hover': {
                    opacity: 0.8
                }
            }}
            onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
            }}
            suppressHydrationWarning={true}
        >
            <Chip
                label={inventory !== null && inventory !== undefined ? inventory : 'Chưa có'}
                size="small"
                sx={{
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: color,
                    bgcolor: bgColor,
                    border: `1px solid ${alpha(color, 0.3)}`,
                    cursor: 'pointer',
                    minWidth: 60,
                }}
            />
        </Box>
    );
};

export default function ProductTable({ products: initialProducts, categories }) {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { showToast } = useToast();
    const [products, setProducts] = useState(initialProducts);
    const [filters, setFilters] = useState({ name: '', category: '', status: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const [togglingProductId, setTogglingProductId] = useState(null);
    const [updatingInventoryId, setUpdatingInventoryId] = useState(null);

    // Debug logging
    React.useEffect(() => {
        console.log('ProductTable - initialProducts:', initialProducts?.length || 0);
        console.log('ProductTable - categories:', categories?.length || 0);
        if (initialProducts && initialProducts.length > 0) {
            console.log('ProductTable - First product:', initialProducts[0]);
        }
    }, [initialProducts, categories]);

    // Update products when initialProducts changes
    React.useEffect(() => {
        setProducts(initialProducts || []);
    }, [initialProducts]);

    // Tạo map màu cho từng danh mục dựa trên danh sách categories từ SQL
    const categoryColorMap = useMemo(() => {
        const map = {};
        if (categories && categories.length > 0) {
            // Sắp xếp categories theo ID để đảm bảo thứ tự nhất quán
            const sortedCategories = [...categories].sort((a, b) => (a.id || 0) - (b.id || 0));
            sortedCategories.forEach((category, index) => {
                const colorIndex = index % CATEGORY_COLORS.length;
                map[category.name] = CATEGORY_COLORS[colorIndex];
            });
        }
        return map;
    }, [categories]);

    // Hàm để lấy màu cho từng danh mục
    const getCategoryColor = (categoryName) => {
        // Nếu có trong map (từ SQL), dùng màu đó
        if (categoryColorMap[categoryName]) {
            return categoryColorMap[categoryName];
        }
        
        // Nếu không có, tạo màu dựa trên hash của tên danh mục
        const hash = categoryName ? categoryName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
        return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
    };

    // Hàm xác định sản phẩm nào cần quản lý tồn kho
    // Sản phẩm cần quản lý tồn kho: nước ngọt chai, lon, cocacola, pepsi, etc.
    const needsInventoryManagement = (product) => {
        const name = (product.name || '').toLowerCase();
        const categoryName = (product.category_name || '').toLowerCase();
        
        // Từ khóa để xác định sản phẩm cần quản lý tồn kho
        const inventoryKeywords = [
            'cocacola', 'coca cola', 'pepsi', '7up', 'sprite', 'fanta',
            'nước ngọt', 'nước ngọt chai', 'nước ngọt lon', 'chai', 'lon',
            'bottle', 'can', 'thức uống đóng chai', 'thức uống đóng lon'
        ];
        
        // Kiểm tra tên sản phẩm
        const nameMatch = inventoryKeywords.some(keyword => name.includes(keyword));
        
        // Nếu có trường inventory trong database (không null), thì cần quản lý
        if (product.inventory !== null && product.inventory !== undefined) {
            return true;
        }
        
        return nameMatch;
    };

    // Calculate stats
    const stats = useMemo(() => ({
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        inactive: products.filter(p => p.status === 'inactive' || p.status === 'hidden').length,
        special: products.filter(p => p.is_special).length,
    }), [products]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ name: '', category: '', status: '' });
    };

    const hasActiveFilters = filters.name || filters.category || filters.status;

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(filters.name.toLowerCase());
            const categoryMatch = filters.category ? product.category_name === filters.category : true;
            const statusMatch = filters.status ? product.status === filters.status : true;
            return nameMatch && categoryMatch && statusMatch;
        });
    }, [products, filters]);

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = (product) => {
        setDeletingProduct(product);
    };

    const confirmDelete = async () => {
        if (!deletingProduct) return;
        const res = await fetch(`/api/admin/products/${deletingProduct.id}`, { method: 'DELETE' });
        if (res.ok) {
            setDeletingProduct(null);
            router.refresh();
        } else {
            alert('Xóa thất bại!');
        }
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleToggleSpecial = async (product, event) => {
        // Prevent event propagation
        if (event) {
            event.stopPropagation();
        }
        
        // Prevent multiple clicks
        if (togglingProductId === product.id) {
            return;
        }

        const newValue = !product.is_special;
        setTogglingProductId(product.id);

        try {
            // Optimistically update UI
            setProducts(prev => prev.map(p => 
                p.id === product.id ? { ...p, is_special: newValue } : p
            ));

            const res = await fetch(`/api/admin/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_special: newValue })
            });

            if (res.ok) {
                const result = await res.json();
                if (result.success) {
                    showToast(
                        newValue ? 'Đã bật món bán chạy' : 'Đã tắt món bán chạy',
                        'success'
                    );
                } else {
                    // Revert on error
                    setProducts(prev => prev.map(p => 
                        p.id === product.id ? { ...p, is_special: !newValue } : p
                    ));
                    showToast(result.message || 'Cập nhật thất bại', 'error');
                }
            } else {
                // Revert on error
                setProducts(prev => prev.map(p => 
                    p.id === product.id ? { ...p, is_special: !newValue } : p
                ));
                const errorData = await res.json().catch(() => ({}));
                showToast(errorData.message || 'Cập nhật thất bại', 'error');
            }
        } catch (error) {
            console.error('Error toggling special:', error);
            // Revert on error
            setProducts(prev => prev.map(p => 
                p.id === product.id ? { ...p, is_special: !newValue } : p
            ));
            showToast('Lỗi kết nối. Vui lòng thử lại.', 'error');
        } finally {
            setTogglingProductId(null);
        }
    };

    const handleUpdateInventory = async (product, newInventory) => {
        // Prevent multiple updates
        if (updatingInventoryId === product.id) {
            return;
        }

        setUpdatingInventoryId(product.id);

        try {
            // Optimistically update UI
            setProducts(prev => prev.map(p => 
                p.id === product.id ? { ...p, inventory: newInventory } : p
            ));

            const res = await fetch(`/api/admin/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inventory: newInventory })
            });

            if (res.ok) {
                const result = await res.json();
                if (result.success) {
                    showToast('Cập nhật tồn kho thành công', 'success');
                    // Refresh để lấy dữ liệu mới từ server
                    router.refresh();
                } else {
                    // Revert on error
                    setProducts(prev => prev.map(p => 
                        p.id === product.id ? { ...p, inventory: product.inventory } : p
                    ));
                    showToast(result.message || 'Cập nhật thất bại', 'error');
                }
            } else {
                // Revert on error
                setProducts(prev => prev.map(p => 
                    p.id === product.id ? { ...p, inventory: product.inventory } : p
                ));
                const errorData = await res.json().catch(() => ({}));
                showToast(errorData.message || 'Cập nhật thất bại', 'error');
            }
        } catch (error) {
            console.error('Error updating inventory:', error);
            // Revert on error
            setProducts(prev => prev.map(p => 
                p.id === product.id ? { ...p, inventory: product.inventory } : p
            ));
            showToast('Lỗi kết nối. Vui lòng thử lại.', 'error');
        } finally {
            setUpdatingInventoryId(null);
        }
    };

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 60,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <span className="text-xs font-semibold text-blue-600">#{params.value}</span>
            )
        },
        {
            field: 'image_url',
            headerName: 'Ảnh',
            width: 70,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    position: 'relative',
                }}>
                    <Image
                        src={params.value || '/placeholder.jpg'}
                        alt={params.row.name}
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </Box>
            ),
            sortable: false,
            filterable: false,
        },
        {
            field: 'name',
            headerName: 'Tên món',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', py: 0.5 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary', lineHeight: 1.3 }}>
                        {params.value}
                    </Typography>
                    {params.row.is_special && (
                        <Chip
                            label="Bán chạy"
                            size="small"
                            sx={{
                                mt: 0.5,
                                height: 18,
                                fontSize: '0.65rem',
                                bgcolor: alpha('#f59e0b', 0.15),
                                color: '#d97706',
                                fontWeight: 600,
                                width: 'fit-content',
                            }}
                        />
                    )}
                </Box>
            )
        },
        {
            field: 'category_name',
            headerName: 'Danh mục',
            width: 120,
            renderCell: (params) => {
                const categoryColors = getCategoryColor(params.value);
                return (
                    <Chip
                        label={params.value}
                        size="small"
                        variant="outlined"
                        sx={{
                            fontWeight: 500,
                            fontSize: '0.8rem',
                            borderColor: categoryColors.borderColor,
                            color: categoryColors.color,
                            bgcolor: categoryColors.bgcolor,
                        }}
                    />
                );
            }
        },
        {
            field: 'price',
            headerName: 'Giá Bán',
            width: 110,
            headerAlign: 'right',
            align: 'right',
            renderCell: (params) => (
                <Typography sx={{ fontWeight: 500, color: '#dc2626', fontSize: '0.9rem' }}>
                    {formatCurrency(params.value)}
                </Typography>
            )
        },
        {
            field: 'discount_price',
            headerName: 'Giá KM',
            width: 100,
            headerAlign: 'right',
            align: 'right',
            renderCell: (params) => (
                params.value ? (
                    <Typography sx={{ fontWeight: 500, color: '#16a34a', fontSize: '0.9rem' }}>
                        {formatCurrency(params.value)}
                    </Typography>
                ) : (
                    <Typography color="text.disabled" sx={{ fontSize: '0.9rem' }}>-</Typography>
                )
            )
        },
        {
            field: 'status',
            headerName: 'Trạng thái',
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const statusConfig = {
                    active: { label: 'Đang bán', color: '#FFFFFF', bgcolor: alpha('#16a34a', 1) },
                    inactive: { label: 'Ngưng bán', color: '#ffffff', bgcolor: alpha('#dc2626', 1) },
                    hidden: { label: 'Ẩn', color: '#ffffff', bgcolor: alpha('#4b5563', 1) },
                };
                const config = statusConfig[params.value] || { label: params.value, color: '#6b7280', bgcolor: '#f3f4f6' };
                return (
                    <Chip
                        label={config.label}
                        size="small"
                        sx={{
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            color: config.color,
                            bgcolor: config.bgcolor,
                        }}
                    />
                );
            }
        },
        {
            field: 'is_special',
            headerName: 'Bán chạy',
            width: 90,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%' 
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Switch
                        checked={!!params.value}
                        size="small"
                        color="warning"
                        disabled={togglingProductId === params.row.id}
                        onChange={(e) => handleToggleSpecial(params.row, e)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </Box>
            ),
        },
        {
            field: 'inventory',
            headerName: 'Tồn kho',
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const product = params.row;
                const needsInventory = needsInventoryManagement(product);
                
                // Nếu không cần quản lý tồn kho, không hiển thị
                if (!needsInventory) {
                    return <Typography sx={{ fontSize: '0.875rem', color: 'text.disabled' }}>-</Typography>;
                }

                const inventory = product.inventory !== null && product.inventory !== undefined ? parseInt(product.inventory, 10) : null;
                const isUpdating = updatingInventoryId === product.id;

                // Xác định màu sắc dựa trên số lượng tồn kho
                let color = '#10b981'; // Xanh lá (đủ hàng)
                let bgColor = alpha('#10b981', 0.1);
                if (inventory === null || inventory === undefined) {
                    color = '#6b7280'; // Xám (chưa có dữ liệu)
                    bgColor = alpha('#6b7280', 0.1);
                } else if (inventory === 0) {
                    color = '#ef4444'; // Đỏ (hết hàng)
                    bgColor = alpha('#ef4444', 0.1);
                } else if (inventory < 10) {
                    color = '#f59e0b'; // Cam (sắp hết)
                    bgColor = alpha('#f59e0b', 0.1);
                }

                return (
                    <InventoryCell
                        product={product}
                        inventory={inventory}
                        isUpdating={isUpdating}
                        color={color}
                        bgColor={bgColor}
                        onUpdate={handleUpdateInventory}
                    />
                );
            },
        },
        {
            field: 'sold_quantity',
            headerName: 'Đã bán',
            width: 100,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const soldQuantity = params.value || 0;
                return (
                    <Chip
                        label={soldQuantity.toLocaleString('vi-VN')}
                        size="small"
                        sx={{
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            color: '#3b82f6',
                            bgcolor: alpha('#3b82f6', 0.1),
                            border: `1px solid ${alpha('#3b82f6', 0.3)}`,
                            minWidth: 50,
                        }}
                    />
                );
            },
        },
        {
            field: 'actions',
            headerName: 'Thao tác',
            width: 150,
            minWidth: 140,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Sửa" arrow>
                            <IconButton
                                size="medium"
                                onClick={() => handleEdit(params.row)}
                                sx={{ 
                                    color: '#f97316', 
                                    '&:hover': { bgcolor: alpha('#f97316', 0.1) },
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                <Edit size={20} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa" arrow>
                            <IconButton
                                size="medium"
                                onClick={() => handleDelete(params.row)}
                                sx={{ 
                                    color: '#EF4444', 
                                    '&:hover': { bgcolor: alpha('#EF4444', 0.1) },
                                    width: 40,
                                    height: 40,
                                }}
                            >
                                <Trash2 size={20} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>
            )
        },
    ];

    return (
        <Box 
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            suppressHydrationWarning={true}
        >
            {/* Compact Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Quản lý món</h1>
                    <span className="text-sm text-gray-500">({stats.total} món)</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {/* Tổng món */}
                <Box sx={{ 
                    p: 2,
                    borderRadius: 4, 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05) translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                    }
                }}>
                    <Package 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <Package size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.total}</p>
                        <p className="text-sm opacity-90">Tổng món</p>
                    </div>
                </Box>
                {/* Đang bán */}
                <Box sx={{ 
                    p: 2, 
                    borderRadius: 4, 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05) translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                    }
                }}>
                    <CheckCircle 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <CheckCircle size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.active}</p>
                        <p className="text-sm opacity-90">Đang bán</p>
                    </div>
                </Box>
                {/* Ngưng bán */}
                <Box sx={{ 
                    p: 2, 
                    borderRadius: 4, 
                    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', 
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05) translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                    }
                }}>
                    <XCircle 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <XCircle size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.inactive}</p>
                        <p className="text-sm opacity-90">Ngưng bán</p>
                    </div>
                </Box>
                {/* Hot */}
                <Box sx={{ 
                    p: 2, 
                    borderRadius: 4, 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05) translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                    }
                }}>
                    <Star 
                        size={80} 
                        className="opacity-10" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0 
                        }} 
                    />
                    <div className="relative z-10">
                        <Star size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.special}</p>
                        <p className="text-sm opacity-90">Hot</p>
                    </div>
                </Box>
            </div>

            {/* Filter & Stats Row */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <div className="flex flex-wrap items-center gap-3">

                    {/* Search & Filters */}
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Tìm kiếm..."
                        value={filters.name}
                        onChange={(e) => handleFilterChange('name', e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={16} className="text-gray-400" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            width: 200,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                borderRadius: 1.5,
                                fontSize: '0.875rem',
                            }
                        }}
                    />
                    <TextField
                        select
                        variant="outlined"
                        size="small"
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        SelectProps={{
                            displayEmpty: true,
                        }}
                        sx={{
                            minWidth: 130,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                borderRadius: 1.5,
                                fontSize: '0.875rem',
                            }
                        }}
                    >
                        <MenuItem value="">Danh mục</MenuItem>
                        {categories.map(cat => <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>)}
                    </TextField>
                    <TextField
                        select
                        variant="outlined"
                        size="small"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        SelectProps={{
                            displayEmpty: true,
                        }}
                        sx={{
                            minWidth: 120,
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
                                borderRadius: 1.5,
                                fontSize: '0.875rem',
                            }
                        }}
                    >
                        <MenuItem value="">Trạng thái</MenuItem>
                        <MenuItem value="active">Đang bán</MenuItem>
                        <MenuItem value="inactive">Ngưng bán</MenuItem>
                        <MenuItem value="hidden">Ẩn</MenuItem>
                    </TextField>

                    {hasActiveFilters && (
                        <Button
                            size="small"
                            startIcon={<X size={14} />}
                            onClick={clearFilters}
                            sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '0.8rem' }}
                        >
                            Xóa lọc
                        </Button>
                    )}

                    <div className="ml-auto">
                        <Button
                            variant="contained"
                            startIcon={<PlusCircle size={18} />}
                            onClick={handleAddNew}
                            sx={{
                                bgcolor: '#16a34a',
                                fontWeight: 500,
                                borderRadius: 2,
                                px: 2.5,
                                py: 1,
                                textTransform: 'none',
                                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                                '&:hover': {
                                    bgcolor: '#15803d',
                                    boxShadow: '0 6px 16px rgba(22, 163, 74, 0.4)',
                                }
                            }}
                        >
                            + Thêm món
                        </Button>
                    </div>
                </div>
            </Paper>

            {/* Data Table */}
            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    minHeight: '600px',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden',
                    '& .MuiDataGrid-root': {
                        border: 'none',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        bgcolor: '#f8fafc',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    },
                    '& .MuiDataGrid-columnHeader': {
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        color: 'text.secondary',
                    },
                    '& .MuiDataGrid-row': {
                        '&:hover': {
                            bgcolor: alpha('#3b82f6', 0.04),
                        }
                    },
                    '& .MuiDataGrid-cell': {
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '1px solid',
                        borderColor: alpha('#000', 0.05),
                    },
                }}
            >
                <DataGrid
                    rows={filteredProducts}
                    columns={columns}
                    rowHeight={68}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25 } },
                        sorting: { sortModel: [{ field: 'id', sort: 'desc' }] },
                    }}
                    localeText={{
                        noRowsLabel: 'Không có món nào',
                        MuiTablePagination: {
                            labelRowsPerPage: 'Hiển thị:',
                            labelDisplayedRows: ({ from, to, count }) => `${from}-${to} / ${count}`,
                        }
                    }}
                    sx={{
                        '& .MuiDataGrid-virtualScroller': {
                            '&::-webkit-scrollbar': {
                                width: 6,
                                height: 6,
                            },
                            '&::-webkit-scrollbar-thumb': {
                                bgcolor: alpha('#000', 0.15),
                                borderRadius: 3,
                            }
                        }
                    }}
                />
            </Paper>

            {/* Product Modal */}
            <ProductModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                categories={categories}
                productToEdit={editingProduct}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={Boolean(deletingProduct)}
                onClose={() => setDeletingProduct(null)}
                onConfirm={confirmDelete}
                title="Xác nhận xóa món"
                description={`Bạn có chắc chắn muốn xóa món "${deletingProduct?.name}" không?`}
            />
        </Box>
    );
}