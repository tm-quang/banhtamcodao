// src/app/page.js
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/HeroSection';
import Features from '@/components/Features';
import CallToAction from '@/components/CallToAction';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import AboutSection from '@/components/AboutSection'; // New component
import Testimonials from '@/components/Testimonials'; // New component

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
  // Lấy đồng thời 2 loại dữ liệu
  const [featuredProducts, allProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getAllProducts(),
    getCategories()
  ]);

  // JSON-LD Structured Data
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

      {/* About Section - NEW */}
      <AboutSection />

      {/* Section Món Nổi Bật (Slider) */}
      <section className="py-10 md:py-16 bg-light" aria-label="Món nổi bật">
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
      </section>

      {/* Section Thực Đơn Mới */}
      <section className="py-10 md:py-16 bg-white" aria-label="Thực đơn">
        <div className="container mx-auto px-4">
          <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
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