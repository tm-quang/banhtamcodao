/**
 * src/components/admin/ComboPromotionModal.js
 * Modal để thêm/sửa Combo Promotion
 */
'use client';
import { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogActions, Button, Grid, TextField,
    MenuItem, Box, Typography, IconButton, alpha, FormControlLabel,
    Checkbox, FormControl, InputLabel, Select, Chip, Stack, Alert,
    Accordion, AccordionSummary, AccordionDetails, useMediaQuery, useTheme,
    Stepper, Step, StepLabel, StepConnector, stepConnectorClasses, styled,
    Paper, Avatar, Fade
} from '@mui/material';
import {
    ChevronDown, ChevronRight, ChevronLeft, Check, Sparkles,
    Gift, X, Calendar, Settings, Users, DollarSign, Clock, Plus, Trash2, Info, LayoutList, Trophy
} from 'lucide-react';
import { format } from 'date-fns';

// Styled Components for Premium UI
const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 10,
        left: 'calc(-50% + 16px)',
        right: 'calc(50% + 16px)',
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: '#2563eb',
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: '#2563eb',
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
        borderTopWidth: 3,
        borderRadius: 1,
    },
}));

const QontoStepIconRoot = styled('div')(({ theme, ownerState }) => ({
    color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
    display: 'flex',
    height: 22,
    alignItems: 'center',
    ...(ownerState.active && {
        color: '#2563eb',
    }),
    '& .QontoStepIcon-completedIcon': {
        color: '#2563eb',
        zIndex: 1,
        fontSize: 18,
    },
    '& .QontoStepIcon-circle': {
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
    },
}));

function QontoStepIcon(props) {
    const { active, completed, className } = props;

    return (
        <QontoStepIconRoot ownerState={{ active }} className={className}>
            {completed ? (
                <Check className="QontoStepIcon-completedIcon" size={20} />
            ) : (
                <div className="QontoStepIcon-circle" />
            )}
        </QontoStepIconRoot>
    );
}

const formatDateForInput = (date) => {
    if (!date) return '';
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
};

