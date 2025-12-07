/**
 * Home page component
 * @file src/app/page.js
 */
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/HeroSection';
import Features from '@/components/Features';
import CallToAction from '@/components/CallToAction';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import AboutSection from '@/components/AboutSection';
import Testimonials from '@/components/Testimonials';
import PromotionSection from '@/components/PromotionSection';
import CategoryHighlights from '@/components/CategoryHighlights';

/** Lazy load các component nặng */
const FeaturedSlider = dynamic(() => import('@/components/FeaturedSlider'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: true
});

const MenuSection = dynamic(() => import('@/components/MenuSection'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: true
});

/**
 * Helper function để lấy base URL
 * @returns {string} Base URL của API
 */
function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3300';
}

async function getFeaturedProducts() {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/products/featured`, {
    cache: 'no-store',
    next: { revalidate: 300 } // Revalidate every 5 minutes
  });
  if (!res.ok) { return []; }
  const data = await res.json();
  return data.products || [];
}

/**
 * Hàm mới để lấy tất cả sản phẩm
 * @returns {Promise<Array>} Danh sách tất cả sản phẩm
 */
async function getAllProducts() {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/products`, {
    cache: 'no-store',
    next: { revalidate: 300 } // Revalidate every 5 minutes
  });
  if (!res.ok) { return []; }
  const data = await res.json();
  return data.products || [];
}

async function getCategories() {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/categories`, {
    cache: 'no-store',
    next: { revalidate: 300 }
  });
  if (!res.ok) { return []; }
  const data = await res.json();
  return data.categories || [];
}

export const metadata = {
  title: 'Bánh Tằm Cô Đào - Đặc Sản Miền Tây | Món Ngon Chuẩn Vị',
  description: 'Thưởng thức Bánh Tằm Cô Đào - đặc sản miền Tây thơm ngon, đậm đà. Thực đơn đa dạng: bánh tằm bì, xíu mại, nước cốt dừa béo ngậy. Đặt món ngay!',
  keywords: 'bánh tằm, cô đào, bánh tằm bì, đặc sản miền tây, món ngon, ẩm thực việt nam, đặt đồ ăn online',
  openGraph: {
    title: 'Bánh Tằm Cô Đào - Đặc Sản Miền Tây',
    description: 'Hương vị miền Tây dân dã, đậm đà khó quên tại Bánh Tằm Cô Đào.',
    type: 'website',
    locale: 'vi_VN',
    images: [
      {
        url: '/images/banner-logo/banner.jpg', // Update with actual OG image
        width: 1200,
        height: 630,
        alt: 'Bánh Tằm Cô Đào Banner',
      },
    ],
  },
};

export default async function HomePage() {
  /** Lấy đồng thời 2 loại dữ liệu */
  const [featuredProducts, allProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getAllProducts(),
    getCategories()
  ]);

  /** JSON-LD Structured Data */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Bánh Tằm Cô Đào',
    image: 'https://banhtamcodao.com/images/banner-logo/logo.png', // Replace with actual domain/image
    '@id': 'https://banhtamcodao.com',
    url: 'https://banhtamcodao.com',
    telephone: '+84123456789', // Replace with actual phone
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Đường ABC', // Replace with actual address
      addressLocality: 'Quận Ninh Kiều',
      addressRegion: 'Cần Thơ',
      postalCode: '900000',
      addressCountry: 'VN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 10.045162, // Replace with actual coords
      longitude: 105.746857
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      opens: '07:00',
      closes: '21:00'
    },
    menu: 'https://banhtamcodao.com/menu',
    servesCuisine: 'Vietnamese',
    priceRange: '$$'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero slider: hiển thị ngay, KHÔNG áp dụng AnimateOnScroll */}
      <HeroSection />

      <AnimateOnScroll>
        <Features />
      </AnimateOnScroll>

      {/* Promotion Section */}
      <AnimateOnScroll>
        <PromotionSection />
      </AnimateOnScroll>

      {/* Category Highlights */}
      <AnimateOnScroll>
        <CategoryHighlights />
      </AnimateOnScroll>

      {/* About Section */}
      <AboutSection />

      {/* Section Món Nổi Bật (Slider) - Commented out for now */}
      {/* <section className="py-10 md:py-16" aria-label="Món nổi bật" style={{ backgroundColor: '#F0F2F5' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <span className="text-primary font-bold tracking-wider uppercase text-xs md:text-sm">Được yêu thích nhất</span>
            <h2 className="text-3xl md:text-4xl font-lobster text-secondary mt-2">Món Ngon Phải Thử</h2>
          </div>
          <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
            {featuredProducts.length > 0 && (
              <FeaturedSlider products={featuredProducts} />
            )}
          </Suspense>
        </div>
      </section> */}

      {/* Section Thực Đơn Mới */}
      <section className="relative py-10 md:py-16 overflow-hidden" aria-label="Thực đơn">
        <div className="max-w-[1200px] mx-auto px-4">
          <Suspense fallback={
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-4">
                  <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-[4/3] mb-3">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }>
            {allProducts.length > 0 ? (
              <MenuSection products={allProducts} categoriesList={categories} />
            ) : (
              <p className="text-center text-gray-600 py-10">
                Đang cập nhật thực đơn...
              </p>
            )}
          </Suspense>
        </div>
      </section>

      {/* Testimonials - NEW */}
      <Testimonials />

      <AnimateOnScroll>
        <CallToAction />
      </AnimateOnScroll>
    </>
  );
}