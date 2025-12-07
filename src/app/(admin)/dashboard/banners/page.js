'use client';
import React, { useEffect, useState } from 'react';
import {
    Box, Paper, Typography, Grid, TextField, Button, Switch, FormControlLabel,
    IconButton, alpha, Chip, Tooltip, Card, CardMedia, CardContent, CardActions,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Trash2, PlusCircle, Image, Link as LinkIcon, Clock, X, Edit2, Save } from 'lucide-react';

// Stats Badge Component
const StatBadge = ({ label, value, color }) => (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${color}`}>
        <span className="text-sm font-bold">{value}</span>
        <span className="text-xs opacity-80">{label}</span>
    </div>
);

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
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);

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
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Compact Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Quản lý Banner</h1>
                    <span className="text-sm text-gray-500">({stats.total} banner)</span>
                </div>
                <Button
                    variant="contained"
                    startIcon={<PlusCircle size={18} />}
                    onClick={() => setShowAddForm(true)}
                    sx={{
                        bgcolor: '#3b82f6',
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 2.5,
                        '&:hover': { bgcolor: '#2563eb' }
                    }}
                >
                    Thêm banner
                </Button>
            </div>

            {/* Stats Row */}
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
                <div className="flex flex-wrap items-center gap-3">
                    <StatBadge label="Tổng" value={stats.total} color="bg-blue-100 text-blue-700" />
                    <StatBadge label="Đang hiển thị" value={stats.active} color="bg-green-100 text-green-700" />
                    <StatBadge label="Popup" value={stats.popup} color="bg-purple-100 text-purple-700" />
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
                                            bgcolor: banner.position === 'popup' ? alpha('#8b5cf6', 0.1) : alpha('#3b82f6', 0.1),
                                            color: banner.position === 'popup' ? '#7c3aed' : '#2563eb',
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
                                            size="small"
                                            onClick={() => setEditingBanner(banner)}
                                            sx={{ color: '#3b82f6' }}
                                        >
                                            <Edit2 size={16} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Xóa" arrow>
                                        <IconButton
                                            size="small"
                                            onClick={() => deleteBanner(banner.id)}
                                            sx={{ color: '#ef4444' }}
                                        >
                                            <Trash2 size={16} />
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
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <span className="font-bold">Thêm Banner Mới</span>
                    <IconButton onClick={() => setShowAddForm(false)} sx={{ color: 'white' }}>
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3, pt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Tiêu đề"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="URL Ảnh"
                                value={form.image_url}
                                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                fullWidth
                                size="small"
                                required
                                placeholder="https://example.com/image.jpg"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Link khi click"
                                value={form.link_url}
                                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Vị trí"
                                value={form.position}
                                onChange={(e) => setForm({ ...form, position: e.target.value })}
                                fullWidth
                                size="small"
                                select
                                SelectProps={{ native: true }}
                            >
                                <option value="popup">Popup</option>
                                <option value="home">Trang chủ</option>
                                <option value="menu">Menu</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Thời gian hiển thị (giây)"
                                type="number"
                                value={form.display_seconds}
                                onChange={(e) => setForm({ ...form, display_seconds: Number(e.target.value) })}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel
                                control={<Switch checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />}
                                label="Kích hoạt"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControlLabel
                                control={<Switch checked={form.show_once} onChange={(e) => setForm({ ...form, show_once: e.target.checked })} />}
                                label="Chỉ hiện 1 lần"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={() => setShowAddForm(false)} variant="outlined" sx={{ borderRadius: 2 }}>
                        Hủy
                    </Button>
                    <Button
                        onClick={createBanner}
                        variant="contained"
                        disabled={loading || !form.image_url}
                        startIcon={<Save size={16} />}
                        sx={{ borderRadius: 2, bgcolor: '#3b82f6' }}
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
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
                                sx={{ borderRadius: 2, bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}
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


