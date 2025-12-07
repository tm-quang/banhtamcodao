/**
 * Product detail page component
 * @file src/app/product/[slug]/page.js
 */
import Image from 'next/image';
import { ChevronRight, Share2 } from 'lucide-react';
import Link from 'next/link';
import ProductDetailClient from '@/components/ProductDetailClient';
import ReviewSection from '@/components/ReviewSection';
import RelatedProducts from '@/components/RelatedProducts';
import ProductGallery from '@/components/ProductGallery';
import ProductBadges from '@/components/ProductBadges';
import NutritionalInfo from '@/components/NutritionalInfo';
import ProductTabs from '@/components/ProductTabs';
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
  return {
    title: `${productName} - Bánh Tằm Cô Đào`,
    description: data?.product?.description || `Xem chi tiết ${productName} tại Bánh Tằm Cô Đào`,
  };
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const data = await getProductDetail(resolvedParams.slug);

  if (!data || !data.success) {
    return (
      <div className="max-w-[1200px] mx-auto text-center py-20">
        <h1 className="text-2xl">Không tìm thấy sản phẩm</h1>
        <Link href="/menu" className="text-primary hover:underline mt-4 inline-block">Quay lại thực đơn</Link>
      </div>
    );
  }

  const { product, reviews, relatedProducts, images } = data;
  const totalReviews = reviews?.length || 0;
  const averageRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;

  // Prepare gallery images
  const galleryImages = images && images.length > 0
    ? images
    : [{ id: 'main', image_url: product.image_url }];

  // Mock product options (replace with real data from API when available)
  const productOptions = [
    // Example size options
    // { id: 1, type: 'size', name: 'Nhỏ', price_adjustment: 0 },
    // { id: 2, type: 'size', name: 'Vừa', price_adjustment: 5000 },
    // { id: 3, type: 'size', name: 'Lớn', price_adjustment: 10000 },
    // Example topping options
    // { id: 4, type: 'topping', name: 'Thêm trứng', price_adjustment: 5000 },
    // { id: 5, type: 'topping', name: 'Thêm thịt', price_adjustment: 10000 },
  ];

  // Mock nutritional info (replace with real data from product.nutritional_info when available)
  const nutritionalInfo = product.nutritional_info || null;
  // Example:
  // {
  //   serving_size: '100g',
  //   calories: 250,
  //   protein: 8,
  //   carbs: 35,
  //   fat: 10,
  //   fiber: 3,
  //   sugar: 5,
  //   sodium: 400,
  //   allergens: ['Gluten', 'Trứng']
  // }

  // Determine badges
  const badges = product.badges || [];
  // Auto-add sale badge if there's a discount
  if (product.discount_price && !badges.includes('sale') && !badges.includes('giảm giá')) {
    badges.push('sale');
  }

  // Calculate discount percentage
  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null;

  return (
    <div className="pt-24 md:pt-24 pb-16">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex text-gray-500 text-sm items-center flex-wrap">
            <li><Link href="/" className="hover:text-primary">Trang chủ</Link></li>
            <li><ChevronRight size={16} className="mx-1" /></li>
            <li><Link href="/menu" className="hover:text-primary">Thực đơn</Link></li>
            <li><ChevronRight size={16} className="mx-1" /></li>
            <li className="font-medium text-secondary truncate">{product.name}</li>
          </ol>
        </nav>

        {/* Product Main Section */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
            {/* Product Gallery */}
            <div className="relative">
              <ProductBadges badges={badges} discountPercent={discountPercent} />
              <ProductGallery images={galleryImages} productName={product.name} />
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <h1 className="text-3xl md:text-4xl font-medium text-secondary mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <StaticStarRating rating={averageRating} size={20} />
                <a href="#reviews" className="text-sm text-gray-500 hover:underline">({totalReviews} đánh giá)</a>
              </div>

              {/* Price */}
              <div className="mb-6">
                <p className="text-3xl md:text-4xl font-medium text-primary">
                  {formatCurrency(product.discount_price ?? product.price)}
                  {product.discount_price && (
                    <span className="text-xl md:text-xl text-gray-500 line-through ml-4">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </p>
              </div>

              {/* Short Description */}
              {product.description && (
                <div className="mb-6 pb-6 border-b">
                  <p className="text-gray-600 leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Product Detail Client (with options and add to cart) */}
              <ProductDetailClient product={product} options={productOptions} />
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <ProductTabs />

        {/* Product Description Section */}
        <div id="product-description" className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-8">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl md:text-2xl font-medium text-secondary">
              Thông tin chi tiết
            </h2>
            <div className="w-24 h-0.5 bg-primary mt-2"></div>
          </div>
          <p className="text-gray-600 leading-relaxed">
            {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
          </p>
        </div>

        {/* Nutritional Info Section */}
        {nutritionalInfo && (
          <div id="product-nutrition" className="mb-8">
            <NutritionalInfo nutritionalInfo={nutritionalInfo} />
          </div>
        )}

        {/* Reviews Section */}
        <div id="reviews" className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-8">
          <ReviewSection productId={product.id} reviews={reviews} />
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <RelatedProducts products={relatedProducts} />
        </div>
      </div>

      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": product.image_url,
            "description": product.description,
            "offers": {
              "@type": "Offer",
              "url": `https://banhtamcodao.com/product/${product.slug}`,
              "priceCurrency": "VND",
              "price": product.discount_price ?? product.price,
              "availability": "https://schema.org/InStock"
            },
            "aggregateRating": totalReviews > 0 ? {
              "@type": "AggregateRating",
              "ratingValue": averageRating.toFixed(1),
              "reviewCount": totalReviews
            } : undefined
          })
        }}
      />
    </div>
  );
}