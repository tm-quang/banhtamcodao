/**
 * Customer Group Modal Component
 * @file src/components/admin/CustomerGroupModal.js
 */
'use client';
import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    IconButton, CircularProgress, alpha, Box, Typography, Switch, FormControlLabel, Paper
} from '@mui/material';
import { X, Users, Info, Award, TrendingUp, Settings, CheckCircle } from 'lucide-react';

// Section Header Component
const SectionHeader = ({ icon: Icon, title, color = '#2563eb' }) => (
    <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: alpha(color, 0.1) }}>
            <Icon size={16} style={{ color }} />
        </div>
        <span className="text-sm font-semibold text-gray-700">{title}</span>
    </div>
);

export default function CustomerGroupModal({ open, onClose, onSave, groupToEdit }) {
    const [group, setGroup] = useState({
        name: '',
        description: '',
        min_points: 0,
        points_per_amount: 1000,
        display_order: 0,
        is_active: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = Boolean(groupToEdit);

    useEffect(() => {
        if (open) {
            setGroup(groupToEdit
                ? { ...groupToEdit }
                : {
                    name: '',
                    description: '',
                    min_points: 0,
                    points_per_amount: 1000,
                    display_order: 0,
                    is_active: true
                }
            );
        }
    }, [open, groupToEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setGroup(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value)
        }));
    };

    const handleSave = async () => {
        if (!group.name || group.min_points === undefined || group.points_per_amount === undefined) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setIsSubmitting(true);
        await onSave(group);
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
            {/* Header */}
            <DialogTitle sx={{
                p: 0,
                background: isEditMode
                    ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                    : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            }}>
                <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Users size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {isEditMode ? 'Chỉnh sửa nhóm khách hàng' : 'Thêm nhóm khách hàng mới'}
                            </h2>
                            {isEditMode && (
                                <p className="text-white/80 text-sm">{groupToEdit?.name}</p>
                            )}
                        </div>
                    </div>
                    <IconButton onClick={onClose} sx={{ color: 'white' }}>
                        <X size={20} />
                    </IconButton>
                </div>
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
                <div className="space-y-5">
                    {/* Section 1: Thông tin cơ bản */}
                    <div className="mt-4">
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                bgcolor: '#f8fafc',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <SectionHeader icon={Info} title="Thông tin cơ bản" color="#2563eb" />
                            <div className="space-y-3">
                                <TextField
                                    name="name"
                                    label="Tên nhóm *"
                                    value={group.name}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    size="small"
                                    placeholder="VD: Khách hàng VIP, Khách hàng thân thiết..."
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
                                />
                                <TextField
                                    name="description"
                                    label="Mô tả"
                                    value={group.description}
                                    onChange={handleChange}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    size="small"
                                    placeholder="Mô tả về nhóm khách hàng này..."
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
                                />
                            </div>
                        </Paper>
                    </div>

                    {/* Section 2: Điều kiện thăng hạng */}
                    <div>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                bgcolor: '#f8fafc',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <SectionHeader icon={TrendingUp} title="Điều kiện thăng hạng" color="#f59e0b" />
                            <div className="space-y-3">
                                <TextField
                                    name="min_points"
                                    label="Điểm tối thiểu *"
                                    type="number"
                                    value={group.min_points}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    size="small"
                                    inputProps={{ min: 0, step: 1 }}
                                    helperText="Điểm tích lũy tối thiểu để đạt nhóm này"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
                                />
                                <TextField
                                    name="points_per_amount"
                                    label="Tỷ lệ tích điểm *"
                                    type="number"
                                    value={group.points_per_amount}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    size="small"
                                    inputProps={{ min: 1, step: 100 }}
                                    helperText="Số tiền (VNĐ) để được 1 điểm. VD: 1000 = mỗi 1000đ được 1 điểm"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
                                />
                                <TextField
                                    name="display_order"
                                    label="Thứ tự hiển thị"
                                    type="number"
                                    value={group.display_order}
                                    onChange={handleChange}
                                    fullWidth
                                    size="small"
                                    inputProps={{ min: 0, step: 1 }}
                                    helperText="Số càng lớn = ưu tiên cao hơn (dùng để chọn nhóm khi có cùng điểm)"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
                                />
                            </div>
                        </Paper>
                    </div>

                    {/* Section 3: Chính sách (Placeholder cho tương lai) */}
                    <div>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                bgcolor: '#f8fafc',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <SectionHeader icon={Settings} title="Chính sách nhóm" color="#8b5cf6" />
                            <Box sx={{ 
                                p: 2, 
                                borderRadius: 2, 
                                bgcolor: 'white',
                                border: '1px dashed',
                                borderColor: alpha('#8b5cf6', 0.3),
                            }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    Tính năng quản lý chính sách cho từng nhóm khách hàng sẽ được phát triển trong tương lai.
                                    <br />
                                    Các chính sách có thể bao gồm: giảm giá, ưu đãi đặc biệt, quà tặng, v.v.
                                </Typography>
                            </Box>
                        </Paper>
                    </div>

                    {/* Section 4: Tùy chọn */}
                    <div>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: 2,
                                bgcolor: '#f8fafc',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <SectionHeader icon={CheckCircle} title="Tùy chọn" color="#10b981" />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={group.is_active}
                                        onChange={handleChange}
                                        name="is_active"
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>Kích hoạt nhóm</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Chỉ nhóm đang hoạt động mới được áp dụng cho khách hàng
                                        </Typography>
                                    </Box>
                                }
                            />
                        </Paper>
                    </div>
                </div>
            </DialogContent>

            {/* Footer Actions */}
            <DialogActions sx={{
                p: 2.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: '#fafafa',
                gap: 1.5
            }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        textTransform: 'none',
                        borderColor: 'divider',
                        color: 'text.secondary'
                    }}
                >
                    Hủy bỏ
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={isSubmitting || !group.name}
                    startIcon={isSubmitting ? <CircularProgress size={16} /> : <CheckCircle size={16} />}
                    sx={{
                        borderRadius: 2,
                        px: 4,
                        textTransform: 'none',
                        fontWeight: 600,
                        bgcolor: isEditMode ? '#2563eb' : '#16a34a',
                        '&:hover': {
                            bgcolor: isEditMode ? '#1d4ed8' : '#15803d',
                        }
                    }}
                >
                    {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm nhóm')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

