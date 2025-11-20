// src/app/menu/loading.js
import ProductCardSkeleton from '@/components/ProductCardSkeleton';

export default function MenuLoading() {
  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      <h1 className="text-4xl font-lobster text-center text-primary mb-8">
        Thực đơn của chúng tôi
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Lặp lại 8 thẻ skeleton để lấp đầy không gian */}
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}