// src/app/(admin)/dashboard/categories/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { Box, Button, Paper, Typography, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CategoryModal from '@/components/admin/CategoryModal';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const router = useRouter();

    const fetchCategories = async () => {
        setLoading(true);
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        if (data.success) {
            setCategories(data.categories);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);
    
    const handleSave = async (categoryData) => {
        const isEditMode = Boolean(categoryData.id);
        const url = isEditMode ? `/api/admin/categories/${categoryData.id}` : '/api/admin/categories';
        const method = isEditMode ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData),
        });

        if (res.ok) {
            alert(`Thao tác thành công!`);
            setIsModalOpen(false);
            fetchCategories(); // Tải lại dữ liệu
        } else {
            alert('Có lỗi xảy ra!');
        }
    };
    
    const handleDelete = async (id) => {
        if(confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Xóa thành công!');
                fetchCategories();
            } else {
                alert('Xóa thất bại!');
            }
        }
    }

    const columns = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'name', headerName: 'Tên Danh mục', flex: 1 },
        { field: 'slug', headerName: 'Slug', flex: 1 },
        { field: 'parent_id', headerName: 'ID Danh mục cha', width: 150 },
        {
            field: 'actions', headerName: 'Hành động', width: 120,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => { setEditingCategory(params.row); setIsModalOpen(true); }}><Edit size={18}/></IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id)} color="error"><Trash2 size={18}/></IconButton>
                </Box>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>Quản lý Danh mục</Typography>
                <Button variant="contained" startIcon={<PlusCircle />} onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}>
                    Thêm Danh mục
                </Button>
            </Box>
            <Paper sx={{ height: '70vh', width: '100%' }}>
                <DataGrid
                    rows={categories}
                    columns={columns}
                    loading={loading}
                    pageSizeOptions={[10, 25, 50]}
                />
            </Paper>
            <CategoryModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                categoryToEdit={editingCategory}
                categories={categories}
            />
        </Box>
    );
}