// src/app/(admin)/dashboard/promotions/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { Box, Button, Paper, Typography, Chip, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import PromotionModal from '@/components/admin/PromotionModal';

const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

export default function PromotionsPage() {
    const router = useRouter();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);

    const fetchPromotions = async () => {
        setLoading(true);
        const res = await fetch('/api/admin/promotions');
        const data = await res.json();
        if (data.success) setPromotions(data.promotions || []);
        setLoading(false);
    };

    useEffect(() => { fetchPromotions(); }, []);
    
    const handleSave = async (data) => {
        const isEditMode = Boolean(data.id);
        const url = isEditMode ? `/api/admin/promotions/${data.id}` : '/api/admin/promotions';
        const method = isEditMode ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (res.ok) {
            alert('Thao tác thành công!');
            setIsModalOpen(false);
            fetchPromotions();
        } else {
            alert('Có lỗi xảy ra!');
        }
    };
    
    const handleDelete = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa mã khuyến mãi này?')) {
            const res = await fetch(`/api/admin/promotions/${id}`, { method: 'DELETE' });
            if (res.ok) { alert('Xóa thành công!'); fetchPromotions(); }
            else { alert('Xóa thất bại!'); }
        }
    };

    const columns = [
        { field: 'promo_code', headerName: 'Mã KM', width: 150 },
        { field: 'title', headerName: 'Tên chương trình', flex: 1 },
        { field: 'discount_type', headerName: 'Loại', width: 130 },
        { field: 'discount_value', headerName: 'Giá trị', width: 120, valueFormatter: (value, row) => row.discount_type === 'percent' ? `${value}%` : formatCurrency(value) },
        { field: 'min_order_value', headerName: 'Đơn tối thiểu', width: 130, valueFormatter: (value) => formatCurrency(value) },
        { field: 'end_date', headerName: 'Ngày hết hạn', width: 160, valueFormatter: (value) => format(new Date(value), 'dd/MM/yyyy HH:mm') },
        { field: 'status', headerName: 'Trạng thái', width: 100, renderCell: (params) => <Chip label={params.value} color={params.value === 'active' ? 'success' : 'default'} size="small" /> },
        {
            field: 'actions', headerName: 'Hành động', width: 120,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => { setEditingPromotion(params.row); setIsModalOpen(true); }}><Edit size={18}/></IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id)} color="error"><Trash2 size={18}/></IconButton>
                </Box>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>Quản lý Khuyến mãi</Typography>
                <Button variant="contained" startIcon={<PlusCircle />} onClick={() => { setEditingPromotion(null); setIsModalOpen(true); }}>
                    Thêm Khuyến mãi
                </Button>
            </Box>
            <Paper sx={{ height: '75vh', width: '100%' }}>
                <DataGrid rows={promotions} columns={columns} loading={loading} />
            </Paper>
            <PromotionModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} promotionToEdit={editingPromotion} />
        </Box>
    );
}