// src/components/admin/CustomerModal.js
'use client';
import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem,
    IconButton, CircularProgress, alpha
} from '@mui/material';
import { X, User, Mail, Phone, Shield, CheckCircle } from 'lucide-react';

// Section Header Component
const SectionHeader = ({ icon: Icon, title, color = '#06b6d4' }) => (
    <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: alpha(color, 0.1) }}>
            <Icon size={16} style={{ color }} />
        </div>
        <span className="text-sm font-semibold text-gray-700">{title}</span>
    </div>
);

export default function CustomerModal({ open, onClose, onSave, customerToEdit }) {
    const [data, setData] = useState({
        full_name: '', username: '', email: '', phone_number: '',
        password: '', role: 'customer', status: 'active'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = Boolean(customerToEdit);

    useEffect(() => {
        if (open) {
            setData(customerToEdit
                ? { ...customerToEdit, password: '' }
                : { full_name: '', username: '', email: '', phone_number: '', password: '', role: 'customer', status: 'active' }
            );
        }
    }, [open, customerToEdit]);

    const handleChange = (e) => {
        setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

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
            {/* Header */}
            <DialogTitle sx={{
                p: 0,
                background: isEditMode
                    ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                    : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            }}>
                <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <User size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {isEditMode ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
                            </h2>
                            {isEditMode && (
                                <p className="text-white/80 text-sm">{customerToEdit?.full_name}</p>
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
                    {/* Personal Info */}
                    <div>
                        <SectionHeader icon={User} title="Thông tin cá nhân" color="#06b6d4" />
                        <div className="grid grid-cols-2 gap-3">
                            <TextField
                                name="full_name"
                                label="Họ và tên"
                                value={data.full_name}
                                onChange={handleChange}
                                fullWidth
                                required
                                size="small"
                                sx={{
                                    gridColumn: 'span 2',
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                }}
                            />
                            <TextField
                                name="username"
                                label="Tên đăng nhập"
                                value={data.username}
                                onChange={handleChange}
                                fullWidth
                                required
                                disabled={isEditMode}
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: isEditMode ? '#f8fafc' : 'white',
                                    }
                                }}
                            />
                            {!isEditMode && (
                                <TextField
                                    name="password"
                                    label="Mật khẩu"
                                    type="password"
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    size="small"
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <SectionHeader icon={Mail} title="Thông tin liên hệ" color="#10b981" />
                        <div className="grid grid-cols-2 gap-3">
                            <TextField
                                name="email"
                                label="Email"
                                type="email"
                                value={data.email || ''}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                                InputProps={{
                                    startAdornment: <Mail size={14} className="text-gray-400 mr-2" />
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                }}
                            />
                            <TextField
                                name="phone_number"
                                label="Số điện thoại"
                                value={data.phone_number || ''}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                                InputProps={{
                                    startAdornment: <Phone size={14} className="text-gray-400 mr-2" />
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                }}
                            />
                        </div>
                    </div>

                    {/* Role & Status */}
                    <div>
                        <SectionHeader icon={Shield} title="Phân quyền" color="#8b5cf6" />
                        <div className="grid grid-cols-2 gap-3">
                            <TextField
                                name="role"
                                label="Vai trò"
                                value={data.role}
                                onChange={handleChange}
                                select
                                fullWidth
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                }}
                            >
                                <MenuItem value="customer">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                                        Khách hàng
                                    </span>
                                </MenuItem>
                                <MenuItem value="admin">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                        Admin
                                    </span>
                                </MenuItem>
                            </TextField>
                            <TextField
                                name="status"
                                label="Trạng thái"
                                value={data.status}
                                onChange={handleChange}
                                select
                                fullWidth
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                }}
                            >
                                <MenuItem value="active">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        Hoạt động
                                    </span>
                                </MenuItem>
                                <MenuItem value="inactive">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                        Tạm khóa
                                    </span>
                                </MenuItem>
                            </TextField>
                        </div>
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
                    disabled={isSubmitting || !data.full_name || !data.username}
                    startIcon={isSubmitting ? <CircularProgress size={16} /> : <CheckCircle size={16} />}
                    sx={{
                        borderRadius: 2,
                        px: 4,
                        textTransform: 'none',
                        fontWeight: 600,
                        bgcolor: isEditMode ? '#06b6d4' : '#16a34a',
                        '&:hover': {
                            bgcolor: isEditMode ? '#0891b2' : '#15803d',
                        }
                    }}
                >
                    {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm khách hàng')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}