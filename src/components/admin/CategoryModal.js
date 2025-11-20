// src/components/admin/CategoryModal.js
'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';

const slugify = (str) => {
    if (!str) return '';
    str = str.toLowerCase();
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/[đĐ]/g, 'd');
    str = str.replace(/[^a-z0-9\s-]/g, '');
    str = str.replace(/[\s_-]+/g, '-');
    str = str.replace(/^-+|-+$/g, '');
    return str;
};

export default function CategoryModal({ open, onClose, onSave, categoryToEdit, categories }) {
    const [category, setCategory] = useState({ name: '', slug: '', parent_id: '' });

    useEffect(() => {
        if (open) {
            setCategory(categoryToEdit ? { ...categoryToEdit, parent_id: categoryToEdit.parent_id || '' } : { name: '', slug: '', parent_id: '' });
        }
    }, [open, categoryToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategory(prev => ({ ...prev, [name]: value }));
        if (name === 'name') {
            setCategory(prev => ({ ...prev, slug: slugify(value) }));
        }
    };

    const handleSave = () => {
        onSave(category);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{categoryToEdit ? 'Chỉnh Sửa Danh Mục' : 'Tạo Danh Mục Mới'}</DialogTitle>
            <DialogContent>
                <TextField name="name" label="Tên Danh mục" value={category.name} onChange={handleChange} fullWidth required margin="dense" />
                <TextField name="slug" label="Slug (URL)" value={category.slug} onChange={handleChange} fullWidth margin="dense" />
                <TextField name="parent_id" label="Danh mục cha" value={category.parent_id} onChange={handleChange} select fullWidth margin="dense">
                    <MenuItem value=""><em>Không có</em></MenuItem>
                    {categories.filter(c => c.id !== category.id).map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </TextField>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={handleSave} variant="contained">Lưu</Button>
            </DialogActions>
        </Dialog>
    );
}