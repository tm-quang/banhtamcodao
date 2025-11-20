// src/app/product/[slug]/page.js
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ProductDetailClient from '@/components/ProductDetailClient';
import ReviewSection from '@/components/ReviewSection';
import RelatedProducts from '@/components/RelatedProducts';
import { StaticStarRating } from '@/components/StarRating';

async function getProductDetail(slug) {
  const res = await fetch(`http://localhost:3300/api/products/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const data = await getProductDetail(resolvedParams.slug);
  const productName = data?.product?.name || "Sản phẩm";
  return { title: `${productName} - Bánh Tằm Cô Đào` };
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const data = await getProductDetail(resolvedParams.slug);

  if (!data || !data.success) {
    return (
      <div className="container mx-auto text-center py-20">
        <h1 className="text-2xl">Không tìm thấy sản phẩm</h1>
        <Link href="/menu" className="text-primary hover:underline mt-4 inline-block">Quay lại thực đơn</Link>
      </div>
    );
  }

  const { product, reviews, relatedProducts, images } = data;
  const totalReviews = reviews?.length || 0;
  const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
  const galleryImages = [{ id: 'main', image_url: product.image_url }, ...(images || [])];

  return (
    // --- Tối ưu padding cho mobile ---
    <div className="bg-gray-50 pt-24 md:pt-24 pb-16">
      <div className="container mx-auto px-4">
        <nav className="mb-6">
          <ol className="flex text-gray-500 text-sm items-center flex-wrap">
            <li><Link href="/" className="hover:text-primary">Trang chủ</Link></li>
            <li><ChevronRight size={16} className="mx-1" /></li>
            <li><Link href="/menu" className="hover:text-primary">Thực đơn</Link></li>
            <li><ChevronRight size={16} className="mx-1" /></li>
            <li className="font-medium text-secondary truncate">{product.name}</li>
          </ol>
        </nav>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
            <div>
              <div className="aspect-square relative rounded-lg overflow-hidden border">
                <Image src={galleryImages[0].image_url || '/placeholder.jpg'} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
              </div>
            </div>
            <div className="flex flex-col">
              {/* --- Tối ưu kích thước font chữ --- */}
              <h1 className="text-4xl md:text-4xl font-medium text-secondary mb-4">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <StaticStarRating rating={averageRating} size={20} />
                <a href="#reviews" className="text-sm text-gray-500 hover:underline">({totalReviews} đánh giá)</a>
              </div>
              <p className="text-3xl md:text-4xl font-medium text-primary mb-4">
                {formatCurrency(product.discount_price ?? product.price)}
                {product.discount_price && (
                  <span className="text-xl md:text-xl text-gray-700 line-through ml-6">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </p>
              <ProductDetailClient product={product} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-8">
          <div className="border-b pb-4 mb-4">
            {/* TIÊU ĐỀ */}
            <h2 className="text-xl md:text-2xl font-medium text-secondary">
              Thông tin chi tiết
            </h2>
            {/* GẠCH CHÂN MÀU ĐỎ */}
            <div className="w-24 h-0.5 bg-primary mt-2"></div>
          </div>
          <p className="text-gray-600 leading-relaxed">
            {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
          </p>
        </div>

        <div id="reviews" className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <ReviewSection productId={product.id} reviews={reviews} />
        </div>

        <div className="mt-12">
          <RelatedProducts products={relatedProducts} />
        </div>
      </div>
    </div>
  );
}