// Section Header Component (Compact for mobile)
const SectionHeader = ({ icon: Icon, title, color, compact = false }) => (
    <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 1 : 1.5,
        mb: compact ? 1.5 : 2,
        mt: compact ? 1 : 2
    }}>
        <Box sx={{
            width: compact ? 28 : 32,
            height: compact ? 28 : 32,
            borderRadius: 1.5,
            bgcolor: alpha(color, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Icon size={compact ? 14 : 16} color={color} />
        </Box>
        <Typography sx={{
            fontWeight: 600,
            color: 'text.primary',
            fontSize: compact ? '0.85rem' : '0.9rem'
        }}>
            {title}
        </Typography>
    </Box>
);

export default function ComboPromotionModal({ open, onClose, onSave, comboToEdit, categories = [], products = [] }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [data, setData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [conditionRules, setConditionRules] = useState([]);
    const [rewardProducts, setRewardProducts] = useState([]);
    const [rewardType, setRewardType] = useState('free_product'); // 'free_product' or 'discount'
    const [discountConfig, setDiscountConfig] = useState({
        type: 'percent', // 'percent' or 'fixed'
        value: '',
        apply_to: 'total' // 'total', 'condition_products', 'reward_products'
    });
    const [errors, setErrors] = useState({});
    const [activeStep, setActiveStep] = useState(0);
    const isEditMode = Boolean(comboToEdit);

    const steps = [
        { label: 'Thông tin chung', icon: Info, color: '#2563eb', description: 'Cài đặt cơ bản & thời gian' },
        { label: 'Điều kiện', icon: LayoutList, color: '#f59e0b', description: 'Điều kiện để nhận thưởng' },
        { label: 'Phần thưởng', icon: Trophy, color: '#ef4444', description: 'Cấu hình quà tặng' },
        { label: 'Xác nhận', icon: Check, color: '#10b981', description: 'Xem lại & Hoàn tất' },
    ];

    // Initialize data
    useEffect(() => {
        if (open) {
            const initialState = {
                name: '',
                description: '',
                status: 'active',
                start_date: '',
                end_date: '',
                valid_hours_start: '',
                valid_hours_end: '',
                condition_type: 'quantity',
                condition_operator: 'AND',
                min_order_value: 0,
                max_order_value: '',
                max_uses_per_user: '',
                max_uses_total: '',
                exclude_vouchers: false,
                only_new_customers: false,
                only_vip_customers: false,
                priority: 0
            };

            if (comboToEdit) {
                const conditions = comboToEdit.conditions || {};
                const rewards = comboToEdit.rewards || {};
                const validHours = comboToEdit.valid_hours || {};

                setData({
                    ...comboToEdit,
                    start_date: formatDateForInput(comboToEdit.start_date),
                    end_date: formatDateForInput(comboToEdit.end_date),
                    valid_hours_start: validHours.start || '',
                    valid_hours_end: validHours.end || '',
                    condition_type: conditions.type || 'quantity',
                    condition_operator: conditions.operator || 'AND',
                    min_order_value: comboToEdit.min_order_value || 0,
                    max_order_value: comboToEdit.max_order_value || '',
                    max_uses_per_user: comboToEdit.max_uses_per_user || '',
                    max_uses_total: comboToEdit.max_uses_total || '',
                });

                setConditionRules(conditions.rules || []);
                setRewardProducts(rewards.products || []);
                
                // Initialize reward type and discount config
                setRewardType(rewards.type || 'free_product');
                if (rewards.discount) {
                    setDiscountConfig({
                        type: rewards.discount.type || 'percent',
                        value: rewards.discount.value || '',
                        apply_to: rewards.discount.apply_to || 'total'
                    });
                }
            } else {
                setData(initialState);
                setConditionRules([{ 
                    category_slug: '', 
                    product_slug: '', 
                    product_id: '', 
                    min_quantity: 2,
                    apply_to_all: false,
                    apply_to_order_value: false
                }]);
                setRewardProducts([{ category_slug: '', product_slug: '', product_id: '', quantity_per_combo: 1, max_quantity: '' }]);
                setRewardType('free_product');
                setDiscountConfig({ type: 'percent', value: '', apply_to: 'total' });
            }
            setErrors({});
            setActiveStep(0);
        }
    }, [open, comboToEdit]);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const addConditionRule = () => {
        setConditionRules(prev => [...prev, { 
            category_slug: '', 
            product_slug: '', 
            product_id: '', 
            min_quantity: 1,
            apply_to_all: false,
            apply_to_order_value: false
        }]);
    };

    const removeConditionRule = (index) => {
        setConditionRules(prev => prev.filter((_, i) => i !== index));
    };

    const updateConditionRule = (index, field, value) => {
        setConditionRules(prev => prev.map((rule, i) =>
            i === index ? { ...rule, [field]: value } : rule
        ));
    };

    const addRewardProduct = () => {
        setRewardProducts(prev => [...prev, { category_slug: '', product_slug: '', product_id: '', quantity_per_combo: 1, max_quantity: '' }]);
    };

    const removeRewardProduct = (index) => {
        setRewardProducts(prev => prev.filter((_, i) => i !== index));
    };

    const updateRewardProduct = (index, field, value) => {
        setRewardProducts(prev => prev.map((product, i) =>
            i === index ? { ...product, [field]: value } : product
        ));
    };

    const validateStep = (step) => {
        const newErrors = {};
        let isValid = true;

        if (step === 0) { // General Info
            if (!data.name || !data.name.trim()) newErrors.name = 'Tên combo là bắt buộc';
            if (data.start_date && data.end_date) {
                if (new Date(data.end_date) <= new Date(data.start_date)) {
                    newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
                }
            }
        }

        if (step === 1) { // Conditions
            if (conditionRules.length === 0) {
                newErrors.conditions = 'Cần ít nhất 1 điều kiện';
            } else {
                conditionRules.forEach((rule, index) => {
                    // Cho phép áp dụng cho tất cả sản phẩm (không cần chọn danh mục/sản phẩm)
                    // hoặc áp dụng cho giá trị đơn hàng (apply_to_order_value = true)
                    if (!rule.apply_to_all && !rule.apply_to_order_value && !rule.category_slug && !rule.product_slug && !rule.product_id) {
                        newErrors[`condition_${index}`] = 'Chọn danh mục/sản phẩm, hoặc chọn "Áp dụng cho tất cả" hoặc "Áp dụng cho giá trị đơn hàng"';
                    }
                    // Nếu áp dụng cho giá trị đơn hàng, không cần số lượng
                    if (!rule.apply_to_order_value && (!rule.min_quantity || rule.min_quantity < 1)) {
                        newErrors[`condition_qty_${index}`] = 'Số lượng tối thiểu >= 1';
                    }
                });
            }
        }

        if (step === 2) { // Rewards
            if (rewardType === 'free_product') {
                if (rewardProducts.length === 0) {
                    newErrors.rewards = 'Cần ít nhất 1 phần thưởng';
                } else {
                    rewardProducts.forEach((product, index) => {
                        if (!product.category_slug && !product.product_slug && !product.product_id) {
                            newErrors[`reward_${index}`] = 'Chọn danh mục hoặc sản phẩm';
                        }
                        if (!product.quantity_per_combo || product.quantity_per_combo < 1) {
                            newErrors[`reward_qty_${index}`] = 'Số lượng tặng >= 1';
                        }
                    });
                }
            } else if (rewardType === 'discount') {
                if (!discountConfig.value || discountConfig.value <= 0) {
                    newErrors.discount_value = 'Nhập giá trị giảm giá';
                }
                if (discountConfig.type === 'percent' && (discountConfig.value > 100 || discountConfig.value < 0)) {
                    newErrors.discount_value = 'Phần trăm giảm phải từ 0-100%';
                }
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...newErrors }));
            isValid = false;
        }

        return isValid;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSave = async () => {
        setIsSubmitting(true);

        const conditions = {
            type: data.condition_type,
            operator: data.condition_operator,
            rules: conditionRules.map(rule => ({
                ...(rule.apply_to_all ? { apply_to_all: true } : {}),
                ...(rule.apply_to_order_value ? { apply_to_order_value: true } : {}),
                ...(rule.category_slug ? { category_slug: rule.category_slug } : {}),
                ...(rule.product_slug ? { product_slug: rule.product_slug } : {}),
                ...(rule.product_id ? { product_id: rule.product_id } : {}),
                ...(rule.min_quantity ? { min_quantity: parseInt(rule.min_quantity) || 1 } : {}),
                ...(rule.max_quantity ? { max_quantity: parseInt(rule.max_quantity) } : {})
            }))
        };

        const rewards = {
            type: rewardType,
            ...(rewardType === 'free_product' ? {
                products: rewardProducts.map(product => ({
                    ...(product.category_slug ? { category_slug: product.category_slug } : {}),
                    ...(product.product_slug ? { product_slug: product.product_slug } : {}),
                    ...(product.product_id ? { product_id: product.product_id } : {}),
                    quantity_per_combo: parseInt(product.quantity_per_combo) || 1,
                    ...(product.max_quantity ? { max_quantity: parseInt(product.max_quantity) } : {})
                }))
            } : {}),
            ...(rewardType === 'discount' ? {
                discount: {
                    type: discountConfig.type,
                    value: discountConfig.type === 'percent' 
                        ? parseFloat(discountConfig.value) || 0 
                        : parseInt(discountConfig.value) || 0,
                    apply_to: discountConfig.apply_to
                }
            } : {})
        };

        const valid_hours = (data.valid_hours_start && data.valid_hours_end) ? {
            start: data.valid_hours_start,
            end: data.valid_hours_end
        } : null;

        const saveData = {
            ...data,
            conditions,
            rewards,
            valid_hours,
            min_order_value: parseInt(data.min_order_value) || 0,
            max_order_value: data.max_order_value ? parseInt(data.max_order_value) : null,
            max_uses_per_user: data.max_uses_per_user ? parseInt(data.max_uses_per_user) : null,
            max_uses_total: data.max_uses_total ? parseInt(data.max_uses_total) : null,
            priority: parseInt(data.priority) || 0
        };

        await onSave(saveData);
        setIsSubmitting(false);
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        {/* Section 1: Basic Information */}
                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.5) }}>
                            <SectionHeader icon={Info} title="Thông tin cơ bản" color="#2563eb" />
                            <Grid container spacing={2.5}>
                                <Grid item xs={12} sm={8}>
                                    <TextField
                                        name="name"
                                        label="Tên combo *"
                                        value={data.name || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        size="small"
                                        error={!!errors.name}
                                        helperText={errors.name || 'Nhập tên combo để hiển thị cho khách hàng'}
                                        placeholder="VD: Mua 2 phần ăn tặng 1 nước"
                                        sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth size="small" sx={{ '& .MuiInputBase-root': { height: '40px' } }}>
                                        <InputLabel>Trạng thái *</InputLabel>
                                        <Select
                                            name="status"
                                            value={data.status || 'active'}
                                            onChange={handleChange}
                                            label="Trạng thái *"
                                            renderValue={(value) => {
                                                const statusMap = {
                                                    'active': 'Hoạt động',
                                                    'inactive': 'Tạm dừng',
                                                    'expired': 'Hết hạn'
                                                };
                                                return statusMap[value] || value;
                                            }}
                                        >
                                            <MenuItem value="active">Hoạt động</MenuItem>
                                            <MenuItem value="inactive">Tạm dừng</MenuItem>
                                            <MenuItem value="expired">Hết hạn</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="description"
                                        label="Mô tả"
                                        value={data.description || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        placeholder="Mô tả chi tiết về chương trình combo (tùy chọn)"
                                        helperText="Mô tả sẽ hiển thị cho khách hàng để hiểu rõ hơn về combo"
                                        sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Section 2: Time Settings */}
                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.5) }}>
                            <SectionHeader icon={Calendar} title="Thời gian hiệu lực" color="#10b981" />
                            <Grid container spacing={2.5}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="start_date"
                                        label="Ngày bắt đầu"
                                        type="datetime-local"
                                        value={data.start_date || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        helperText="Thời điểm bắt đầu áp dụng combo"
                                        sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="end_date"
                                        label="Ngày kết thúc"
                                        type="datetime-local"
                                        value={data.end_date || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        error={!!errors.end_date}
                                        helperText={errors.end_date || 'Thời điểm kết thúc áp dụng combo'}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="valid_hours_start"
                                        label="Khung giờ vàng (Từ)"
                                        type="time"
                                        value={data.valid_hours_start || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        helperText="Bỏ trống nếu áp dụng cả ngày"
                                        sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        name="valid_hours_end"
                                        label="Khung giờ vàng (Đến)"
                                        type="time"
                                        value={data.valid_hours_end || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                        helperText="Bỏ trống nếu áp dụng cả ngày"
                                        sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Section 3: Advanced Settings */}
                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.5) }}>
                            <SectionHeader icon={Settings} title="Cài đặt nâng cao" color="#6366f1" />
                            <Grid container spacing={2.5}>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        name="priority"
                                        label="Thứ tự ưu tiên"
                                        type="number"
                                        value={data.priority || 0}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        helperText="Số nhỏ = ưu tiên cao hơn (0 = cao nhất)"
                                        inputProps={{ min: 0 }}
                                        sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        name="min_order_value"
                                        label="Giá trị đơn tối thiểu"
                                        type="number"
                                        value={data.min_order_value || 0}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        helperText="Đơn hàng tối thiểu để áp dụng combo (0 = không yêu cầu)"
                                        InputProps={{
                                            endAdornment: <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary', mr: 1 }}>đ</Typography>
                                        }}
                                        inputProps={{ min: 0 }}
                                        sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        name="max_uses_per_user"
                                        label="Giới hạn/User"
                                        type="number"
                                        value={data.max_uses_per_user || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        placeholder="Không giới hạn"
                                        helperText="Số lần tối đa mỗi khách hàng (để trống = không giới hạn)"
                                        inputProps={{ min: 1 }}
                                        sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        name="max_uses_total"
                                        label="Giới hạn tổng"
                                        type="number"
                                        value={data.max_uses_total || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        size="small"
                                        placeholder="Không giới hạn"
                                        helperText="Tổng số lần sử dụng (để trống = không giới hạn)"
                                        inputProps={{ min: 1 }}
                                        sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
                                        <Box sx={{ flex: 1, p: 1.5, border: '1px dashed', borderColor: 'divider', borderRadius: 1.5, minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                                            <FormControlLabel
                                                control={<Checkbox name="exclude_vouchers" checked={data.exclude_vouchers} onChange={handleChange} size="small" />}
                                                label={<Typography variant="body2">Không áp dụng cùng Voucher</Typography>}
                                                sx={{ m: 0 }}
                                            />
                                        </Box>
                                        <Box sx={{ flex: 1, p: 1.5, border: '1px dashed', borderColor: 'divider', borderRadius: 1.5, minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                                            <FormControlLabel
                                                control={<Checkbox name="only_new_customers" checked={data.only_new_customers} onChange={handleChange} size="small" />}
                                                label={<Typography variant="body2">Chỉ dành cho khách mới</Typography>}
                                                sx={{ m: 0 }}
                                            />
                                        </Box>
                                        <Box sx={{ flex: 1, p: 1.5, border: '1px dashed', borderColor: 'divider', borderRadius: 1.5, minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                                            <FormControlLabel
                                                control={<Checkbox name="only_vip_customers" checked={data.only_vip_customers} onChange={handleChange} size="small" />}
                                                label={<Typography variant="body2">Chỉ dành cho khách VIP</Typography>}
                                                sx={{ m: 0 }}
                                            />
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <SectionHeader icon={Settings} title="Thiết lập điều kiện" color="#f59e0b" />
                        {errors.conditions && <Alert severity="error" sx={{ mb: 2 }}>{errors.conditions}</Alert>}

                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                <strong>Hướng dẫn:</strong> Thiết lập điều kiện để khách hàng nhận được phần thưởng. 
                                Có thể chọn danh mục hoặc sản phẩm cụ thể, và đặt số lượng tối thiểu/tối đa.
                            </Typography>
                        </Alert>

                        <Grid container spacing={2.5} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth size="small" sx={{ '& .MuiInputBase-root': { height: '40px' } }}>
                                    <InputLabel>Loại điều kiện</InputLabel>
                                    <Select
                                        name="condition_type"
                                        value={data.condition_type || 'quantity'}
                                        onChange={handleChange}
                                        label="Loại điều kiện"
                                        renderValue={(value) => {
                                            const typeMap = {
                                                'quantity': 'Theo số lượng sản phẩm',
                                                'products': 'Theo sản phẩm cụ thể',
                                                'category': 'Theo danh mục'
                                            };
                                            return typeMap[value] || value;
                                        }}
                                    >
                                        <MenuItem value="quantity">Theo số lượng sản phẩm</MenuItem>
                                        <MenuItem value="products">Theo sản phẩm cụ thể</MenuItem>
                                        <MenuItem value="category">Theo danh mục</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth size="small" sx={{ '& .MuiInputBase-root': { height: '40px' } }}>
                                    <InputLabel>Toán tử logic</InputLabel>
                                    <Select
                                        name="condition_operator"
                                        value={data.condition_operator || 'AND'}
                                        onChange={handleChange}
                                        label="Toán tử logic"
                                        renderValue={(value) => {
                                            return value === 'AND' ? 'Thỏa mãn TẤT CẢ (AND)' : 'Thỏa mãn 1 TRONG CÁC (OR)';
                                        }}
                                    >
                                        <MenuItem value="AND">Thỏa mãn TẤT CẢ (AND)</MenuItem>
                                        <MenuItem value="OR">Thỏa mãn 1 TRONG CÁC (OR)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Stack spacing={2.5}>
                            {conditionRules.map((rule, index) => (
                                <Paper key={index} variant="outlined" sx={{ p: 2.5, borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: '#f59e0b' }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5, pl: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Điều kiện #{index + 1}</Typography>
                                        <IconButton size="small" onClick={() => removeConditionRule(index)} color="error"><Trash2 size={16} /></IconButton>
                                    </Box>
                                    <Grid container spacing={2.5} sx={{ pl: 1 }}>
                                        {/* Hàng 1: 2 checkbox */}
                                        <Grid item xs={12}>
                                            <Stack direction="row" spacing={3}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={rule.apply_to_all || false}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                updateConditionRule(index, 'apply_to_all', checked);
                                                                if (checked) {
                                                                    updateConditionRule(index, 'apply_to_order_value', false);
                                                                    updateConditionRule(index, 'category_slug', '');
                                                                    updateConditionRule(index, 'product_slug', '');
                                                                    updateConditionRule(index, 'product_id', '');
                                                                }
                                                            }}
                                                            size="small"
                                                        />
                                                    }
                                                    label={<Typography variant="body2">Áp dụng cho tất cả sản phẩm</Typography>}
                                                />
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={rule.apply_to_order_value || false}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                updateConditionRule(index, 'apply_to_order_value', checked);
                                                                if (checked) {
                                                                    updateConditionRule(index, 'apply_to_all', false);
                                                                    updateConditionRule(index, 'category_slug', '');
                                                                    updateConditionRule(index, 'product_slug', '');
                                                                    updateConditionRule(index, 'product_id', '');
                                                                    updateConditionRule(index, 'min_quantity', '');
                                                                }
                                                            }}
                                                            size="small"
                                                        />
                                                    }
                                                    label={<Typography variant="body2">Áp dụng cho giá trị đơn hàng</Typography>}
                                                />
                                            </Stack>
                                        </Grid>

                                        {/* Hàng 2: Dropdown và ô nhập số lượng - Luôn hiển thị */}
                                        <Grid item xs={12} md={5}>
                                            <FormControl 
                                                fullWidth 
                                                size="small" 
                                                disabled={rule.apply_to_all || rule.apply_to_order_value}
                                                sx={{ '& .MuiInputBase-root': { height: '40px', width: '160px' } }}
                                            >
                                                <InputLabel id={`category-label-${index}`} sx={{ fontSize: '0.875rem' }}>Danh mục áp dụng</InputLabel>
                                                <Select
                                                    labelId={`category-label-${index}`}
                                                    value={rule.category_slug || ''}
                                                    onChange={(e) => {
                                                        updateConditionRule(index, 'category_slug', e.target.value);
                                                    }}
                                                    label="Danh mục áp dụng"
                                                    disabled={rule.apply_to_all || rule.apply_to_order_value}
                                                    renderValue={(value) => {
                                                        if (!value) return 'Chọn danh mục -';
                                                        const category = categories.find(cat => cat.slug === value);
                                                        return category ? category.name : value;
                                                    }}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            style: {
                                                                maxHeight: 300,
                                                            },
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value="">Chọn danh mục -</MenuItem>
                                                    {categories.map(cat => (
                                                        <MenuItem key={cat.id} value={cat.slug}>{cat.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={5}>
                                            <FormControl 
                                                fullWidth 
                                                size="small" 
                                                disabled={rule.apply_to_all || rule.apply_to_order_value}
                                                sx={{ '& .MuiInputBase-root': { height: '40px', width: '160px' } }}
                                            >
                                                <InputLabel id={`product-label-${index}`} sx={{ fontSize: '0.875rem' }}>Sản phẩm áp dụng</InputLabel>
                                                <Select
                                                    labelId={`product-label-${index}`}
                                                    value={rule.product_slug || rule.product_id || ''}
                                                    onChange={(e) => {
                                                        const selectedProduct = products.find(p => p.slug === e.target.value || p.id === e.target.value);
                                                        if (selectedProduct) {
                                                            updateConditionRule(index, 'product_slug', selectedProduct.slug);
                                                            updateConditionRule(index, 'product_id', selectedProduct.id);
                                                        } else {
                                                            updateConditionRule(index, 'product_slug', '');
                                                            updateConditionRule(index, 'product_id', '');
                                                        }
                                                    }}
                                                    label="Sản phẩm áp dụng"
                                                    disabled={rule.apply_to_all || rule.apply_to_order_value}
                                                    renderValue={(value) => {
                                                        if (!value) return 'Chọn món/sản phẩm -';
                                                        const product = products.find(p => p.slug === value || p.id === value);
                                                        return product ? product.name : value;
                                                    }}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            style: {
                                                                maxHeight: 300,
                                                            },
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value="">Chọn món/sản phẩm -</MenuItem>
                                                    {products.map(prod => (
                                                        <MenuItem key={prod.id} value={prod.slug}>{prod.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6} md={1}>
                                            <TextField
                                                label="Số lượng tối thiểu *"
                                                type="number"
                                                value={rule.min_quantity || ''}
                                                onChange={(e) => updateConditionRule(index, 'min_quantity', e.target.value)}
                                                fullWidth
                                                size="small"
                                                required={!rule.apply_to_order_value}
                                                disabled={rule.apply_to_order_value}
                                                error={!!errors[`condition_qty_${index}`]}
                                                helperText={errors[`condition_qty_${index}`] || 'SL tối thiểu'}
                                                inputProps={{ min: 1 }}
                                                InputLabelProps={{ shrink: true }}
                                                sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                                            />
                                        </Grid>
                                        <Grid item xs={6} md={1}>
                                            <TextField
                                                label="Số lượng tối đa"
                                                type="number"
                                                value={rule.max_quantity || ''}
                                                onChange={(e) => updateConditionRule(index, 'max_quantity', e.target.value)}
                                                fullWidth
                                                size="small"
                                                placeholder="∞"
                                                disabled={rule.apply_to_order_value}
                                                helperText="Để trống = không giới hạn"
                                                inputProps={{ min: 1 }}
                                                InputLabelProps={{ shrink: true }}
                                                sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                                            />
                                        </Grid>

                                        {rule.apply_to_order_value && (
                                            <Grid item xs={12}>
                                                <Alert severity="info">
                                                    <Typography variant="body2">
                                                        <strong>Lưu ý:</strong> Điều kiện này sẽ áp dụng dựa trên giá trị đơn hàng (min_order_value) đã được thiết lập ở bước "Thông tin chung". 
                                                        Không cần chọn sản phẩm hoặc số lượng cụ thể.
                                                    </Typography>
                                                </Alert>
                                            </Grid>
                                        )}

                                        {rule.apply_to_all && (
                                            <Grid item xs={12}>
                                                <Alert severity="info">
                                                    <Typography variant="body2">
                                                        <strong>Lưu ý:</strong> Điều kiện này sẽ áp dụng cho tất cả sản phẩm trong giỏ hàng. 
                                                        Cần nhập số lượng tối thiểu để áp dụng.
                                                    </Typography>
                                                </Alert>
                                                <Grid container spacing={2.5} sx={{ mt: 1 }}>
                                                    <Grid item xs={6} md={2}>
                                                        <TextField
                                                            label="Số lượng tối thiểu *"
                                                            type="number"
                                                            value={rule.min_quantity || ''}
                                                            onChange={(e) => updateConditionRule(index, 'min_quantity', e.target.value)}
                                                            fullWidth
                                                            size="small"
                                                            required
                                                            error={!!errors[`condition_qty_${index}`]}
                                                            helperText={errors[`condition_qty_${index}`] || 'SL tối thiểu'}
                                                            inputProps={{ min: 1 }}
                                                            sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6} md={2}>
                                                        <TextField
                                                            label="Số lượng tối đa"
                                                            type="number"
                                                            value={rule.max_quantity || ''}
                                                            onChange={(e) => updateConditionRule(index, 'max_quantity', e.target.value)}
                                                            fullWidth
                                                            size="small"
                                                            placeholder="∞"
                                                            helperText="Để trống = không giới hạn"
                                                            inputProps={{ min: 1 }}
                                                            sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Paper>
                            ))}
                            <Button
                                startIcon={<Plus size={16} />}
                                onClick={addConditionRule}
                                variant="outlined"
                                sx={{
                                    border: '1px dashed',
                                    borderColor: 'divider',
                                    py: 1.5,
                                    height: '48px',
                                    textTransform: 'none',
                                    color: 'text.secondary',
                                    '&:hover': {
                                        borderColor: '#f59e0b',
                                        bgcolor: alpha('#f59e0b', 0.05)
                                    }
                                }}
                            >
                                Thêm điều kiện mới
                            </Button>
                        </Stack>
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        <SectionHeader icon={Trophy} title="Quà tặng & Phần thưởng" color="#ef4444" />
                        {errors.rewards && <Alert severity="error" sx={{ mb: 2 }}>{errors.rewards}</Alert>}

                        <Alert severity="info" sx={{ mb: 3 }}>
                            <Typography variant="body2">
                                <strong>Hướng dẫn:</strong> Chọn loại phần thưởng - Tặng sản phẩm miễn phí hoặc Giảm giá tự động khi đơn hàng đạt điều kiện.
                            </Typography>
                        </Alert>

                        {/* Loại phần thưởng */}
                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.5) }}>
                            <FormControl fullWidth size="small" sx={{ '& .MuiInputBase-root': { height: '40px' } }}>
                                <InputLabel>Loại phần thưởng *</InputLabel>
                                <Select
                                    value={rewardType}
                                    onChange={(e) => setRewardType(e.target.value)}
                                    label="Loại phần thưởng *"
                                >
                                    <MenuItem value="free_product">Tặng sản phẩm miễn phí</MenuItem>
                                    <MenuItem value="discount">Giảm giá tự động</MenuItem>
                                </Select>
                            </FormControl>
                        </Paper>

                        {rewardType === 'discount' ? (
                            /* Cấu hình giảm giá */
                            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.5) }}>
                                <SectionHeader icon={DollarSign} title="Cấu hình giảm giá" color="#10b981" />
                                <Grid container spacing={2.5}>
                                    <Grid item xs={12} sm={4}>
                                        <FormControl fullWidth size="small" sx={{ '& .MuiInputBase-root': { height: '40px' } }}>
                                            <InputLabel>Loại giảm giá</InputLabel>
                                            <Select
                                                value={discountConfig.type}
                                                onChange={(e) => setDiscountConfig(prev => ({ ...prev, type: e.target.value }))}
                                                label="Loại giảm giá"
                                            >
                                                <MenuItem value="percent">Giảm theo phần trăm (%)</MenuItem>
                                                <MenuItem value="fixed">Giảm số tiền cố định (đ)</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label={discountConfig.type === 'percent' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (đ)'}
                                            type="number"
                                            value={discountConfig.value || ''}
                                            onChange={(e) => setDiscountConfig(prev => ({ ...prev, value: e.target.value }))}
                                            fullWidth
                                            size="small"
                                            required
                                            error={!!errors.discount_value}
                                            helperText={errors.discount_value || (discountConfig.type === 'percent' 
                                                ? 'Ví dụ: 2% = giảm 2% tổng giá trị đơn hàng' 
                                                : 'Ví dụ: 10000 = giảm 10.000đ')}
                                            inputProps={{ 
                                                min: 0,
                                                max: discountConfig.type === 'percent' ? 100 : undefined
                                            }}
                                            sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <FormControl fullWidth size="small" sx={{ '& .MuiInputBase-root': { height: '40px' } }}>
                                            <InputLabel>Áp dụng cho</InputLabel>
                                            <Select
                                                value={discountConfig.apply_to}
                                                onChange={(e) => setDiscountConfig(prev => ({ ...prev, apply_to: e.target.value }))}
                                                label="Áp dụng cho"
                                            >
                                                <MenuItem value="total">Tổng giá trị đơn hàng</MenuItem>
                                                <MenuItem value="condition_products">Sản phẩm điều kiện</MenuItem>
                                                <MenuItem value="reward_products">Sản phẩm thưởng</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Ví dụ:</strong> Đơn hàng đạt 100.000đ → Tự động giảm 2% tổng giá trị đơn hàng
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                                        • <strong>Giảm theo phần trăm:</strong> Áp dụng % giảm trên tổng giá trị đơn hàng hoặc sản phẩm được chọn<br/>
                                        • <strong>Giảm số tiền cố định:</strong> Trừ một số tiền cố định (ví dụ: 10.000đ) khỏi tổng giá trị
                                    </Typography>
                                </Alert>
                            </Paper>
                        ) : (
                            /* Tặng sản phẩm */
                            <Stack spacing={2.5}>
                            {rewardProducts.map((product, index) => (
                                <Paper key={index} variant="outlined" sx={{ p: 2.5, borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: '#ef4444' }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5, pl: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Phần thưởng #{index + 1}</Typography>
                                        <IconButton size="small" onClick={() => removeRewardProduct(index)} color="error"><Trash2 size={16} /></IconButton>
                                    </Box>
                                    <Grid container spacing={2.5} sx={{ pl: 1 }}>
                                        <Grid item xs={12} md={5}>
                                            <FormControl fullWidth size="small" sx={{ '& .MuiInputBase-root': { height: '40px', width: '160px' } }}>
                                                <InputLabel id={`reward-category-label-${index}`} sx={{ fontSize: '0.875rem' }}>Danh mục tặng</InputLabel>
                                                <Select
                                                    labelId={`reward-category-label-${index}`}
                                                    value={product.category_slug || ''}
                                                    onChange={(e) => {
                                                        updateRewardProduct(index, 'category_slug', e.target.value);
                                                    }}
                                                    label="Danh mục tặng"
                                                    renderValue={(value) => {
                                                        if (!value) return 'Chọn danh mục -';
                                                        const category = categories.find(cat => cat.slug === value);
                                                        return category ? category.name : value;
                                                    }}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            style: {
                                                                maxHeight: 300,
                                                            },
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value="">Chọn danh mục -</MenuItem>
                                                    {categories.map(cat => (
                                                        <MenuItem key={cat.id} value={cat.slug}>{cat.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={5}>
                                            <FormControl fullWidth size="small" sx={{ '& .MuiInputBase-root': { height: '40px', width: '160px' } }}>
                                                <InputLabel id={`reward-product-label-${index}`} sx={{ fontSize: '0.875rem' }}>Sản phẩm tặng</InputLabel>
                                                <Select
                                                    labelId={`reward-product-label-${index}`}
                                                    value={product.product_slug || product.product_id || ''}
                                                    onChange={(e) => {
                                                        const selectedProduct = products.find(p => p.slug === e.target.value || p.id === e.target.value);
                                                        if (selectedProduct) {
                                                            updateRewardProduct(index, 'product_slug', selectedProduct.slug);
                                                            updateRewardProduct(index, 'product_id', selectedProduct.id);
                                                        } else {
                                                            updateRewardProduct(index, 'product_slug', '');
                                                            updateRewardProduct(index, 'product_id', '');
                                                        }
                                                    }}
                                                    label="Sản phẩm tặng"
                                                    renderValue={(value) => {
                                                        if (!value) return 'Chọn món/sản phẩm -';
                                                        const product = products.find(p => p.slug === value || p.id === value);
                                                        return product ? product.name : value;
                                                    }}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            style: {
                                                                maxHeight: 300,
                                                            },
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value="">Chọn món/sản phẩm -</MenuItem>
                                                    {products.map(prod => (
                                                        <MenuItem key={prod.id} value={prod.slug}>{prod.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6} md={1}>
                                            <TextField
                                                label="Số lượng tặng *"
                                                type="number"
                                                value={product.quantity_per_combo || ''}
                                                onChange={(e) => updateRewardProduct(index, 'quantity_per_combo', e.target.value)}
                                                fullWidth
                                                size="small"
                                                required
                                                error={!!errors[`reward_qty_${index}`]}
                                                helperText={errors[`reward_qty_${index}`] || 'SL tặng'}
                                                inputProps={{ min: 1 }}
                                                InputLabelProps={{ shrink: true }}
                                                sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                                            />
                                        </Grid>
                                        <Grid item xs={6} md={1}>
                                            <TextField
                                                label="Giới hạn tối đa"
                                                type="number"
                                                value={product.max_quantity || ''}
                                                onChange={(e) => updateRewardProduct(index, 'max_quantity', e.target.value)}
                                                fullWidth
                                                size="small"
                                                placeholder="∞"
                                                helperText="Để trống = không giới hạn"
                                                inputProps={{ min: 1 }}
                                                InputLabelProps={{ shrink: true }}
                                                sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ))}
                            <Button
                                startIcon={<Plus size={16} />}
                                onClick={addRewardProduct}
                                variant="outlined"
                                sx={{
                                    border: '1px dashed',
                                    borderColor: 'divider',
                                    py: 1.5,
                                    height: '48px',
                                    textTransform: 'none',
                                    color: 'text.secondary',
                                    '&:hover': {
                                        borderColor: '#ef4444',
                                        bgcolor: alpha('#ef4444', 0.05)
                                    }
                                }}
                            >
                                Thêm phần thưởng
                            </Button>
                        </Stack>
                        )}
                    </Box>
                );
            case 3:
                return (
                    <Box>
                        <SectionHeader icon={Check} title="Xác nhận & Lưu" color="#10b981" />
                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: alpha('#f8fafc', 0.5), border: '1px solid', borderColor: alpha('#10b981', 0.2) }}>
                            <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 3, fontWeight: 700, color: 'text.primary' }}>
                                {data.name || 'Chưa đặt tên'}
                            </Typography>
                            <Grid container spacing={2.5}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>Thời gian hiệu lực:</Typography>
                                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.9rem' }}>
                                        {data.start_date ? format(new Date(data.start_date), 'dd/MM/yyyy HH:mm') : 'Không giới hạn'} - {data.end_date ? format(new Date(data.end_date), 'dd/MM/yyyy HH:mm') : 'Không giới hạn'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>Trạng thái:</Typography>
                                    <Chip
                                        label={data.status === 'active' ? 'Hoạt động' : data.status === 'inactive' ? 'Tạm dừng' : 'Hết hạn'}
                                        color={data.status === 'active' ? 'success' : 'default'}
                                        size="small"
                                        sx={{ fontWeight: 500 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>Giá trị đơn tối thiểu:</Typography>
                                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.9rem' }}>
                                        {data.min_order_value > 0 ? `${new Intl.NumberFormat('vi-VN').format(data.min_order_value)}đ` : 'Không yêu cầu'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>Thứ tự ưu tiên:</Typography>
                                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.9rem' }}>
                                        {data.priority || 0} {data.priority === 0 ? '(Ưu tiên cao nhất)' : ''}
                                    </Typography>
                                </Grid>
                                {(data.max_uses_per_user || data.max_uses_total) && (
                                    <>
                                        {data.max_uses_per_user && (
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>Giới hạn/User:</Typography>
                                                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.9rem' }}>
                                                    {data.max_uses_per_user} lần
                                                </Typography>
                                            </Grid>
                                        )}
                                        {data.max_uses_total && (
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>Giới hạn tổng:</Typography>
                                                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.9rem' }}>
                                                    {data.max_uses_total} lần
                                                </Typography>
                                            </Grid>
                                        )}
                                    </>
                                )}
                                {(data.exclude_vouchers || data.only_new_customers || data.only_vip_customers) && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>Điều kiện đặc biệt:</Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            {data.exclude_vouchers && <Chip label="Không áp dụng cùng Voucher" size="small" sx={{ fontSize: '0.75rem' }} />}
                                            {data.only_new_customers && <Chip label="Chỉ dành cho khách mới" size="small" sx={{ fontSize: '0.75rem' }} />}
                                            {data.only_vip_customers && <Chip label="Chỉ dành cho khách VIP" size="small" sx={{ fontSize: '0.75rem' }} />}
                                        </Stack>
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem', fontWeight: 600 }}>Điều kiện ({conditionRules.length}):</Typography>
                                    <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                                        {conditionRules.map((c, i) => (
                                            <li key={i} style={{ marginBottom: '8px' }}>
                                                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                                                    {c.apply_to_order_value ? (
                                                        <>Áp dụng cho giá trị đơn hàng (min: {new Intl.NumberFormat('vi-VN').format(data.min_order_value || 0)}đ)</>
                                                    ) : c.apply_to_all ? (
                                                        <>Áp dụng cho tất cả sản phẩm - Số lượng: {c.min_quantity || 0}{c.max_quantity ? ` - ${c.max_quantity}` : '+'}</>
                                                    ) : (
                                                        <>
                                                            {c.category_slug ? `Danh mục: ${categories.find(cat => cat.slug === c.category_slug)?.name || c.category_slug}` :
                                                                c.product_slug ? `Sản phẩm: ${products.find(p => p.slug === c.product_slug)?.name || c.product_slug}` :
                                                                    'Bất kỳ sản phẩm'} - Số lượng: {c.min_quantity || 0}{c.max_quantity ? ` - ${c.max_quantity}` : '+'}
                                                        </>
                                                    )}
                                                </Typography>
                                            </li>
                                        ))}
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem', fontWeight: 600 }}>
                                        Phần thưởng: {rewardType === 'free_product' ? `Tặng sản phẩm (${rewardProducts.length})` : 'Giảm giá tự động'}
                                    </Typography>
                                    {rewardType === 'free_product' ? (
                                        <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                                            {rewardProducts.map((r, i) => (
                                                <li key={i} style={{ marginBottom: '8px' }}>
                                                    <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                                                        {r.category_slug ? `Danh mục: ${categories.find(cat => cat.slug === r.category_slug)?.name || r.category_slug}` :
                                                            r.product_slug ? `Sản phẩm: ${products.find(p => p.slug === r.product_slug)?.name || r.product_slug}` :
                                                                'Sản phẩm chọn sau'} - Tặng: {r.quantity_per_combo}{r.max_quantity ? ` (Tối đa: ${r.max_quantity})` : ''}
                                                    </Typography>
                                                </li>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Box sx={{ pl: 1 }}>
                                            <Typography variant="body2" sx={{ fontSize: '0.9rem', mb: 1 }}>
                                                <strong>Loại giảm:</strong> {discountConfig.type === 'percent' ? 'Theo phần trăm' : 'Số tiền cố định'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '0.9rem', mb: 1 }}>
                                                <strong>Giá trị:</strong> {discountConfig.type === 'percent' 
                                                    ? `${discountConfig.value}%` 
                                                    : `${new Intl.NumberFormat('vi-VN').format(discountConfig.value)}đ`}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                                                <strong>Áp dụng cho:</strong> {
                                                    discountConfig.apply_to === 'total' ? 'Tổng giá trị đơn hàng' :
                                                    discountConfig.apply_to === 'condition_products' ? 'Sản phẩm điều kiện' :
                                                    'Sản phẩm thưởng'
                                                }
                                            </Typography>
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            fullScreen={isMobile}
            maxWidth="md"
            PaperProps={{
                sx: {
                    borderRadius: isMobile ? 0 : 3,
                    overflow: 'hidden',
                    maxHeight: isMobile ? '100vh' : '90vh',
                    minHeight: isMobile ? '100vh' : '600px',
                    display: 'flex', flexDirection: 'column'
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: 'white',
                p: 2, flexShrink: 0
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>
                        {isEditMode ? 'CẬP NHẬT COMBO' : 'THIẾT LẬP COMBO MỚI'}
                    </Typography>
                    <IconButton onClick={onClose} sx={{ color: 'white' }}><X size={20} /></IconButton>
                </Box>

                {/* Stepper on Header for better look */}
                <Stepper alternativeLabel activeStep={activeStep} connector={<QontoConnector />} sx={{ mt: 3 }}>
                    {steps.map((step) => (
                        <Step key={step.label}>
                            <StepLabel StepIconComponent={QontoStepIcon}>
                                <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{step.label}</Typography>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            <DialogContent sx={{ p: isMobile ? 2 : 4, flex: 1, overflowY: 'auto' }}>
                <Fade in={true} key={activeStep} timeout={300}>
                    <Box sx={{ py: 1 }}>{renderStepContent(activeStep)}</Box>
                </Fade>
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', justifyContent: 'space-between' }}>
                <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ color: 'text.secondary' }}
                    startIcon={<ChevronLeft size={18} />}
                >
                    Quay lại
                </Button>
                <Box>
                    {activeStep === steps.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? null : <Check size={18} />}
                            sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, px: 4 }}
                        >
                            {isSubmitting ? 'Đang lưu...' : 'Hoàn tất'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            endIcon={<ChevronRight size={18} />}
                            sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' }, px: 4 }}
                        >
                            Tiếp tục
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
}
