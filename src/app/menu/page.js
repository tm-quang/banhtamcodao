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

      <div className="max-w-[1200px] mx-auto px-4 mt-16">
        <div className="text-center mb-8 md:mb-12">
          <div className="h-6 w-40 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse" />
          <div className="h-12 w-80 bg-gray-200 rounded-lg mx-auto animate-pulse" />
        </div>

        {/* Category slider placeholder */}
        <div className="flex gap-3 mb-8 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
          ))}
        </div>

        {/* Products grid placeholder */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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