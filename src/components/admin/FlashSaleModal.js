// src/components/admin/FlashSaleModal.js
'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Grid, TextField, MenuItem, Box, Typography, IconButton, alpha, CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import { Zap, X, Percent, DollarSign, Calendar, CheckCircle, Image, Link as LinkIcon, Palette } from 'lucide-react';

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

// Color Picker Preset
const colorPresets = [
    { color: '#FFD93D', name: 'Vàng Gold' },
    { color: '#FF6B6B', name: 'Đỏ Coral' },
    { color: '#4ECDC4', name: 'Xanh Mint' },
    { color: '#9B59B6', name: 'Tím Purple' },
    { color: '#3498DB', name: 'Xanh Blue' },
    { color: '#E67E22', name: 'Cam Orange' },
    { color: '#1ABC9C', name: 'Xanh Emerald' },
    { color: '#E91E63', name: 'Hồng Pink' },
];

export default function FlashSaleModal({ open, onClose, onSave, flashSaleToEdit }) {
    const [data, setData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = Boolean(flashSaleToEdit);

    useEffect(() => {
        if (open) {
            const initialState = {
                name: '',
                description: '',
                badge_text: 'FLASH',
                badge_color: '#FFD93D',
                discount_value: '',
                discount_type: 'percent',
                image_url: '',
                link_url: '/menu',
                start_date: '',
                end_date: '',
                priority: 0,
                status: 'active'
            };
            const editState = flashSaleToEdit ? {
                ...flashSaleToEdit,
                start_date: formatDateForInput(flashSaleToEdit.start_date),
                end_date: formatDateForInput(flashSaleToEdit.end_date),
            } : {};
            setData(isEditMode ? editState : initialState);
        }
    }, [open, flashSaleToEdit, isEditMode]);

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
            maxWidth="md"
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
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(135deg, #FFD93D 0%, #f59e0b 100%)',
                color: isEditMode ? 'white' : '#222',
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 44, height: 44, borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Zap size={24} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {isEditMode ? 'Chỉnh sửa Flash Sale' : 'Thêm Flash Sale mới'}
                        </Typography>
                        {isEditMode && (
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {flashSaleToEdit?.name}
                            </Typography>
                        )}
                    </Box>
                </Box>
                <IconButton onClick={onClose} sx={{ color: isEditMode ? 'white' : '#222' }}>
                    <X size={20} />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 3 }}>
                {/* Basic Info Section */}
                <SectionHeader icon={Zap} title="Thông tin cơ bản" color="#f59e0b" />
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                        <TextField
                            name="name"
                            label="Tên chương trình"
                            value={data.name || ''}
                            onChange={handleChange}
                            fullWidth
                            required
                            size="small"
                            placeholder="VD: Flash Sale Giờ Vàng"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            name="priority"
                            label="Thứ tự hiển thị"
                            type="number"
                            value={data.priority || 0}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            placeholder="0"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="description"
                            label="Mô tả"
                            value={data.description || ''}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                            placeholder="Mô tả chi tiết về chương trình Flash Sale..."
                        />
                    </Grid>
                </Grid>

                {/* Visual Section */}
                <SectionHeader icon={Palette} title="Giao diện hiển thị" color="#9b59b6" />
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            name="badge_text"
                            label="Badge Text"
                            value={data.badge_text || 'FLASH'}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            placeholder="VD: FLASH, -30%, HOT"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            name="badge_color"
                            label="Màu chủ đạo"
                            value={data.badge_color || '#FFD93D'}
                            onChange={handleChange}
                            select
                            fullWidth
                            size="small"
                        >
                            {colorPresets.map(({ color, name }) => (
                                <MenuItem key={color} value={color}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{
                                            width: 20, height: 20, borderRadius: 1,
                                            bgcolor: color,
                                            border: '2px solid rgba(0,0,0,0.1)'
                                        }} />
                                        {name}
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
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

                {/* Discount Section */}
                <SectionHeader icon={Percent} title="Giá trị giảm giá" color="#10b981" />
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
                                    <DollarSign size={14} /> Số tiền cố định (VND)
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
                            placeholder={data.discount_type === 'percent' ? 'VD: 30' : 'VD: 50000'}
                        />
                    </Grid>
                </Grid>

                {/* Links Section */}
                <SectionHeader icon={Image} title="Hình ảnh & Liên kết" color="#3498db" />
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="image_url"
                            label="URL hình ảnh"
                            value={data.image_url || ''}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            placeholder="/images/hero-dish_4.png"
                            InputProps={{
                                startAdornment: <Image size={16} style={{ marginRight: 8, opacity: 0.5 }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="link_url"
                            label="Link khi click"
                            value={data.link_url || '/menu'}
                            onChange={handleChange}
                            fullWidth
                            size="small"
                            placeholder="/menu"
                            InputProps={{
                                startAdornment: <LinkIcon size={16} style={{ marginRight: 8, opacity: 0.5 }} />
                            }}
                        />
                    </Grid>
                </Grid>

                {/* Time Section */}
                <SectionHeader icon={Calendar} title="Thời gian áp dụng" color="#e74c3c" />
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="start_date"
                            label="Bắt đầu"
                            type="datetime-local"
                            value={data.start_date || ''}
                            onChange={handleChange}
                            fullWidth
                            required
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
                            required
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>

                {/* Preview */}
                {data.badge_color && (
                    <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: alpha(data.badge_color, 0.1), border: `1px solid ${alpha(data.badge_color, 0.3)}` }}>
                        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 1 }}>Xem trước:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                px: 2, py: 0.5,
                                bgcolor: data.badge_color,
                                color: ['#FFD93D', '#4ECDC4', '#1ABC9C'].includes(data.badge_color) ? '#222' : '#fff',
                                borderRadius: 1,
                                fontWeight: 700,
                                fontSize: '0.85rem'
                            }}>
                                {data.badge_text || 'FLASH'}
                            </Box>
                            <Typography sx={{ fontWeight: 600 }}>{data.name || 'Tên chương trình'}</Typography>
                            {data.discount_value && (
                                <Typography sx={{ color: '#10b981', fontWeight: 700 }}>
                                    -{data.discount_value}{data.discount_type === 'percent' ? '%' : 'đ'}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                )}
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
                        bgcolor: '#f59e0b',
                        '&:hover': { bgcolor: '#d97706' }
                    }}
                >
                    {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm mới')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
