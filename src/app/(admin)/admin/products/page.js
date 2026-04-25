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
      inline-flex items-center px-3 py-1.5 rounded-full text-md font-bold shadow-sm
      ${isBanhTam ? 'bg-emerald-500 text-white' :
        isDrink ? 'bg-blue-500 text-white' :
          isMonPhu ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-700'}
    `}>
      <span className={`w-2 h-2 rounded-full mr-2 ${isBanhTam || isDrink || isMonPhu ? 'bg-white animate-pulse' : 'bg-amber-500'}`} />
      {name}
    </div>
  );
};

/**
 * Hiển thị Badge Trạng thái
 */
const StatusBadge = ({ status }) => {
  const config = {
    active: { label: 'Đang bán', class: 'bg-green-600 text-white' },
    inactive: { label: 'Ngưng bán', class: 'bg-red-600 text-white' },
    hidden: { label: 'Ẩn', class: 'bg-gray-500 text-white' },
  };
  const { label, class: styleClass } = config[status] || { label: status, class: 'bg-gray-400 text-white' };

  return (
    <span className={`inline-block px-3 py-1.5 rounded-full text-md font-black tracking-tight ${styleClass}`}>
      {label}
    </span>
  );
};

/**
 * Hiển thị Badge "Bán chạy" (Hot)
 */
const HotBadge = () => (
  <div className="mt-1 flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-100 w-fit">
    <Star size={10} fill="red" />
    <span className="text-[10px] font-black uppercase leading-none">Bán chạy</span>
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

  const colorStyle = inventory === 0 ? 'bg-red-50 text-red-700 border-red-200' :
    (inventory < 10 && inventory !== null) ? 'bg-amber-50 text-amber-700 border-amber-200' :
      'bg-green-50 text-green-700 border-green-200';

  return (
    <div className={`inline-flex px-3 py-1 rounded-full border text-md font-bold cursor-pointer transition-colors shadow-sm ${colorStyle}`}
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {inventory !== null && inventory !== undefined ? inventory : 'Chưa có'}
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
    return { total, active, inactive, special };
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
        <div className="flex items-center justify-center gap-1">
          <Tooltip content="Sửa">
            <button
              onClick={() => { setEditingProduct(row.original); setIsModalOpen(true); }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            >
              <Edit size={18} />
            </button>
          </Tooltip>
          <Tooltip content="Xóa">
            <button
              onClick={() => setDeletingProduct(row.original)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Quản lý món</h1>
          <span className="text-sm text-gray-500">({stats.total} món)</span>
        </div>
        <Button
          variant="outline"
          startIcon={<RefreshCw size={16} />}
          onClick={() => { fetchProducts(); fetchCategories(); }}
          className="!bg-gray-500 !hover:bg-gray-600 text-white"
        >
          Làm mới
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
        {loading ? (
          <>
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
          </>
        ) : (
          <>
            {/* Tổng món */}
            <div 
              onClick={() => setFilters(prev => ({ ...prev, status: '', isSpecial: null }))}
              className={`relative p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${(!filters.status && filters.isSpecial === null) ? 'ring-4 ring-blue-300 ring-offset-2' : ''}`}>
              <Package size={80} className="absolute bottom-0 right-0 opacity-10" />
              <div className="relative z-10">
                <Package size={32} className="opacity-90 mb-3" />
                <p className="text-3xl font-bold mb-1">{stats.total}</p>
                <p className="text-sm opacity-90">Tổng món</p>
              </div>
            </div>

            {/* Đang bán */}
            <div 
              onClick={() => setFilters(prev => ({ ...prev, status: 'active', isSpecial: null }))}
              className={`relative p-4 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${filters.status === 'active' ? 'ring-4 ring-green-300 ring-offset-2' : ''}`}>
              <CheckCircle size={80} className="absolute bottom-0 right-0 opacity-10" />
              <div className="relative z-10">
                <CheckCircle size={32} className="opacity-90 mb-3" />
                <p className="text-3xl font-bold mb-1">{stats.active}</p>
                <p className="text-sm opacity-90">Đang bán</p>
              </div>
            </div>

            {/* Ngưng bán */}
            <div 
              onClick={() => setFilters(prev => ({ ...prev, status: 'inactive', isSpecial: null }))}
              className={`relative p-4 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${filters.status === 'inactive' ? 'ring-4 ring-gray-300 ring-offset-2' : ''}`}>
              <XCircle size={80} className="absolute bottom-0 right-0 opacity-10" />
              <div className="relative z-10">
                <XCircle size={32} className="opacity-90 mb-3" />
                <p className="text-3xl font-bold mb-1">{stats.inactive}</p>
                <p className="text-sm opacity-90">Ngưng bán</p>
              </div>
            </div>

            {/* Hot */}
            <div 
              onClick={() => setFilters(prev => ({ ...prev, status: '', isSpecial: true }))}
              className={`relative p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 ${filters.isSpecial === true ? 'ring-4 ring-amber-300 ring-offset-2' : ''}`}>
              <Star size={80} className="absolute bottom-0 right-0 opacity-10" />
              <div className="relative z-10">
                <Star size={32} className="opacity-90 mb-3" />
                <p className="text-3xl font-bold mb-1">{stats.special}</p>
                <p className="text-sm opacity-90">Hot</p>
              </div>
            </div>

            {/* Coming Soon placeholders */}
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1">
              <Star size={80} className="absolute bottom-0 right-0 opacity-10" />
              <div className="relative z-10">
                <Star size={32} className="opacity-90 mb-3" />
                <p className="text-3xl font-bold mb-1">0</p>
                <p className="text-sm opacity-90">COMING SOON</p>
              </div>
            </div>
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1">
              <Star size={80} className="absolute bottom-0 right-0 opacity-10" />
              <div className="relative z-10">
                <Star size={32} className="opacity-90 mb-3" />
                <p className="text-3xl font-bold mb-1">0</p>
                <p className="text-sm opacity-90">COMING SOON</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter & Actions Row */}
      <div className="p-4 mb-4 rounded-lg bg-gray-50 border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <Input
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              placeholder="Tìm kiếm..."
              startIcon={<Search size={16} />}
            />
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="inactive">Ngưng bán</option>
            <option value="hidden">Ẩn</option>
          </select>

          {hasActiveFilters && (
            <Button
              size="sm"
              variant="ghost"
              startIcon={<X size={14} />}
              onClick={clearFilters}
            >
              Xóa lọc
            </Button>
          )}

          {/* Add Button */}
          <Button
            variant="primary"
            startIcon={<PlusCircle size={18} />}
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          >
            + Thêm món
          </Button>
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
          emptyStateIcon={<Package size={48} className="text-gray-400" />}
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
      <ConfirmationDialog
        open={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa món"
        description={`Bạn có chắc chắn muốn xóa món "${deletingProduct?.name}" không?`}
      />

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


