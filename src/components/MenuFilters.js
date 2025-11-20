// src/components/MenuFilters.js
'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

export default function MenuFilters({ onFiltersChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    sort: 'name',
    order: 'asc',
    priceRange: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      sort: 'name',
      order: 'asc',
      priceRange: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.sort !== 'name' || filters.order !== 'asc' || filters.priceRange;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter size={20} />
        <span className="hidden sm:inline">Sắp xếp</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-primary rounded-full"></span>
        )}
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-50 pointer-events-auto" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Filters Panel */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">
                Sắp xếp sản phẩm
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:text-orange-600 transition-colors"
                >
                  Xóa
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sắp xếp theo
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="name">Tên sản phẩm</option>
                  <option value="price">Giá</option>
                  <option value="created_at">Ngày thêm</option>
                </select>
              </div>

              {/* Order Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thứ tự
                </label>
                <select
                  value={filters.order}
                  onChange={(e) => handleFilterChange('order', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="asc">Tăng dần</option>
                  <option value="desc">Giảm dần</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khoảng giá
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Tất cả mức giá</option>
                  <option value="0-50000">Dưới 50.000đ</option>
                  <option value="50000-100000">50.000đ - 100.000đ</option>
                  <option value="100000-200000">100.000đ - 200.000đ</option>
                  <option value="200000+">Trên 200.000đ</option>
                </select>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
