/**
 * Admin products management page - Tailwind CSS Version
 * @file src/app/(admin)/admin/products/page.js
 */
'use client';


import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  PlusCircle, Edit, Trash2, Package, CheckCircle, XCircle, Star, Search,
  X, ShoppingBag, EyeOff, RefreshCw, AlertCircle, Info
} from 'lucide-react';
import { Button } from '@/components/tailwindcss/ui/Button';
import { Input } from '@/components/tailwindcss/ui/Input';
import { Chip } from '@/components/tailwindcss/ui/Chip';
import { Dialog } from '@/components/tailwindcss/ui/Dialog';
import { Tooltip } from '@/components/tailwindcss/ui/Tooltip';
import { AlertModal } from '@/components/tailwindcss/ui/AlertModal';
import { SkeletonStatsCard } from '@/components/tailwindcss/ui/Skeleton';
import DataTable from '@/components/tailwindcss/ui/DataTable';
import ProductModal from '@/components/tailwindcss/ProductModal';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === 0) return '-';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// --- INTERNAL UI COMPONENTS (HTML + TAILWIND) ---

/**
 * Hiển thị Badge Danh mục với tùy biến sâu
 */
const CategoryBadge = ({ name }) => {
  const isBanhTam = name?.toLowerCase().includes('bánh tầm');
  const isDrink = name?.toLowerCase().includes('thức uống');
  const isMonPhu = name?.toLowerCase().includes('món phụ');

  return (
    <div className={`
      inline-flex items-center px-3 py-1 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-white/20
      ${isBanhTam ? 'bg-emerald-600 text-white shadow-emerald-100' :
        isDrink ? 'bg-blue-600 text-white shadow-blue-100' :
          isMonPhu ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-amber-500 text-white shadow-amber-100'}
    `}>
      {name}
    </div>
  );
};

/**
 * Hiển thị Badge Trạng thái
 */
const StatusBadge = ({ status }) => {
  const config = {
    active: { label: 'Đang bán', class: 'bg-green-600 text-white shadow-green-100' },
    inactive: { label: 'Ngưng bán', class: 'bg-red-600 text-white shadow-red-100' },
    hidden: { label: 'Ẩn', class: 'bg-gray-500 text-white shadow-gray-100' },
  };
  const { label, class: styleClass } = config[status] || { label: status, class: 'bg-gray-400 text-white shadow-gray-100' };

  return (
    <span className={`inline-block px-3 py-1 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 ${styleClass}`}>
      {label}
    </span>
  );
};

/**
 * Hiển thị Badge "Bán chạy" (Hot)
 */
const HotBadge = () => (
  <div className="mt-1 flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-2xl border border-red-200 w-fit shadow-sm">
    <Star size={10} fill="currentColor" />
    <span className="text-[9px] font-black uppercase tracking-tighter leading-none">Bán chạy</span>
  </div>
);

// Confirmation Dialog Component
const ConfirmationDialog = ({ open, onClose, onConfirm, title, description, type = 'warning' }) => {
  const footer = (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="outline"
        onClick={onClose}
        className="!bg-gray-300 !hover:bg-gray-500 text-gray-700"
      >
        Hủy
      </Button>
      <Button
        variant={type === 'danger' ? 'danger' : 'primary'}
        onClick={onConfirm}
        className="!hover:bg-opacity-90"
      >
        Xác nhận
      </Button>
    </div>
  );

  const icons = {
    warning: AlertCircle,
    danger: XCircle,
    info: Info
  };

  const Icon = icons[type] || AlertCircle;
  const iconColors = {
    warning: 'text-amber-600',
    danger: 'text-red-600',
    info: 'text-blue-600'
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title={
        <div className={`flex items-center gap-2 ${iconColors[type]}`}>
          <Icon size={22} />
          <span className="font-bold">{title}</span>
        </div>
      }
      footer={footer}
    >
      <p className="text-gray-700">{description}</p>
    </Dialog>
  );
};

