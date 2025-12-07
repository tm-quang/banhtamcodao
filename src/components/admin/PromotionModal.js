// src/components/admin/PromotionModal.js
'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Grid, TextField, MenuItem, Box, Typography, IconButton, alpha, CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import { Ticket, X, Percent, DollarSign, Calendar, CheckCircle } from 'lucide-react';

const formatDateForInput = (date) => {
    if (!date) return '';
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
};

// Section Header Component
const SectionHeader = ({ icon: Icon, title, color }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, mt: 2 }}>
        <Box sx={{
            width: 32, height: 32, borderRadius: 1.5,
            bgcolor: alpha(color, 0.1),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Icon size={16} color={color} />
        </Box>
        <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.9rem' }}>
            {title}
        </Typography>
    </Box>
);

export default function PromotionModal({ open, onClose, onSave, promotionToEdit }) {
    const [data, setData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    const handleSave = async () => {
        setIsSubmitting(true);
        await onSave(data);
        setIsSubmitting(false);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: 'hidden',
                }
            }}
        >
            {/* Gradient Header */}
            <Box sx={{
                background: isEditMode
                    ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 44, height: 44, borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Ticket size={24} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {isEditMode ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
                        </Typography>
                        {isEditMode && (
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {promotionToEdit?.promo_code}
                            </Typography>
                        )}
                    </Box>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <X size={20} />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 3 }}>
                {/* Basic Info Section */}
                <SectionHeader icon={Ticket} title="Thông tin cơ bản" color="#8b5cf6" />
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="promo_code"
                            label="Mã khuyến mãi"
                            value={data.promo_code || ''}
                            onChange={handleChange}
                            fullWidth
                            required
                            size="small"
                            placeholder="VD: SALE50"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="title"
                            label="Tên chương trình"
                            value={data.title || ''}
                            onChange={handleChange}
                            fullWidth
                            required
                            size="small"
                            placeholder="VD: Giảm 50% đơn hàng"
                        />
                    </Grid>
                </Grid>

                {/* Discount Section */}
                <SectionHeader icon={Percent} title="Giá trị giảm" color="#10b981" />
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="discount_type"
                            label="Loại giảm giá"
                            value={data.discount_type || 'percent'}
                            onChange={handleChange}
                            select
                            fullWidth
                            size="small"
                        >
                            <MenuItem value="percent">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Percent size={14} /> Phần trăm (%)
                                </Box>
                            </MenuItem>
                            <MenuItem value="fixed">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <DollarSign size={14} /> Số tiền cố định
                                </Box>
                            </MenuItem>
                            <MenuItem value="free_shipping">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Ticket size={14} /> Miễn phí ship
                                </Box>
                            </MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="discount_value"
                            label="Giá trị giảm"
                            type="number"
                            value={data.discount_value || ''}
                            onChange={handleChange}
                            fullWidth
                            required
                            size="small"
                            placeholder={data.discount_type === 'percent' ? 'VD: 50' : 'VD: 50000'}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="min_order_value"
                            label="Đơn tối thiểu"
                            type="number"
                            value={data.min_order_value || ''}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            placeholder="VD: 100000"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="status"
                            label="Trạng thái"
                            value={data.status || 'active'}
                            onChange={handleChange}
                            select
                            fullWidth
                            size="small"
                        >
                            <MenuItem value="active">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                                    Hoạt động
                                </Box>
                            </MenuItem>
                            <MenuItem value="inactive">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#6b7280' }} />
                                    Tắt
                                </Box>
                            </MenuItem>
                        </TextField>
                    </Grid>
                </Grid>

                {/* Time Section */}
                <SectionHeader icon={Calendar} title="Thời gian áp dụng" color="#f59e0b" />
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="start_date"
                            label="Bắt đầu"
                            type="datetime-local"
                            value={data.start_date || ''}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="end_date"
                            label="Kết thúc"
                            type="datetime-local"
                            value={data.end_date || ''}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                >
                    Hủy bỏ
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircle size={18} />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                        fontWeight: 600,
                        bgcolor: isEditMode ? '#8b5cf6' : '#10b981',
                        '&:hover': { bgcolor: isEditMode ? '#7c3aed' : '#059669' }
                    }}
                >
                    {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm mới')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}