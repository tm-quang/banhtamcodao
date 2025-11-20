// src/components/admin/ProductTable.js
'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Box, Button, IconButton, TextField, MenuItem, Paper, Chip, Switch, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import ProductModal from './ProductModal';
import { useRouter } from 'next/navigation'; // Import useRouter

// Component Dialog xác nhận xóa
const ConfirmationDialog = ({ open, onClose, onConfirm, title, description }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent><DialogContentText>{description}</DialogContentText></DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Hủy</Button>
            <Button onClick={onConfirm} color="error" autoFocus>Xóa</Button>
        </DialogActions>
    </Dialog>
);

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || amount === 0) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

function FilterBar({ categories, onFilterChange }) {
    return (
        <Paper sx={{ p: 2, mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2, bgcolor: 'background.default' }}>
            <TextField 
                variant="outlined" 
                size="small" 
                placeholder="Lọc theo tên sản phẩm..." 
                onChange={(e) => onFilterChange('name', e.target.value)}
                sx={{ flexGrow: 1, minWidth: 250, bgcolor: 'white' }} 
            />
            <TextField 
                select 
                variant="outlined" 
                size="small" 
                defaultValue="" 
                onChange={(e) => onFilterChange('category', e.target.value)}
                SelectProps={{ displayEmpty: true }}
                sx={{ minWidth: 180, bgcolor: 'white' }}
            >
                <MenuItem value=""><em>Tất cả Danh mục</em></MenuItem>
                {categories.map(cat => <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>)}
            </TextField>
            <TextField 
                select 
                variant="outlined" 
                size="small" 
                defaultValue="" 
                onChange={(e) => onFilterChange('status', e.target.value)}
                SelectProps={{ displayEmpty: true }}
                sx={{ minWidth: 180, bgcolor: 'white' }}
            >
                <MenuItem value=""><em>Trạng thái hiển thị</em></MenuItem>
                <MenuItem value="active">Đang bán</MenuItem>
                <MenuItem value="inactive">Ngưng bán</MenuItem>
                <MenuItem value="hidden">Ẩn</MenuItem>
            </TextField>
        </Paper>
    );
}
export default function ProductTable({ products, categories }) {
    const router = useRouter(); // Khởi tạo router
    const [filters, setFilters] = useState({ name: '', category: '', status: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null); // State cho sản phẩm đang sửa
    const [deletingProduct, setDeletingProduct] = useState(null); // State cho sản phẩm sắp xóa

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

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
            alert('Xóa sản phẩm thành công!');
            setDeletingProduct(null); // Đóng dialog
            router.refresh(); // Tải lại dữ liệu
        } else {
            alert('Xóa thất bại!');
        }
    };

    const handleAddNew = () => {
        setEditingProduct(null); // Đảm bảo không có sản phẩm nào đang được sửa
        setIsModalOpen(true);
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        {
            field: 'image_url', headerName: 'Ảnh', width: 80,
            renderCell: (params) => <Image src={params.value || '/placeholder.jpg'} alt={params.row.name} width={40} height={40} style={{ borderRadius: '4px', objectFit: 'cover' }} />,
            sortable: false, filterable: false,
        },
        { field: 'name', headerName: 'Tên sản phẩm', flex: 1, minWidth: 200 },
        { field: 'category_name', headerName: 'Danh mục', width: 150 },
        { field: 'price', headerName: 'Giá Bán', width: 130, valueFormatter: (value) => formatCurrency(value) },
        { field: 'discount_price', headerName: 'Giá KM', width: 130, valueFormatter: (value) => formatCurrency(value) },
        {
            field: 'status', headerName: 'Trạng thái', width: 120,
            renderCell: (params) => {
                const statusMap = {
                    active: <Chip label="Đang bán" color="success" size="small" />,
                    inactive: <Chip label="Ngưng bán" color="default" size="small" />,
                    hidden: <Chip label="Ẩn" color="warning" size="small" />,
                };
                return statusMap[params.value] || <Chip label={params.value} size="small" />;
            }
        },
        {
            field: 'is_special', headerName: 'Bán chạy', width: 100, align: 'center',
            renderCell: (params) => <Switch checked={!!params.value} size="small" color="primary" />,
        },
        {
            field: 'actions', headerName: 'Hành động', width: 120, align: 'center', sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton size="small" color="info" onClick={() => handleEdit(params.row)}><Edit size={18} /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(params.row)}><Trash2 size={18} /></IconButton>
                </Box>
            )
        },
    ];
    
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                 <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>Quản lý Sản phẩm</Typography>
                <Button variant="contained" startIcon={<PlusCircle />} onClick={handleAddNew}>
                    Thêm sản phẩm
                </Button>
            </Box>

            <FilterBar categories={categories} onFilterChange={handleFilterChange} />
            
            <Paper sx={{ height: '70vh', width: '100%' }}>
                <DataGrid rows={filteredProducts} columns={columns} /* ... (props khác không đổi) */ />
            </Paper>

            <ProductModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                categories={categories}
                productToEdit={editingProduct}
            />

            <ConfirmationDialog
                open={Boolean(deletingProduct)}
                onClose={() => setDeletingProduct(null)}
                onConfirm={confirmDelete}
                title="Xác nhận xóa sản phẩm"
                description={`Bạn có chắc chắn muốn xóa sản phẩm "${deletingProduct?.name}" không? Hành động này không thể hoàn tác.`}
            />
        </Box>
    );
}