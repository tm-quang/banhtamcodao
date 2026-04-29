'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomeSearchBar({ className = "max-w-2xl" }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceSort, setPriceSort] = useState('');

  const router = useRouter();
  const searchContainerRef = useRef(null);
  const abortRef = useRef(null);
  const cacheRef = useRef(new Map());

  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const placeholders = [
      "Bánh Tằm Bì...",
      "Bánh Tằm Bì Xíu Mại...",
      "Trà tắc hạt chia..."
    ];

    const currentText = placeholders[placeholderIndex];
    const typingSpeed = isDeleting ? 40 : 80;
    const delay = !isDeleting && charIndex === currentText.length
      ? 2000
      : isDeleting && charIndex === 0
        ? 500
        : typingSpeed;

    const timeoutId = setTimeout(() => {
      if (!isDeleting && charIndex < currentText.length) {
        setCurrentPlaceholder(currentText.slice(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        setCurrentPlaceholder(currentText.slice(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      } else if (!isDeleting && charIndex === currentText.length) {
        setIsDeleting(true);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [charIndex, isDeleting, placeholderIndex]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lấy danh sách category khi mở bộ lọc
  useEffect(() => {
    if (isFilterOpen && categories.length === 0) {
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => {
          if (data && data.categories) {
            setCategories(data.categories);
          }
        })
        .catch(err => console.error('Lỗi khi tải danh mục:', err));
    }
  }, [isFilterOpen, categories.length]);

  // Tự động cuộn trang khi mở dropdown hoặc filter để không bị che khuất
  useEffect(() => {
    if (isDropdownOpen || isFilterOpen) {
      const timer = setTimeout(() => {
        if (searchContainerRef.current) {
          const rect = searchContainerRef.current.getBoundingClientRect();
          // Nếu form search đang ở quá gần top (bị che bởi header) hoặc ở quá thấp
          if (rect.top < 80 || rect.top > 250) {
            const yOffset = -100; // Bù khoảng cách cho fixed header
            const y = rect.top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }
      }, 150); // Chờ một chút để dropdown render xong
      return () => clearTimeout(timer);
    }
  }, [isDropdownOpen, isFilterOpen]);

  const performSearch = useCallback(async (query) => {
    const cached = cacheRef.current.get(query);
    if (cached) {
      setResults(cached);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=5`, { signal: controller.signal });
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      const items = data.products || [];
      cacheRef.current.set(query, items);
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const q = searchQuery.trim();
      if (q.length > 1) {
        performSearch(q);
        setIsDropdownOpen(true);
      } else {
        setResults([]);
        setIsLoading(false);
        setIsDropdownOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());

    // Gắn thêm params lọc nếu có
    if (selectedCategory) params.append('category', selectedCategory);
    if (priceSort) params.append('sort', `price_${priceSort}`);

    const queryString = params.toString();
    router.push(queryString ? `/menu?${queryString}` : '/menu');
    setIsDropdownOpen(false);
    setIsFilterOpen(false);
  };

  const handleProductClick = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className={`relative w-full z-20 ${className}`} ref={searchContainerRef}>
      <form
        onSubmit={handleSearchSubmit}
        className="w-full bg-white rounded-full p-1.5 md:p-1 shadow-md flex items-center border border-gray-200 relative z-10"
      >
        <div className="flex-1 flex items-center px-1 md:px-1">
          <Search className="w-5 h-5 md:w-6 md:h-6 text-gray-400 flex-shrink-0 ml-1 md:ml-2" />
          <input
            type="text"
            placeholder={currentPlaceholder || "Tìm kiếm món..."}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim().length > 1) setIsDropdownOpen(true);
            }}
            onFocus={() => {
              if (searchQuery.trim().length > 1) setIsDropdownOpen(true);
            }}
            className="w-full bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400 px-3 md:px-4 py-3 md:py-4 outline-none text-base md:text-lg font-medium"
          />

          {isLoading && (
            <div className="px-2">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setIsFilterOpen(!isFilterOpen);
              setIsDropdownOpen(false); // Ẩn kết quả search nếu đang mở
            }}
            className={`transition-colors px-2 md:px-3 flex-shrink-0 border-l border-gray-200 ml-1 pl-3 md:pl-4 ${isFilterOpen ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
            title="Lọc món ăn nâng cao"
          >
            <SlidersHorizontal className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
        <button
          type="submit"
          className="bg-primary hover:bg-orange-600 text-white font-bold py-3.5 px-4 md:py-4 md:px-5 rounded-full transition-all duration-300 flex-shrink-0 shadow-md text-base md:text-lg tracking-wide whitespace-nowrap"
        >
          Đặt món ngay
        </button>
      </form>

      {/* Filter Dropdown Form */}
      {isFilterOpen && (
        <div className="absolute top-full right-0 mt-3 bg-white rounded-3xl shadow-md border border-gray-100 p-5 z-20 w-full sm:w-80 text-left">
          <h4 className="font-bold text-gray-800 mb-4 text-base border-b border-gray-100 pb-2">Bộ lọc tìm kiếm</h4>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Danh mục</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-shadow bg-gray-50/50"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Sắp xếp theo giá</label>
            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-shadow bg-gray-50/50"
            >
              <option value="">Mặc định</option>
              <option value="asc">Giá: Thấp đến Cao</option>
              <option value="desc">Giá: Cao đến Thấp</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('');
                setPriceSort('');
              }}
              className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              Xóa
            </button>
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="w-2/3 bg-primary hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-orange-500/20"
            >
              Áp dụng lọc
            </button>
          </div>
        </div>
      )}

      {/* Real-time Search Results Dropdown */}
      {isDropdownOpen && searchQuery.trim().length > 1 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden z-50 text-left">
          <div className="max-h-[60vh] md:max-h-96 overflow-y-auto p-2 scrollbar-thin">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin text-primary/60 mb-3" />
                <p className="font-medium text-sm">Đang tìm kiếm món...</p>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Kết quả tìm kiếm
                </div>
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={handleProductClick}
                    className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:bg-orange-50 group"
                  >
                    <div className="relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
                      <Image
                        src={product.image_url || '/placeholder.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 group-hover:text-primary transition-colors truncate text-base md:text-lg">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500 truncate mb-1">
                        {product.category_name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.discount_price || product.price)}
                        </span>
                        {product.discount_price && product.discount_price < product.price && (
                          <span className="text-xs text-gray-400 line-through">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="border-t border-gray-100 mt-2 p-2">
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full text-center py-2.5 text-sm text-primary font-bold hover:bg-orange-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Xem tất cả kết quả cho &quot;{searchQuery}&quot;
                  </button>
                </div>
              </>
            ) : (
              <div className="py-10 text-center px-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <p className="font-medium text-gray-800">Không tìm thấy món ăn nào</p>
                <p className="text-sm text-gray-500 mt-1">Thử lại với từ khóa khác nhé!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
