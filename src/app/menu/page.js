/**
 * Menu page component
 * @file src/app/menu/page.js
 */
import { Suspense } from 'react';
import MenuContent from './MenuContent';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';

export const metadata = {
  title: 'Thực đơn - Bánh Tằm Cô Đào',
  description: 'Khám phá thực đơn đa dạng các món bánh tằm và đồ uống tại Bánh Tằm Cô Đào',
};

/** Loading component */
function MenuLoading() {
  return (
    <div className="pb-8">
      {/* Hero placeholder */}
      <div className="h-[55vh] min-h-[360px] bg-gray-200 animate-pulse" />

      {/* Explore indicator skeleton */}
      <div className="-mt-10 mb-10 flex flex-col items-center justify-center">
        <div className="h-4 w-24 bg-gray-200 rounded-full animate-pulse mb-2" />
        <div className="w-6 h-10 border-2 border-gray-200 rounded-full flex items-start justify-center">
          <div className="w-1 h-3 bg-gray-200 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>

      <div className="page-container mt-6">
        {/* Title section skeleton */}
        <div className="text-center mb-8 md:mb-12">
          {/* Badge skeleton - matches actual badge style */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-200 animate-pulse">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <div className="h-3 w-28 bg-gray-300 rounded-full" />
            <div className="w-3 h-3 rounded-full bg-gray-300" />
          </div>
          {/* Title skeleton - matches font-lobster text-4xl md:text-5xl */}
          <div className="h-12 md:h-14 w-80 max-w-full bg-gray-200 rounded-lg mx-auto mt-2 animate-pulse" />
        </div>

        {/* Category slider placeholder - matches actual CategorySlider structure with Swiper */}
        <div className="mb-2 relative w-full">
          <div className="w-full overflow-visible md:overflow-hidden">
            <div className="py-8">
              {/* Mobile: spaceBetween 16, offset 16px left/right | Desktop: spaceBetween 20, no offset */}
              <div className="flex gap-4 md:gap-5 pl-4 pr-4 md:pl-0 md:pr-0 overflow-x-auto">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0">
                    <div className="w-28 h-32 rounded-2xl bg-white border border-gray-200 shadow-md flex flex-col items-center justify-center animate-pulse">
                      {/* Circular image placeholder */}
                      <div className="w-16 h-16 rounded-full bg-gray-200 mb-2" />
                      {/* Category name placeholder */}
                      <div className="h-4 w-20 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                ))}
                {/* "Xem tất cả" button skeleton */}
                <div className="flex-shrink-0 mr-4 md:mr-0">
                  <div className="w-28 h-32 rounded-2xl bg-orange-50 border-2 border-orange-200 shadow-md flex flex-col items-center justify-center animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-white shadow-md mb-2 flex items-center justify-center">
                      <div className="w-8 h-8 bg-orange-200 rounded-full" />
                    </div>
                    <div className="h-4 w-20 bg-orange-200 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters skeleton - matches MenuFilters button */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg animate-pulse">
            <div className="w-5 h-5 bg-gray-200 rounded" />
            <div className="hidden sm:block h-4 w-16 bg-gray-200 rounded" />
            <div className="w-4 h-4 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Products grid placeholder */}
        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuLoading />}>
      <MenuContent />
    </Suspense>
  );
}