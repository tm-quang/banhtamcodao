// src/components/admin/CustomerModal.js
'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, MenuItem } from '@mui/material';

export default function CustomerModal({ open, onClose, onSave, customerToEdit }) {
    const [data, setData] = useState({ full_name: '', username: '', email: '', phone_number: '', password: '', role: 'customer', status: 'active' });

    const isEditMode = Boolean(customerToEdit);

    useEffect(() => {
        if (open) {
            setData(customerToEdit ? { ...customerToEdit, password: '' } : { full_name: '', username: '', email: '', phone_number: '', password: '', role: 'customer', status: 'active' });
        }
    }, [open, customerToEdit]);

    const handleChange = (e) => {
        setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = () => {
        onSave(data);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEditMode ? 'Chỉnh Sửa Khách Hàng' : 'Thêm Khách Hàng Mới'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}><TextField name="full_name" label="Họ và Tên" value={data.full_name} onChange={handleChange} fullWidth required /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="username" label="Tên đăng nhập" value={data.username} onChange={handleChange} fullWidth required disabled={isEditMode} /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="email" label="Email" type="email" value={data.email || ''} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="phone_number" label="Số điện thoại" value={data.phone_number || ''} onChange={handleChange} fullWidth /></Grid>
                    {!isEditMode && <Grid item xs={12}><TextField name="password" label="Mật khẩu" type="password" onChange={handleChange} fullWidth required /></Grid>}
                    <Grid item xs={12} sm={6}>
                        <TextField name="role" label="Vai trò" value={data.role} onChange={handleChange} select fullWidth>
                            <MenuItem value="customer">Customer</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField name="status" label="Trạng thái" value={data.status} onChange={handleChange} select fullWidth>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={handleSave} variant="contained">Lưu</Button>
            </DialogActions>
        </Dialog>
    );
}