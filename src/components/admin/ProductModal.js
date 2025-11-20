// src/components/admin/ProductModal.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, 
    TextField, MenuItem, Box, Typography, Switch, FormControlLabel, 
    CircularProgress, IconButton 
} from '@mui/material';
import { X as CloseIcon } from 'lucide-react';
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

export default function ProductModal({ open, onClose, categories, productToEdit }) {
    const router = useRouter();
    const [product, setProduct] = useState(initialProductState);
    const [imagePreview, setImagePreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
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
            // Sửa logic: Luôn cập nhật slug theo tên sản phẩm
            if (name === 'name') {
                newState.slug = slugify(val);
            }
            return newState;
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setImagePreview(URL.createObjectURL(file));

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        if (!cloudName) {
            alert('Lỗi: Chưa cấu hình Cloudinary Cloud Name!');
            setIsUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'banhtamcodao');

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        
        try {
            const uploadRes = await fetch(uploadUrl, { method: 'POST', body: formData });
            const uploadData = await uploadRes.json();
            if (uploadData.error) throw new Error(uploadData.error.message);
            
            const secureUrl = uploadData.secure_url;
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
            alert(isEditMode ? 'Cập nhật thành công!' : 'Thêm sản phẩm thành công!');
            onClose();
            router.refresh();
        } else {
            alert('Có lỗi xảy ra!');
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" component="div">
                    {isEditMode ? `Chỉnh Sửa Sản Phẩm: ${productToEdit.name}` : 'Thêm Sản Phẩm Mới'}
                </Typography>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        {/* --- CỘT TRÁI --- */}
                        <Grid item xs={12} md={8}>
                            <TextField name="name" label="Tên Món" value={product.name || ''} onChange={handleInputChange} fullWidth required />
                            <TextField name="slug" label="Slug (URL. tự động điền)" value={product.slug || ''} onChange={handleInputChange} fullWidth sx={{ mt: 2 }} helperText="Tự động tạo từ tên, có thể sửa lại." />
                            <TextField name="description" label="Mô Tả" value={product.description || ''} onChange={handleInputChange} multiline rows={2} fullWidth sx={{ mt: 2 }} />
                        </Grid>
                        
                        {/* --- CỘT PHẢI --- */}
                        <Grid item xs={12} md={4}>
                            <TextField name="status" label="Trạng Thái" value={product.status || 'active'} onChange={handleInputChange} select fullWidth>
                                <MenuItem value="active">Đang bán</MenuItem>
                                <MenuItem value="inactive">Ngưng bán</MenuItem>
                                <MenuItem value="hidden">Ẩn</MenuItem>
                            </TextField>
                            <TextField name="category_id" label="Danh Mục" value={product.category_id || ''} onChange={handleInputChange} select fullWidth required sx={{ mt: 2 }}>
                                 {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
                            </TextField>
                            <TextField name="price" label="Giá Bán" type="number" value={product.price || ''} onChange={handleInputChange} fullWidth required sx={{ mt: 2 }} />
                            <TextField name="discount_price" label="Giá Khuyến Mãi" type="number" value={product.discount_price || ''} onChange={handleInputChange} fullWidth sx={{ mt: 2 }} />
                        </Grid>

                        {/* --- PHẦN BÊN DƯỚI --- */}
                        <Grid item xs={12}>
                             <Box sx={{ border: '2px dashed #e0e0e0', borderRadius: 2, p: 2, textAlign: 'center' }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>HÌNH ẢNH SẢN PHẨM</Typography>
                                {imagePreview && (
                                     <Box sx={{ mb: 2, position: 'relative', width: 90, height: 90, mx: 'auto' }}>
                                         <Image src={imagePreview} alt="Xem trước" fill style={{ objectFit: 'cover', borderRadius: '8px' }} />
                                     </Box>
                                )}
                                 <Button component="label" variant="contained" disabled={isUploading}>
                                     {isUploading ? <CircularProgress size={20} sx={{mr: 1}} /> : null}
                                     Tải ảnh lên
                                     <input type="file" hidden onChange={handleImageUpload} accept="image/*" />
                                 </Button>
                                  <TextField name="image_url" label="Hoặc dán URL ảnh" value={product.image_url || ''} onChange={handleInputChange} fullWidth size="small" margin="normal"/>
                             </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel control={<Switch checked={product.is_special} onChange={handleInputChange} name="is_special" />} label="Món bán chạy / Nổi bật trên trang chủ" />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Button onClick={onClose} color="inherit">Hủy</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting || isUploading}>
                        {isSubmitting ? 'Đang lưu...' : 'Lưu Sản Phẩm'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}