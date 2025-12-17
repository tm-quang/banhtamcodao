// src/components/admin/ProductModal.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, MenuItem, Box, Typography, Switch, FormControlLabel,
    CircularProgress, IconButton, alpha, Chip
} from '@mui/material';
import { X, Upload, ImagePlus, Package, Tag, DollarSign, Star, Info, CheckCircle } from 'lucide-react';
import Image from 'next/image';

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

const initialProductState = {
    name: '', slug: '', description: '', image_url: '', price: '',
    discount_price: '', category_id: '', status: 'active', is_special: false
};

// Section Header Component
const SectionHeader = ({ icon: Icon, title, color = '#3b82f6' }) => (
    <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: alpha(color, 0.1) }}>
            <Icon size={16} style={{ color }} />
        </div>
        <span className="text-sm font-semibold text-gray-700">{title}</span>
    </div>
);

export default function ProductModal({ open, onClose, categories, productToEdit }) {
    const router = useRouter();
    const [product, setProduct] = useState(initialProductState);
    const [imagePreview, setImagePreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const isEditMode = Boolean(productToEdit);

    useEffect(() => {
        if (open) {
            if (isEditMode && productToEdit) {
                setProduct({
                    ...initialProductState,
                    ...productToEdit,
                    is_special: Boolean(productToEdit.is_special)
                });
                setImagePreview(productToEdit.image_url || '');
            } else {
                setProduct(initialProductState);
                setImagePreview('');
            }
        }
    }, [open, productToEdit, isEditMode]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        setProduct(prev => {
            const newState = { ...prev, [name]: val };
            if (name === 'name') {
                newState.slug = slugify(val);
            }
            return newState;
        });
    };

    const handleImageUpload = async (file) => {
        if (!file) return;

        setIsUploading(true);
        setImagePreview(URL.createObjectURL(file));

        try {
            // Use Server Action for secure upload (uses private CLOUDINARY_API_SECRET)
            const { uploadImage } = await import('@/app/actions/cloudinary');
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'banhtamcodao');

            const result = await uploadImage(formData);

            if (!result.success) {
                throw new Error(result.error || 'Upload failed');
            }

            const secureUrl = result.url;
            setProduct(prev => ({ ...prev, image_url: secureUrl }));
            setImagePreview(secureUrl);
        } catch (error) {
            console.error("Image upload failed:", error);
            alert(`Tải ảnh thất bại: ${error.message}`);
            setImagePreview(productToEdit?.image_url || '');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        handleImageUpload(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const apiUrl = isEditMode ? `/api/admin/products/${productToEdit.id}` : '/api/admin/products';
        const method = isEditMode ? 'PUT' : 'POST';

        const res = await fetch(apiUrl, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...product, is_special: product.is_special ? 1 : 0 }),
        });

        if (res.ok) {
            onClose();
            router.refresh();
        } else {
            alert('Có lỗi xảy ra!');
        }
        setIsSubmitting(false);
    };

    const formatPrice = (value) => {
        if (!value) return '';
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
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
                    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                    : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            }}>
                <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Package size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {isEditMode ? 'Chỉnh sửa món' : 'Thêm món mới'}
                            </h2>
                            {isEditMode && (
                                <p className="text-white/80 text-sm">{productToEdit?.name}</p>
                            )}
                        </div>
                    </div>
                    <IconButton onClick={onClose} sx={{ color: 'white' }}>
                        <X size={20} />
                    </IconButton>
                </div>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ p: 0 }}>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                        {/* Left Column - Main Info */}
                        <div className="lg:col-span-3 p-5 space-y-5">
                            {/* Basic Info Section */}
                            <div>
                                <SectionHeader icon={Info} title="Thông tin cơ bản" color="#3b82f6" />
                                <div className="space-y-3">
                                    <TextField
                                        name="name"
                                        label="Tên món ăn"
                                        value={product.name || ''}
                                        onChange={handleInputChange}
                                        fullWidth
                                        required
                                        size="small"
                                        placeholder="VD: Bánh Tầm Cô Đào"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            }
                                        }}
                                    />
                                    <TextField
                                        name="slug"
                                        label="Slug (URL)"
                                        value={product.slug || ''}
                                        onChange={handleInputChange}
                                        fullWidth
                                        size="small"
                                        helperText="Tự động tạo từ tên, có thể sửa lại"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                bgcolor: '#f8fafc',
                                            }
                                        }}
                                    />
                                    <TextField
                                        name="description"
                                        label="Mô tả"
                                        value={product.description || ''}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={3}
                                        fullWidth
                                        size="small"
                                        placeholder="Mô tả ngắn về món ăn..."
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Price Section */}
                            <div>
                                <SectionHeader icon={DollarSign} title="Giá bán" color="#10b981" />
                                <div className="grid grid-cols-2 gap-3">
                                    <TextField
                                        name="price"
                                        label="Giá gốc"
                                        type="number"
                                        value={product.price || ''}
                                        onChange={handleInputChange}
                                        fullWidth
                                        required
                                        size="small"
                                        InputProps={{
                                            endAdornment: <span className="text-gray-400 text-sm">VNĐ</span>
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            }
                                        }}
                                    />
                                    <TextField
                                        name="discount_price"
                                        label="Giá khuyến mãi"
                                        type="number"
                                        value={product.discount_price || ''}
                                        onChange={handleInputChange}
                                        fullWidth
                                        size="small"
                                        placeholder="Để trống nếu không KM"
                                        InputProps={{
                                            endAdornment: <span className="text-gray-400 text-sm">VNĐ</span>
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            }
                                        }}
                                    />
                                </div>
                                {product.discount_price && product.price && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <Chip
                                            label={`Giảm ${Math.round((1 - product.discount_price / product.price) * 100)}%`}
                                            size="small"
                                            sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', fontWeight: 600 }}
                                        />
                                        <span className="text-sm text-gray-500">
                                            Tiết kiệm {formatPrice(product.price - product.discount_price)}đ
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Category & Status */}
                            <div>
                                <SectionHeader icon={Tag} title="Phân loại" color="#8b5cf6" />
                                <div className="grid grid-cols-2 gap-3">
                                    <TextField
                                        name="category_id"
                                        label="Danh mục"
                                        value={product.category_id || ''}
                                        onChange={handleInputChange}
                                        select
                                        fullWidth
                                        required
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            }
                                        }}
                                    >
                                        {categories.map(cat => (
                                            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                        ))}
                                    </TextField>
                                    <TextField
                                        name="status"
                                        label="Trạng thái"
                                        value={product.status || 'active'}
                                        onChange={handleInputChange}
                                        select
                                        fullWidth
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                            }
                                        }}
                                    >
                                        <MenuItem value="active">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                Đang bán
                                            </span>
                                        </MenuItem>
                                        <MenuItem value="inactive">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                                Ngưng bán
                                            </span>
                                        </MenuItem>
                                        <MenuItem value="hidden">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                Ẩn
                                            </span>
                                        </MenuItem>
                                    </TextField>
                                </div>
                            </div>

                            {/* Special Toggle */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                            <Star size={20} className="text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Món nổi bật / Bán chạy</p>
                                            <p className="text-sm text-gray-500">Hiển thị trên trang chủ</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={product.is_special}
                                        onChange={handleInputChange}
                                        name="is_special"
                                        color="warning"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Image Upload */}
                        <div className="lg:col-span-2 bg-gray-50 p-5 border-l border-gray-100">
                            <SectionHeader icon={ImagePlus} title="Hình ảnh" color="#f59e0b" />

                            {/* Image Preview or Upload Area */}
                            <div
                                className={`
                                    relative rounded-xl border-2 border-dashed transition-all cursor-pointer
                                    ${dragOver
                                        ? 'border-blue-500 bg-blue-50'
                                        : imagePreview
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-gray-300 bg-white hover:border-gray-400'
                                    }
                                `}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                {imagePreview ? (
                                    <div className="relative aspect-square">
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover rounded-xl"
                                        />
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                                                <CircularProgress size={40} sx={{ color: 'white' }} />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <Chip
                                                icon={<CheckCircle size={14} />}
                                                label="Đã tải"
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(255,255,255,0.9)',
                                                    color: '#16a34a',
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center aspect-square cursor-pointer">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                                            <Upload size={28} className="text-gray-400" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">Kéo thả ảnh vào đây</p>
                                        <p className="text-xs text-gray-400 mt-1">hoặc click để chọn file</p>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileInput}
                                            accept="image/*"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Upload Button */}
                            {imagePreview && (
                                <Button
                                    component="label"
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<Upload size={16} />}
                                    disabled={isUploading}
                                    sx={{
                                        mt: 2,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        borderColor: 'divider',
                                    }}
                                >
                                    Thay đổi ảnh
                                    <input
                                        type="file"
                                        hidden
                                        onChange={handleFileInput}
                                        accept="image/*"
                                    />
                                </Button>
                            )}

                            {/* URL Input */}
                            <div className="mt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex-1 h-px bg-gray-200"></div>
                                    <span className="text-xs text-gray-400">hoặc</span>
                                    <div className="flex-1 h-px bg-gray-200"></div>
                                </div>
                                <TextField
                                    name="image_url"
                                    label="Dán URL ảnh"
                                    value={product.image_url || ''}
                                    onChange={handleInputChange}
                                    fullWidth
                                    size="small"
                                    placeholder="https://..."
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            bgcolor: 'white',
                                        }
                                    }}
                                />
                            </div>

                            {/* Tips */}
                            <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                                <p className="text-xs text-blue-700 font-medium mb-1">💡 Gợi ý</p>
                                <ul className="text-xs text-blue-600 space-y-0.5">
                                    <li>• Ảnh vuông, tối thiểu 500x500px</li>
                                    <li>• Nền sáng, món ăn rõ nét</li>
                                    <li>• Định dạng JPG/PNG/WebP</li>
                                </ul>
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
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || isUploading}
                        startIcon={isSubmitting ? <CircularProgress size={16} /> : <CheckCircle size={16} />}
                        sx={{
                            borderRadius: 2,
                            px: 4,
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: isEditMode ? '#3b82f6' : '#16a34a',
                            '&:hover': {
                                bgcolor: isEditMode ? '#2563eb' : '#15803d',
                            }
                        }}
                    >
                        {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm món')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}