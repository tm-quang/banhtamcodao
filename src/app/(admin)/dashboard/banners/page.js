'use client';
import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Grid, TextField, Button, Switch, FormControlLabel, IconButton } from '@mui/material';
import { Delete } from 'lucide-react';

export default function BannersPage() {
    const [banners, setBanners] = useState([]);
    const [form, setForm] = useState({ title: '', image_url: '', link_url: '', position: 'popup', sort_order: 0, active: true, display_seconds: 8, start_date: '', end_date: '', show_once: true });
    const [loading, setLoading] = useState(false);

    const fetchBanners = async () => {
        const res = await fetch('/api/admin/banners');
        const data = await res.json();
        if (data.success) setBanners(data.banners);
    };
    useEffect(() => { fetchBanners(); }, []);

    const createBanner = async () => {
        setLoading(true);
        const res = await fetch('/api/admin/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        setLoading(false);
        if (res.ok) {
            setForm({ title: '', image_url: '', link_url: '', position: 'home', sort_order: 0, active: true });
            await fetchBanners();
        }
    };

    const updateBanner = async (id, patch) => {
        await fetch(`/api/admin/banners/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
        await fetchBanners();
    };

    const deleteBanner = async (id) => {
        if (!confirm('Xóa banner này?')) return;
        await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
        await fetchBanners();
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>Cài đặt Banner</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Thêm banner</Typography>
                        <TextField label="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth sx={{ mb: 2 }} />
                        <TextField label="Ảnh (URL)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} fullWidth sx={{ mb: 2 }} />
                        <TextField label="Link (URL)" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} fullWidth sx={{ mb: 2 }} />
                        <TextField label="Vị trí" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} helperText="Đặt 'popup' để hiện giữa màn khi tải trang lần đầu" fullWidth sx={{ mb: 2 }} />
                        <TextField label="Thứ tự" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} fullWidth sx={{ mb: 2 }} />
                        <TextField label="Thời gian hiển thị (giây)" type="number" value={form.display_seconds} onChange={(e) => setForm({ ...form, display_seconds: Number(e.target.value) })} fullWidth sx={{ mb: 2 }} />
                        <TextField label="Bắt đầu (YYYY-MM-DD HH:mm:ss)" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} fullWidth sx={{ mb: 2 }} />
                        <TextField label="Kết thúc (YYYY-MM-DD HH:mm:ss)" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} fullWidth sx={{ mb: 2 }} />
                        <FormControlLabel control={<Switch checked={form.show_once} onChange={(e) => setForm({ ...form, show_once: e.target.checked })} />} label="Chỉ hiện 1 lần mỗi phiên (cookie)" />
                        <FormControlLabel control={<Switch checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />} label="Kích hoạt" />
                        <Box sx={{ mt: 2 }}>
                            <Button variant="contained" onClick={createBanner} disabled={loading || !form.image_url}>Thêm</Button>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Danh sách</Typography>
                        <Grid container spacing={2}>
                            {banners.map((b) => (
                                <Grid item xs={12} key={b.id}>
                                    <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={b.image_url} alt={b.title || ''} width={120} height={60} style={{ objectFit: 'cover', borderRadius: 6 }} />
                                        <Box sx={{ flex: 1 }}>
                                            <TextField size="small" label="Tiêu đề" value={b.title || ''} onChange={(e) => updateBanner(b.id, { title: e.target.value })} sx={{ mr: 1 }} />
                                            <TextField size="small" label="Link" value={b.link_url || ''} onChange={(e) => updateBanner(b.id, { link_url: e.target.value })} sx={{ mr: 1 }} />
                                            <TextField size="small" label="Vị trí" value={b.position || ''} onChange={(e) => updateBanner(b.id, { position: e.target.value })} sx={{ mr: 1 }} helperText="popup/home/menu..." />
                                            <TextField size="small" type="number" label="Thứ tự" value={b.sort_order || 0} onChange={(e) => updateBanner(b.id, { sort_order: Number(e.target.value) })} sx={{ mr: 1 }} />
                                            <TextField size="small" type="number" label="Giây hiển thị" value={b.display_seconds || ''} onChange={(e) => updateBanner(b.id, { display_seconds: Number(e.target.value) })} sx={{ mr: 1 }} />
                                            <TextField size="small" label="Bắt đầu" value={b.start_date || ''} onChange={(e) => updateBanner(b.id, { start_date: e.target.value })} sx={{ mr: 1 }} />
                                            <TextField size="small" label="Kết thúc" value={b.end_date || ''} onChange={(e) => updateBanner(b.id, { end_date: e.target.value })} sx={{ mr: 1 }} />
                                            <FormControlLabel control={<Switch checked={!!b.show_once} onChange={(e) => updateBanner(b.id, { show_once: e.target.checked })} />} label="Hiện 1 lần" />
                                            <FormControlLabel control={<Switch checked={!!b.active} onChange={(e) => updateBanner(b.id, { active: e.target.checked })} />} label="Kích hoạt" />
                                        </Box>
                                        <IconButton color="error" onClick={() => deleteBanner(b.id)}><Delete /></IconButton>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}


