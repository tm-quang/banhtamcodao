// src/components/admin/PromotionModal.js
'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, MenuItem } from '@mui/material';
import { format } from 'date-fns';

const formatDateForInput = (date) => {
    if (!date) return '';
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
};

export default function PromotionModal({ open, onClose, onSave, promotionToEdit }) {
    const [data, setData] = useState({});
    const isEditMode = Boolean(promotionToEdit);

    useEffect(() => {
        if (open) {
            const initialState = {
                promo_code: '', title: '', discount_type: 'percent', discount_value: '',
                min_order_value: '', start_date: '', end_date: '', status: 'active'
            };
            const editState = promotionToEdit ? {
                ...promotionToEdit,
                start_date: formatDateForInput(promotionToEdit.start_date),
                end_date: formatDateForInput(promotionToEdit.end_date),
            } : {};
            setData(isEditMode ? editState : initialState);
        }
    }, [open, promotionToEdit, isEditMode]);

    const handleChange = (e) => setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSave = () => onSave(data);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{isEditMode ? 'Chỉnh Sửa Khuyến Mãi' : 'Thêm Khuyến Mãi Mới'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}><TextField name="title" label="Tên chương trình" value={data.title || ''} onChange={handleChange} fullWidth required /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="promo_code" label="Mã khuyến mãi" value={data.promo_code || ''} onChange={handleChange} fullWidth required /></Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField name="discount_type" label="Loại giảm giá" value={data.discount_type || 'percent'} onChange={handleChange} select fullWidth>
                            <MenuItem value="percent">Phần trăm (%)</MenuItem>
                            <MenuItem value="fixed">Số tiền cố định</MenuItem>
                            <MenuItem value="free_shipping">Miễn phí ship</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}><TextField name="discount_value" label="Giá trị giảm" type="number" value={data.discount_value || ''} onChange={handleChange} fullWidth required /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="min_order_value" label="Giá trị đơn tối thiểu" type="number" value={data.min_order_value || ''} onChange={handleChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}>
                         <TextField name="status" label="Trạng thái" value={data.status || 'active'} onChange={handleChange} select fullWidth>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}><TextField name="start_date" label="Ngày bắt đầu" type="datetime-local" value={data.start_date || ''} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="end_date" label="Ngày kết thúc" type="datetime-local" value={data.end_date || ''} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={handleSave} variant="contained">Lưu</Button>
            </DialogActions>
        </Dialog>
    );
}