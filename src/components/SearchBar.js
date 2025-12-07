// src/components/SearchBar.js
'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SearchBar({ className = '', isContactPage = false }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSearchBox, setShowSearchBox] = useState(false);

  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const router = useRouter();
  const abortRef = useRef(null);
  const cacheRef = useRef(new Map());

  const performSearch = useCallback(async (searchQuery) => {
    // Use in-memory cache to avoid refetching while typing
    const cached = cacheRef.current.get(searchQuery);
    if (cached) {
      setResults(cached);
      return;
    }

    // Abort previous request for smoother UX
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=8`, { signal: controller.signal });
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      const items = data.products || [];
      cacheRef.current.set(searchQuery, items);
      setResults(items);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
        setResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search (faster and smoother)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const q = query.trim();
      if (q.length > 1) {
        performSearch(q);
      } else {
        setResults([]);
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleProductClick(results[selectedIndex]);
        } else if (query.trim()) {
          handleSearchSubmit();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        setShowSearchBox(false);
        break;
    }
  };

  const handleProductClick = (product) => {
    router.push(`/product/${product.slug}`);
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  const handleSearchSubmit = () => {
    if (query.trim()) {
      router.push(`/menu?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery('');
      setResults([]);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const toggleSearchBox = () => {
    setShowSearchBox(prev => !prev);
    if (!showSearchBox) {
      setTimeout(() => {
        const input = searchRef.current?.querySelector('input');
        if (input) input.focus();
      }, 50);
    } else {
      clearSearch();
    }
  };

  // Close dropdown when clicking outside (capture both mouse and touch)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!searchRef.current) return;
      if (!searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
        setShowSearchBox(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside, true);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside, true);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Icon only */}
      {!showSearchBox && (
        <button
          onClick={toggleSearchBox}
          className={`p-2 ${isContactPage ? 'hover:text-white/80 text-white' : 'hover:text-primary'} transition-colors`}
          aria-label="Mở tìm kiếm"
        >
          <Search size={22} />
        </button>
      )}

      {/* Dropdown below icon */}
      {showSearchBox && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-96 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Input on top */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsOpen(true)}
                  placeholder="Tìm kiếm món ăn..."
                  className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <button onClick={toggleSearchBox} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
                {isLoading && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <div className="relative w-4 h-4 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results below */}
            {isOpen && query.trim().length > 1 && (
              <div className="max-h-96 overflow-y-auto p-2">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">Đang tìm kiếm...</div>
                ) : results.length > 0 ? (
                  <>
                    {results.map((product, index) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => handleProductClick(product)}
                        className={`block rounded-xl ${index === selectedIndex ? 'bg-gray-100 ring-1 ring-primary/10' : ''}`}
                      >
                        <div className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group hover:bg-gray-100">
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <Image
                              src={product.image_url || '/placeholder.jpg'}
                              alt={product.name}
                              fill
                              className="object-cover rounded-lg shadow-sm"
                              sizes="48px"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-secondary group-hover:text-primary transition-colors">{product.name}</h4>
                            <p className="text-xs text-gray-500">{product.category_name}</p>
                            <p className="text-sm font-bold text-primary mt-0.5">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.discount_price || product.price)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    <div className="border-t border-gray-200 mt-1 pt-2">
                      <button onClick={handleSearchSubmit} className="w-full text-center py-2 text-sm text-primary font-medium hover:bg-orange-50 rounded-lg transition-colors">Xem tất cả kết quả cho &quot;{query}&quot;</button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500">Không tìm thấy sản phẩm nào</div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