// Inventory Cell Component
const InventoryCell = ({ product, inventory, isUpdating, onUpdate }) => {
  const [editingValue, setEditingValue] = useState(inventory?.toString() || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditingValue(inventory?.toString() || '');
  }, [inventory]);

  const handleSave = () => {
    const newValue = editingValue === '' ? null : parseInt(editingValue, 10);
    if (newValue !== inventory) {
      onUpdate(product, newValue);
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditingValue(inventory?.toString() || '');
      setIsEditing(false);
    }
  };

  if (isEditing && !isUpdating) {
    return (
      <input
        type="number"
        value={editingValue}
        onChange={(e) => setEditingValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        autoFocus
        disabled={isUpdating}
        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  const colorStyle = inventory === 0 ? 'bg-red-500 text-white border-red-600 shadow-red-100' :
    (inventory < 10 && inventory !== null) ? 'bg-amber-500 text-white border-amber-600 shadow-amber-100' :
      'bg-blue-600 text-white border-blue-700 shadow-blue-100';

  return (
    <div className={`inline-flex px-3 py-1 rounded-2xl border text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm ${colorStyle}`}
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {inventory !== null && inventory !== undefined ? `${inventory} SP` : 'N/A'}
    </div>
  );
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [togglingProductId, setTogglingProductId] = useState(null);
  const [updatingInventoryId, setUpdatingInventoryId] = useState(null);
  const [filters, setFilters] = useState({ name: '', category: '', status: '', isSpecial: null });
  const [error, setError] = useState(null);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Calculate stats
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.status === 'active').length;
    const inactive = products.filter(p => p.status === 'inactive' || p.status === 'hidden').length;
    const special = products.filter(p => p.is_special).length;
    const lowStock = products.filter(p => p.inventory !== null && p.inventory < 10 && p.inventory > 0).length;
    const outOfStock = products.filter(p => p.inventory === 0).length;
    return { total, active, inactive, special, lowStock, outOfStock };
  }, [products]);


  // Check if product needs inventory management
  const needsInventoryManagement = (product) => {
    const name = (product.name || '').toLowerCase();
    const inventoryKeywords = [
      'cocacola', 'coca cola', 'pepsi', '7up', 'sprite', 'fanta',
      'nước ngọt', 'nước ngọt chai', 'nước ngọt lon', 'chai', 'lon',
      'bottle', 'can', 'thức uống đóng chai', 'thức uống đóng lon'
    ];
    const nameMatch = inventoryKeywords.some(keyword => name.includes(keyword));
    if (product.inventory !== null && product.inventory !== undefined) {
      return true;
    }
    return nameMatch;
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(filters.name.toLowerCase());
      const categoryMatch = filters.category ? product.category_name === filters.category : true;
      const statusMatch = filters.status ? product.status === filters.status : true;
      const specialMatch = filters.isSpecial === null ? true : !!product.is_special === filters.isSpecial;
      return nameMatch && categoryMatch && statusMatch && specialMatch;
    });
  }, [products, filters]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories')
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      if (productsData.success) {
        setProducts(productsData.products || []);
      } else {
        setError('Không thể tải danh sách sản phẩm');
      }

      if (categoriesData.success) {
        setCategories(categoriesData.categories || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Lỗi khi tải dữ liệu');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async (productData) => {
    setIsModalOpen(false);
    fetchProducts();
    router.refresh();
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;

    try {
      const res = await fetch(`/api/admin/products/${deletingProduct.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeletingProduct(null);
        fetchProducts();
        router.refresh();
      } else {
        setAlertModal({ open: true, title: 'Lỗi', message: 'Xóa thất bại!', type: 'error' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setAlertModal({ open: true, title: 'Lỗi', message: 'Xóa thất bại!', type: 'error' });
    }
  };

  const handleToggleSpecial = async (product) => {
    if (togglingProductId === product.id) return;

    const newValue = !product.is_special;
    setTogglingProductId(product.id);

    try {
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, is_special: newValue } : p
      ));

      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_special: newValue })
      });

      if (!res.ok) {
        setProducts(prev => prev.map(p =>
          p.id === product.id ? { ...p, is_special: !newValue } : p
        ));
        setAlertModal({ open: true, title: 'Lỗi', message: 'Cập nhật thất bại!', type: 'error' });
      }
    } catch (error) {
      console.error('Error toggling special:', error);
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, is_special: !newValue } : p
      ));
      setAlertModal({ open: true, title: 'Lỗi', message: 'Cập nhật thất bại!', type: 'error' });
    } finally {
      setTogglingProductId(null);
    }
  };

  const handleUpdateInventory = async (product, newInventory) => {
    if (updatingInventoryId === product.id) return;

    setUpdatingInventoryId(product.id);

    try {
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, inventory: newInventory } : p
      ));

      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory: newInventory })
      });

      if (!res.ok) {
        setProducts(prev => prev.map(p =>
          p.id === product.id ? { ...p, inventory: product.inventory } : p
        ));
        setAlertModal({ open: true, title: 'Lỗi', message: 'Cập nhật thất bại!', type: 'error' });
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, inventory: product.inventory } : p
      ));
      setAlertModal({ open: true, title: 'Lỗi', message: 'Cập nhật thất bại!', type: 'error' });
    } finally {
      setUpdatingInventoryId(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ name: '', category: '', status: '', isSpecial: null });
  };

  const hasActiveFilters = filters.name || filters.category || filters.status || filters.isSpecial !== null;

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ getValue }) => (
        <span className="text-sm font-bold text-blue-600 font-mono">#{getValue()}</span>
      ),
      size: 60,
    },
    {
      accessorKey: 'image_url',
      header: 'Ảnh',
      cell: ({ getValue, row }) => (
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-inner border border-gray-100">
          <Image
            src={getValue() || '/placeholder.jpg'}
            alt={row.original.name}
            fill
            className="object-cover"
          />
        </div>
      ),
      size: 70,
    },
    {
      accessorKey: 'name',
      header: 'Tên món',
      cell: ({ row, getValue }) => (
        <div className="flex flex-col justify-center py-0.5">
          <span className="text-base font-semibold text-gray-900 leading-tight">
            {getValue()}
          </span>
          {row.original.is_special && <HotBadge />}
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: 'category_name',
      header: 'Danh mục',
      cell: ({ getValue }) => <CategoryBadge name={getValue()} />,
      size: 140,
    },
    {
      accessorKey: 'price',
      header: 'Giá bán',
      cell: ({ getValue }) => (
        <span className="text-md font-black text-red-600">
          {formatCurrency(getValue())}
        </span>
      ),
      size: 110,
    },
    {
      accessorKey: 'discount_price',
      header: 'Giá KM',
      cell: ({ getValue }) => (
        getValue() ? (
          <span className="text-md font-bold text-emerald-600">
            {formatCurrency(getValue())}
          </span>
        ) : (
          <span className="text-md text-gray-400">—</span>
        )
      ),
      size: 100,
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      size: 120,
    },
    {
      accessorKey: 'is_special',
      header: 'Bán chạy',
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <label className="relative inline-flex items-center cursor-pointer scale-90">
            <input
              type="checkbox"
              checked={!!row.original.is_special}
              onChange={() => handleToggleSpecial(row.original)}
              disabled={togglingProductId === row.original.id}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
          </label>
        </div>
      ),
      size: 90,
    },
    {
      accessorKey: 'inventory',
      header: 'Tồn kho',
      cell: ({ row }) => (
        <InventoryCell
          product={row.original}
          inventory={row.original.inventory}
          isUpdating={updatingInventoryId === row.original.id}
          onUpdate={handleUpdateInventory}
        />
      ),
      size: 100,
    },
    {
      accessorKey: 'sold_quantity',
      header: 'Đã bán',
      cell: ({ getValue }) => (
        <div className="text-blue-700 px-2 py-0.5 text-base font-bold w-fit">
          {(getValue() || 0).toLocaleString('vi-VN')}
        </div>
      ),
      size: 80,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5">
          <Tooltip content="Chỉnh sửa">
            <button
              onClick={() => { setEditingProduct(row.original); setIsModalOpen(true); }}
              className="w-10 h-10 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-50"
            >
              <Edit size={18} />
            </button>
          </Tooltip>
          <Tooltip content="Xóa vĩnh viễn">
            <button
              onClick={() => setDeletingProduct(row.original)}
              className="w-10 h-10 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-red-50"
            >
              <Trash2 size={18} />
            </button>
          </Tooltip>
        </div>
      ),
      size: 100,
    },
  ], [togglingProductId, updatingInventoryId]);

  return (
    <div className="h-full flex flex-col">
      <style jsx global>{`
          button:focus {
              outline: none !important;
              box-shadow: none !important;
              ring: 0 !important;
          }
      `}</style>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-100/50">
              <Package size={18} fill="currentColor" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Quản lý món ăn</h1>
          </div>
          <p className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.15em] ml-0.5">Quản lý thực đơn và tồn kho ({stats.total} món)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            startIcon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
            onClick={() => { fetchProducts(); fetchCategories(); }}
            className="flex items-center justify-center gap-2 h-10 !rounded-2xl text-gray-600 bg-gray-500 hover:bg-gray-600 font-black uppercase text-xs tracking-widest px-3 shadow-sm transition-all"
          >
            Làm mới
          </Button>
          <Button
            startIcon={<PlusCircle size={20} />}
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 h-10 !rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-xs tracking-widest px-6 shadow-md shadow-orange-100 transition-all"
          >
            Thêm món mới
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
          <p className="text-red-700 font-bold text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-5 px-0.5">
        {loading ? (
          Array(6).fill(0).map((_, i) => <SkeletonStatsCard key={i} />)
        ) : (
          <>
            {/* Tổng món */}
            <div
              onClick={() => setFilters(prev => ({ ...prev, status: '', isSpecial: null }))}
              className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${(!filters.status && filters.isSpecial === null) ? 'z-20 scale-[1.02] shadow-xl border-2 border-white bg-blue-600' : 'z-10 bg-blue-500'}`}>
              <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <Package size={70} className="md:w-[90px] md:h-[90px]" fill="currentColor" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                  <Package size={14} className="md:w-[18px] md:h-[18px]" fill="currentColor" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.total}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Tổng món</p>
                </div>
              </div>
            </div>

            {/* Đang bán */}
            <div
              onClick={() => setFilters(prev => ({ ...prev, status: 'active', isSpecial: null }))}
              className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${filters.status === 'active' ? 'z-20 scale-[1.02] shadow-xl border-2 border-white bg-emerald-600' : 'z-10 bg-emerald-500'}`}>
              <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <CheckCircle size={70} className="md:w-[90px] md:h-[90px]" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                  <CheckCircle size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.active}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Đang bán</p>
                </div>
              </div>
            </div>

            {/* Ngưng bán */}
            <div
              onClick={() => setFilters(prev => ({ ...prev, status: 'inactive', isSpecial: null }))}
              className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${filters.status === 'inactive' ? 'z-20 scale-[1.02] shadow-xl border-2 border-white bg-gray-600' : 'z-10 bg-gray-500'}`}>
              <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <XCircle size={70} className="md:w-[90px] md:h-[90px]" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                  <XCircle size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.inactive}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Ngưng bán</p>
                </div>
              </div>
            </div>

            {/* Bán chạy */}
            <div
              onClick={() => setFilters(prev => ({ ...prev, status: '', isSpecial: true }))}
              className={`group relative p-3 md:p-4 rounded-2xl text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 ${filters.isSpecial === true ? 'z-20 scale-[1.02] shadow-xl border-2 border-white bg-orange-600' : 'z-10 bg-orange-500'}`}>
              <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <Star size={70} className="md:w-[90px] md:h-[90px]" fill="currentColor" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                  <Star size={14} className="md:w-[18px] md:h-[18px]" fill="currentColor" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.special}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Món Hot</p>
                </div>
              </div>
            </div>

            {/* Sắp hết */}
            <div
              className="group relative p-3 md:p-4 rounded-2xl bg-rose-500 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 z-10">
              <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <ShoppingBag size={70} className="md:w-[90px] md:h-[90px]" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                  <ShoppingBag size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.lowStock}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Sắp hết</p>
                </div>
              </div>
            </div>

            {/* Hết hàng */}
            <div
              className="group relative p-3 md:p-4 rounded-2xl bg-slate-800 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 z-10">
              <div className="absolute -right-3 -bottom-3 opacity-15 group-hover:scale-110 transition-transform duration-700">
                <AlertCircle size={70} className="md:w-[90px] md:h-[90px]" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                  <AlertCircle size={14} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div>
                  <p className="text-xl md:text-3xl font-black mb-0.5 tabular-nums tracking-tighter">{stats.outOfStock}</p>
                  <p className="text-[10px] md:text-[15px] font-black uppercase tracking-tight opacity-90">Đã hết</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="flex-1 min-w-[250px]">
            <div className="relative group">
              <Input
                placeholder="TÌM KIẾM TÊN MÓN ĂN..."
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                startIcon={<Search size={18} className="text-gray-600 group-focus-within:text-orange-500 transition-colors" />}
                className="!rounded-2xl border-gray-200 bg-gray-50/50 font-bold uppercase tracking-tight focus:bg-white transition-all pl-12"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[11px] uppercase tracking-widest text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-[11px] uppercase tracking-widest text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang bán</option>
              <option value="inactive">Ngưng bán</option>
              <option value="hidden">Ẩn</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-3 text-[11px] font-black text-red-500 hover:text-red-600 bg-red-50 rounded-xl transition-all active:scale-95 uppercase tracking-widest"
            >
              <X size={14} />
              Xóa lọc
            </button>
          )}
          <div className="h-8 w-px bg-gray-200" />
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] pr-2">Hiển thị {filteredProducts.length} món</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 min-h-[600px]">
        <DataTable
          data={filteredProducts}
          columns={columns}
          loading={loading}
          searchable={false}
          pageSize={25}
          emptyStateIcon={<Package size={48} className="text-gray-600" />}
          emptyStateTitle="Không có sản phẩm"
          emptyStateDescription="Chưa có sản phẩm nào để hiển thị"
        />
      </div>

      {/* Product Modal */}
      <ProductModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        categories={categories}
        productToEdit={editingProduct}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        size="sm"
        noPadding={true}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertCircle size={22} className="text-red-600" />
            </div>
            <div>
              <span className="font-bold text-red-600 block uppercase tracking-tight">Xác nhận xóa món</span>
            </div>
          </div>
        }
        footer={
          <div className="flex items-center justify-end gap-2 w-full px-1">
            <Button
              onClick={() => setDeletingProduct(null)}
              className="flex items-center justify-center h-10 !rounded-2xl border border-gray-200 bg-gray-500 text-white hover:bg-gray-600 font-black uppercase text-[11px] tracking-widest px-6 transition-all"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={confirmDelete}
              className="flex items-center justify-center h-10 !rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-100 font-black uppercase text-[11px] tracking-widest px-8 transition-all"
            >
              Xác nhận xóa
            </Button>
          </div>
        }
      >
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-300">
          <p className="text-gray-700 text-sm leading-relaxed">
            Bạn có chắc chắn muốn xóa món <span className="font-black text-red-600">"{deletingProduct?.name}"</span> không? Hành động này không thể hoàn tác.
          </p>
        </div>
      </Dialog>

      {/* Alert Modal */}
      <AlertModal
        open={alertModal.open}
        onClose={() => setAlertModal(prev => ({ ...prev, open: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}



