// src/app/menu/page.js
'use client';

import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import CategoryTabs from '@/components/CategoryTabs';
import HeroSection from '@/components/HeroSection';
import MenuFilters from '@/components/MenuFilters';
import { useSearchParams } from 'next/navigation';

// Lazy load ProductCard để tối ưu hiệu suất
const ProductCard = dynamic(() => import('@/components/ProductCard'), {
  loading: () => <ProductCardSkeleton />,
  ssr: true
});

async function getProducts(filters = {}) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  const res = await fetch(`/api/products?${params.toString()}`, { 
    cache: 'no-store'
  });

  if (!res.ok) {
    console.error("Failed to fetch products");
    return [];
  }

  const data = await res.json();
  return data.products || [];
}


// Loading component
function MenuLoading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [filters, setFilters] = useState({});
  const searchParams = useSearchParams();

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.success) {
          const preferredOrder = ['Bánh Tằm','Món Phụ','Thức Uống','Trà Sữa','Ăn Vặt'];
          const orderIndex = (name) => {
            const i = preferredOrder.indexOf(name);
            return i === -1 ? Number.MAX_SAFE_INTEGER : i;
          };
          const sorted = (data.categories || []).slice().sort((a, b) => {
            const ai = orderIndex(a.name);
            const bi = orderIndex(b.name);
            if (ai !== bi) return ai - bi;
            return a.name.localeCompare(b.name);
          });
          setCategories(sorted);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Load products with category filter and other filters
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const search = searchParams.get('search');
        const allFilters = { 
          category: activeCategory,
          ...filters 
        };
        if (search) allFilters.search = search;
        
        const productsData = await getProducts(allFilters);
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [activeCategory, filters, searchParams]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId || '');
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="pb-8">
      {/* Hero slider for Menu page (shorter height) */}
      <HeroSection 
        heightClass="h-[55vh] min-h-[360px]"
        slides={[
          {
            imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
            title: "Thực đơn đặc sắc",
            subtitle: "Chọn món yêu thích của bạn ngay hôm nay",
            buttonText: "Xem món",
            buttonLink: "/menu"
          },
          {
            imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop",
            title: "Nguyên liệu tươi mới",
            subtitle: "Đảm bảo chất lượng trong từng món",
            buttonText: "Khám phá",
            buttonLink: "/menu"
          },
          {
            imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=2070&auto=format&fit=crop",
            title: "Ưu đãi hấp dẫn",
            subtitle: "Nhiều lựa chọn với mức giá tốt",
            buttonText: "Xem ưu đãi",
            buttonLink: "/menu"
          }
        ]}
      />

      {/* Explore indicator under hero */}
      <div className="-mt-10 mb-10 flex flex-col items-center justify-center">
        <span className="text-white/90 text-sm mb-2">Khám phá thêm</span>
        <div className="w-6 h-10 border-2 border-white/70 rounded-full flex items-start justify-center">
          <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-semibold tracking-[0.2em] uppercase text-primary bg-primary/10 rounded-full">
            Gợi ý hôm nay
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-lobster text-secondary drop-shadow-sm">
            Thực đơn của chúng tôi
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
            Khám phá thực đơn đa dạng với nguyên liệu tươi mới và món ngon chuẩn vị miền Tây.
          </p>
        </div>

        {/* Category Tabs */}
        <CategoryTabs 
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Filters */}
        <div className="flex justify-end mb-6">
          <MenuFilters onFiltersChange={handleFiltersChange} />
        </div>

        {/* Products Grid */}
        {loading ? (
          <MenuLoading />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">
              Không tìm thấy sản phẩm nào trong danh mục này.
            </p>
            <button
              onClick={() => setActiveCategory('')}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Xem tất cả
            </button>
          </div>
        )}
      </div>
    </div>
  );
}