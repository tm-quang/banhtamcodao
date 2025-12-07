// src/components/admin/CategoryModal.js
'use client';
import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem,
    IconButton, CircularProgress, alpha
} from '@mui/material';
import { X, FolderTree, Info, Link2, Layers, CheckCircle } from 'lucide-react';

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

// Section Header Component
const SectionHeader = ({ icon: Icon, title, color = '#8b5cf6' }) => (
    <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: alpha(color, 0.1) }}>
            <Icon size={16} style={{ color }} />
        </div>
        <span className="text-sm font-semibold text-gray-700">{title}</span>
    </div>
);

export default function CategoryModal({ open, onClose, onSave, categoryToEdit, categories }) {
    const [category, setCategory] = useState({ name: '', slug: '', parent_id: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = Boolean(categoryToEdit);

    useEffect(() => {
        if (open) {
            setCategory(categoryToEdit
                ? { ...categoryToEdit, parent_id: categoryToEdit.parent_id || '' }
                : { name: '', slug: '', parent_id: '' }
            );
        }
    }, [open, categoryToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategory(prev => ({ ...prev, [name]: value }));
        if (name === 'name') {
            setCategory(prev => ({ ...prev, slug: slugify(value) }));
        }
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        await onSave(category);
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
                    ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                    : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            }}>
                <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <FolderTree size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {isEditMode ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                            </h2>
                            {isEditMode && (
                                <p className="text-white/80 text-sm">{categoryToEdit?.name}</p>
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
                    {/* Basic Info */}
                    <div>
                        <SectionHeader icon={Info} title="Thông tin cơ bản" color="#8b5cf6" />
                        <div className="space-y-3">
                            <TextField
                                name="name"
                                label="Tên danh mục"
                                value={category.name}
                                onChange={handleChange}
                                fullWidth
                                required
                                size="small"
                                placeholder="VD: Món chính, Đồ uống..."
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                            <TextField
                                name="slug"
                                label="Slug (URL)"
                                value={category.slug}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                                helperText="Tự động tạo từ tên, có thể sửa lại"
                                InputProps={{
                                    startAdornment: <Link2 size={14} className="text-gray-400 mr-2" />
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: '#f8fafc',
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Parent Category */}
                    <div>
                        <SectionHeader icon={Layers} title="Phân cấp" color="#f59e0b" />
                        <TextField
                            name="parent_id"
                            label="Danh mục cha"
                            value={category.parent_id}
                            onChange={handleChange}
                            select
                            fullWidth
                            size="small"
                            helperText="Chọn để tạo danh mục con, hoặc để trống để tạo danh mục gốc"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        >
                            <MenuItem value="">
                                <span className="flex items-center gap-2 text-gray-500">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Không có (Danh mục gốc)
                                </span>
                            </MenuItem>
                            {categories.filter(c => c.id !== category.id).map(c => (
                                <MenuItem key={c.id} value={c.id}>
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                        {c.name}
                                    </span>
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>

                    {/* Info Box */}
                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                        <p className="text-xs text-purple-700 font-medium mb-1">💡 Gợi ý</p>
                        <ul className="text-xs text-purple-600 space-y-0.5">
                            <li>• Danh mục gốc: Món chính, Đồ uống, Tráng miệng...</li>
                            <li>• Danh mục con: Bánh tầm, Nước ép, Chè...</li>
                        </ul>
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
                    disabled={isSubmitting || !category.name}
                    startIcon={isSubmitting ? <CircularProgress size={16} /> : <CheckCircle size={16} />}
                    sx={{
                        borderRadius: 2,
                        px: 4,
                        textTransform: 'none',
                        fontWeight: 600,
                        bgcolor: isEditMode ? '#8b5cf6' : '#16a34a',
                        '&:hover': {
                            bgcolor: isEditMode ? '#7c3aed' : '#15803d',
                        }
                    }}
                >
                    {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm danh mục')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}