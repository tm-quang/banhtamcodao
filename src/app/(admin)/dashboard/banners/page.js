'use client';
import React, { useEffect, useState } from 'react';
import {
    Box, Paper, Typography, Grid, TextField, Button, Switch, FormControlLabel,
    IconButton, alpha, Chip, Tooltip, Card, CardMedia, CardContent, CardActions,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Trash2, PlusCircle, Image, Link as LinkIcon, Clock, X, Edit2, Save, PictureInPicture, CheckCircle, XCircle, Settings, Upload } from 'lucide-react';


export default function BannersPage() {
    const [banners, setBanners] = useState([]);
    const [form, setForm] = useState({
        title: '',
        image_url: '',
        link_url: '',
        position: 'popup',
        sort_order: 0,
        active: true,
        display_seconds: 8,
        start_date: '',
        end_date: '',
        show_once: true
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);

    const handleImageUpload = async (file) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh hợp lệ');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Kích thước ảnh không được vượt quá 5MB');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (data.success && data.url) {
                setForm({ ...form, image_url: data.url });
            } else {
                alert('Upload ảnh thất bại: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Có lỗi xảy ra khi upload ảnh');
        }
        setUploading(false);
    };

    const fetchBanners = async () => {
        try {
            const res = await fetch('/api/admin/banners');
            const data = await res.json();
            if (data.success) setBanners(data.banners);
        } catch (error) {
            console.error('Failed to fetch banners:', error);
        }
    };

    useEffect(() => { fetchBanners(); }, []);

    const createBanner = async () => {
        if (!form.image_url) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/banners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setForm({ title: '', image_url: '', link_url: '', position: 'popup', sort_order: 0, active: true, display_seconds: 8, start_date: '', end_date: '', show_once: true });
                setShowAddForm(false);
                await fetchBanners();
            }
        } catch (error) {
            console.error('Failed to create banner:', error);
        }
        setLoading(false);
    };

    const updateBanner = async (id, patch) => {
        try {
            await fetch(`/api/admin/banners/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patch)
            });
            await fetchBanners();
        } catch (error) {
            console.error('Failed to update banner:', error);
        }
    };

    const deleteBanner = async (id) => {
        if (!confirm('Xóa banner này?')) return;
        try {
            await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
            await fetchBanners();
        } catch (error) {
            console.error('Failed to delete banner:', error);
        }
    };

    const stats = {
        total: banners.length,
        active: banners.filter(b => b.active).length,
        popup: banners.filter(b => b.position === 'popup').length,
    };

    return (
        <Box
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            suppressHydrationWarning={true}
        >
            {/* Compact Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Quản lý Banner</h1>
                    <span className="text-sm text-gray-500">({stats.total} banner)</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {/* Tổng banner */}
                <Box sx={{
                    p: 2,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05) translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                    }
                }}>
                    <PictureInPicture
                        size={80}
                        className="opacity-10"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0
                        }}
                    />
                    <div className="relative z-10">
                        <PictureInPicture size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.total}</p>
                        <p className="text-sm opacity-90">Tổng banner</p>
                    </div>
                </Box>
                {/* Đang hiển thị */}
                <Box sx={{
                    p: 2,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05) translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                    }
                }}>
                    <CheckCircle
                        size={80}
                        className="opacity-10"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0
                        }}
                    />
                    <div className="relative z-10">
                        <CheckCircle size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.active}</p>
                        <p className="text-sm opacity-90">Đang hiển thị</p>
                    </div>
                </Box>
                {/* Popup */}
                <Box sx={{
                    p: 2,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.05) translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                    }
                }}>
                    <Image
                        size={80}
                        className="opacity-10"
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0
                        }}
                    />
                    <div className="relative z-10">
                        <Image size={32} className="opacity-90 mb-3" />
                        <p className="text-3xl font-bold mb-1">{stats.popup}</p>
                        <p className="text-sm opacity-90">Banner popup</p>
                    </div>
                </Box>
            </div>

            {/* Filter & Actions Row */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <div className="flex flex-wrap items-center justify-end gap-3">
                    {/* Add Button */}
                    <Button
                        variant="contained"
                        startIcon={<PlusCircle size={18} />}
                        onClick={() => setShowAddForm(true)}
                        sx={{
                            bgcolor: '#3b82f6',
                            fontWeight: 600,
                            borderRadius: 2,
                            px: 2.5,
                            py: 1,
                            textTransform: 'none',
                            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                            '&:hover': {
                                bgcolor: '#2563eb',
                                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
                                transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        + Thêm banner
                    </Button>
                </div>
            </Paper>

            {/* Banner Cards Grid */}
            <Grid container spacing={2}>
                {banners.map((banner) => (
                    <Grid item xs={12} sm={6} md={4} key={banner.id}>
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: banner.active ? alpha('#10b981', 0.3) : 'divider',
                                overflow: 'hidden',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                    borderColor: '#3b82f6',
                                }
                            }}
                        >
                            {/* Image */}
                            <CardMedia
                                component="img"
                                height="140"
                                image={banner.image_url}
                                alt={banner.title || 'Banner'}
                                sx={{
                                    height: 140,
                                    objectFit: 'cover',
                                    bgcolor: '#f1f5f9',
                                }}
                            />

                            {/* Content */}
                            <CardContent sx={{ p: 2 }}>
                                <div className="flex items-center justify-between mb-2">
                                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                        {banner.title || 'Không có tiêu đề'}
                                    </Typography>
                                    <Chip
                                        label={banner.position}
                                        size="small"
                                        sx={{
                                            bgcolor: banner.position === 'popup' ? alpha('#2563eb', 0.1) : alpha('#3b82f6', 0.1),
                                            color: banner.position === 'popup' ? '#1d4ed8' : '#2563eb',
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                        }}
                                    />
                                </div>

                                {banner.link_url && (
                                    <Typography variant="caption" color="text.secondary" sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        mb: 1,
                                    }}>
                                        <LinkIcon size={12} />
                                        <span className="truncate">{banner.link_url}</span>
                                    </Typography>
                                )}

                                <div className="flex items-center gap-2 mt-2">
                                    <Chip
                                        label={banner.active ? 'Hiển thị' : 'Ẩn'}
                                        size="small"
                                        sx={{
                                            bgcolor: banner.active ? alpha('#10b981', 0.1) : alpha('#6b7280', 0.1),
                                            color: banner.active ? '#059669' : '#4b5563',
                                            fontWeight: 600,
                                            fontSize: '0.65rem',
                                        }}
                                    />
                                    {banner.display_seconds && (
                                        <Chip
                                            icon={<Clock size={12} />}
                                            label={`${banner.display_seconds}s`}
                                            size="small"
                                            sx={{
                                                bgcolor: alpha('#f59e0b', 0.1),
                                                color: '#d97706',
                                                fontWeight: 600,
                                                fontSize: '0.65rem',
                                            }}
                                        />
                                    )}
                                </div>
                            </CardContent>

                            {/* Actions */}
                            <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!banner.active}
                                            size="small"
                                            onChange={(e) => updateBanner(banner.id, { active: e.target.checked })}
                                        />
                                    }
                                    label={<span className="text-xs">Kích hoạt</span>}
                                />
                                <div>
                                    <Tooltip title="Sửa" arrow>
                                        <IconButton
                                            size="medium"
                                            onClick={() => setEditingBanner(banner)}
                                            sx={{
                                                color: '#f97316',
                                                '&:hover': { bgcolor: alpha('#f97316', 0.1) },
                                                width: 40,
                                                height: 40,
                                            }}
                                        >
                                            <Edit2 size={20} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Xóa" arrow>
                                        <IconButton
                                            size="medium"
                                            onClick={() => deleteBanner(banner.id)}
                                            sx={{
                                                color: '#EF4444',
                                                '&:hover': { bgcolor: alpha('#EF4444', 0.1) },
                                                width: 40,
                                                height: 40,
                                            }}
                                        >
                                            <Trash2 size={20} />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}

                {/* Empty State */}
                {banners.length === 0 && (
                    <Grid item xs={12}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 6,
                                textAlign: 'center',
                                borderRadius: 2,
                                border: '2px dashed',
                                borderColor: 'divider',
                            }}
                        >
                            <Image size={48} className="text-gray-300 mx-auto mb-3" />
                            <Typography color="text.secondary">
                                Chưa có banner nào
                            </Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            {/* Add Banner Dialog */}
            <Dialog
                open={showAddForm}
                onClose={() => setShowAddForm(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2.5,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <PlusCircle size={24} />
                        <span className="font-bold text-lg">Thêm Banner Mới</span>
                    </Box>
                    <IconButton onClick={() => setShowAddForm(false)} sx={{ color: 'white' }}>
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        {/* Section 1: Thông tin cơ bản */}
                        <Grid item xs={12}>
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
                                <Typography variant="subtitle2" sx={{ mb: 2.5, fontWeight: 600, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Image size={18} />
                                    Thông tin cơ bản
                                </Typography>
                                <Grid container spacing={2.5}>
                                    {/* Tiêu đề và Link khi click - nằm ngang */}
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Tiêu đề"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            fullWidth
                                            placeholder="VD: Banner khuyến mãi mùa hè"
                                            helperText="Tiêu đề hiển thị cho banner (tùy chọn)"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Link khi click"
                                            value={form.link_url}
                                            onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                                            fullWidth
                                            placeholder="https://example.com/promotion"
                                            helperText="Đường dẫn khi người dùng click vào banner (tùy chọn)"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                }
                                            }}
                                        />
                                    </Grid>
                                    
                                    {/* Ảnh Banner - Upload và URL nằm ngang */}
                                    <Grid item xs={12}>
                                        <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
                                            Ảnh Banner <span style={{ color: '#ef4444' }}>*</span>
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <input
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    id="banner-image-upload"
                                                    type="file"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleImageUpload(file);
                                                    }}
                                                />
                                                <label htmlFor="banner-image-upload" style={{ width: '100%', display: 'block' }}>
                                                    <Button
                                                        component="span"
                                                        variant="outlined"
                                                        fullWidth
                                                        disabled={uploading}
                                                        startIcon={uploading ? <Clock size={18} /> : <Upload size={18} />}
                                                        sx={{
                                                            height: 56,
                                                            borderRadius: 2,
                                                            borderStyle: 'dashed',
                                                            borderWidth: 2,
                                                            textTransform: 'none',
                                                            fontWeight: 600,
                                                            '&:hover': {
                                                                borderStyle: 'dashed',
                                                                borderWidth: 2,
                                                                bgcolor: alpha('#3b82f6', 0.05),
                                                            }
                                                        }}
                                                    >
                                                        {uploading ? 'Đang tải lên...' : 'Tải ảnh lên'}
                                                    </Button>
                                                </label>
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                    Chọn file ảnh từ máy tính (max 5MB)
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="URL Ảnh"
                                                    value={form.image_url}
                                                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                                    fullWidth
                                                    placeholder="https://example.com/banner.jpg"
                                                    helperText="Hoặc nhập đường dẫn URL trực tiếp"
                                                    disabled={uploading}
                                                    error={!form.image_url && !uploading}
                                                    required
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Section 2: Cài đặt hiển thị */}
                        <Grid item xs={12}>
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
                                <Typography variant="subtitle2" sx={{ mb: 2.5, fontWeight: 600, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Settings size={18} />
                                    Cài đặt hiển thị
                                </Typography>
                                <Grid container spacing={2.5}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Vị trí hiển thị"
                                            value={form.position}
                                            onChange={(e) => setForm({ ...form, position: e.target.value })}
                                            fullWidth
                                            select
                                            SelectProps={{ native: true }}
                                            helperText="Chọn vị trí hiển thị banner"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                }
                                            }}
                                        >
                                            <option value="popup">Popup</option>
                                            <option value="home">Trang chủ</option>
                                            <option value="menu">Menu</option>
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Thời gian hiển thị (giây)"
                                            type="number"
                                            value={form.display_seconds}
                                            onChange={(e) => setForm({ ...form, display_seconds: Number(e.target.value) })}
                                            fullWidth
                                            inputProps={{ min: 1, max: 60 }}
                                            helperText="Thời gian tự động đóng (1-60 giây)"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Section 3: Tùy chọn */}
                        <Grid item xs={12}>
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
                                <Typography variant="subtitle2" sx={{ mb: 2.5, fontWeight: 600, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircle size={18} />
                                    Tùy chọn
                                </Typography>
                                <Grid container spacing={2.5}>
                                    <Grid item xs={12} sm={6}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={form.active}
                                                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>Kích hoạt</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Hiển thị banner ngay lập tức
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={form.show_once}
                                                    onChange={(e) => setForm({ ...form, show_once: e.target.checked })}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>Chỉ hiện 1 lần</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Chỉ hiển thị 1 lần cho mỗi người dùng
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Section 4: Preview */}
                        {form.image_url && (
                            <Grid item xs={12}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 2,
                                        border: '2px dashed',
                                        borderColor: alpha('#3b82f6', 0.3),
                                        bgcolor: alpha('#3b82f6', 0.02),
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PictureInPicture size={18} />
                                        Xem trước Banner
                                    </Typography>
                                    <Box
                                        component="img"
                                        src={form.image_url}
                                        alt="Preview"
                                        sx={{
                                            width: '100%',
                                            maxHeight: 200,
                                            objectFit: 'contain',
                                            borderRadius: 2,
                                            bgcolor: '#f8fafc',
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{
                    p: 2.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    bgcolor: '#f8fafc',
                    gap: 1.5
                }}>
                    <Button
                        onClick={() => setShowAddForm(false)}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={createBanner}
                        variant="contained"
                        disabled={loading || !form.image_url}
                        startIcon={<Save size={18} />}
                        sx={{
                            borderRadius: 2,
                            bgcolor: '#3b82f6',
                            px: 3,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                bgcolor: '#2563eb'
                            }
                        }}
                    >
                        {loading ? 'Đang lưu...' : 'Thêm banner'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Banner Dialog */}
            <Dialog
                open={!!editingBanner}
                onClose={() => setEditingBanner(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <span className="font-bold">Chỉnh sửa Banner</span>
                    <IconButton onClick={() => setEditingBanner(null)} sx={{ color: 'white' }}>
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                {editingBanner && (
                    <>
                        <DialogContent sx={{ p: 3, pt: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Tiêu đề"
                                        value={editingBanner.title || ''}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                                        fullWidth
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="URL Ảnh"
                                        value={editingBanner.image_url || ''}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, image_url: e.target.value })}
                                        fullWidth
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Link"
                                        value={editingBanner.link_url || ''}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, link_url: e.target.value })}
                                        fullWidth
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Vị trí"
                                        value={editingBanner.position || 'popup'}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, position: e.target.value })}
                                        fullWidth
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Giây hiển thị"
                                        type="number"
                                        value={editingBanner.display_seconds || ''}
                                        onChange={(e) => setEditingBanner({ ...editingBanner, display_seconds: Number(e.target.value) })}
                                        fullWidth
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Button onClick={() => setEditingBanner(null)} variant="outlined" sx={{ borderRadius: 2 }}>
                                Hủy
                            </Button>
                            <Button
                                onClick={async () => {
                                    const { id, ...patch } = editingBanner;
                                    await updateBanner(id, patch);
                                    setEditingBanner(null);
                                }}
                                variant="contained"
                                startIcon={<Save size={16} />}
                                sx={{ borderRadius: 2, bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}
                            >
                                Cập nhật
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}


