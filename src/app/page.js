// src/app/page.js
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/HeroSection';
import Features from '@/components/Features';
import CallToAction from '@/components/CallToAction';
import AnimateOnScroll from '@/components/AnimateOnScroll';

// Lazy load các component nặng
const FeaturedSlider = dynamic(() => import('@/components/FeaturedSlider'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: true
});

const MenuSection = dynamic(() => import('@/components/MenuSection'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: true
});

async function getFeaturedProducts() {
  const res = await fetch('http://localhost:3300/api/products/featured', { 
    cache: 'no-store',
    next: { revalidate: 300 } // Revalidate every 5 minutes
  });
  if (!res.ok) { return []; }
  const data = await res.json();
  return data.products || [];
}

// Hàm mới để lấy tất cả sản phẩm
async function getAllProducts() {
  const res = await fetch('http://localhost:3300/api/products', { 
    cache: 'no-store',
    next: { revalidate: 300 } // Revalidate every 5 minutes
  });
  if (!res.ok) { return []; }
  const data = await res.json();
  return data.products || [];
}

async function getCategories() {
  const res = await fetch('http://localhost:3300/api/categories', {
    cache: 'no-store',
    next: { revalidate: 300 }
  });
  if (!res.ok) { return []; }
  const data = await res.json();
  return data.categories || [];
}

export const metadata = {
  title: 'Bánh Tằm Cô Đào - Món ăn ngon, hấp dẫn',
  description: 'Khám phá thế giới ẩm thực đa dạng tại Bánh Tằm Cô Đào. Thực đơn phong phú với những món ăn ngon, chất lượng cao và giá cả hợp lý.',
  keywords: 'bánh tằm, cô đào, ẩm thực, món ăn ngon, thực đơn, đặt hàng online',
  openGraph: {
    title: 'Bánh Tằm Cô Đào - Món ăn ngon, hấp dẫn',
    description: 'Khám phá thế giới ẩm thực đa dạng tại Bánh Tằm Cô Đào',
    type: 'website',
    locale: 'vi_VN',
  },
};

export default async function HomePage() {
  // Lấy đồng thời 2 loại dữ liệu
  const [featuredProducts, allProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getAllProducts(),
    getCategories()
  ]);

  return (
    <>
      {/* Hero slider: hiển thị ngay, KHÔNG áp dụng AnimateOnScroll */}
      <HeroSection />

      <AnimateOnScroll>
        <Features />
      </AnimateOnScroll>

      {/* Section Món Nổi Bật (Slider) */}
      <section className="py-4 bg-light">
        <div className="container mx-auto px-4">
          <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
            {featuredProducts.length > 0 && (
              <FeaturedSlider products={featuredProducts} />
            )}
          </Suspense>
        </div>
      </section>

      {/* Section Thực Đơn Mới */}
      <section className="py-4 bg-white">
        <div className="container mx-auto px-4">
          <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
            {allProducts.length > 0 ? (
              <MenuSection products={allProducts} categoriesList={categories} />
            ) : (
              <p className="text-center text-gray-600">
                Chưa có sản phẩm nào trong thực đơn.
              </p>
            )}
          </Suspense>
        </div>
      </section>

      <AnimateOnScroll>
        <CallToAction />
      </AnimateOnScroll>
    </>
  );
}