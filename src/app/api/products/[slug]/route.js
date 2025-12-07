/**
 * Product by slug API route handler
 * @file src/app/api/products/[slug]/route.js
 */
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

/**
 * GET product by slug
 * @param {Request} request - Request object
 * @param {Object} params - Route parameters
 * @returns {Promise<NextResponse>} Response with product data
 */
export async function GET(request, { params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  try {
    /** Fetch product by slug */
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('slug', slug)
      .maybeSingle();

    if (productError) throw productError;

    if (!product) {
      return NextResponse.json({ success: false, message: 'Sản phẩm không tồn tại.' }, { status: 404 });
    }

    // Flatten category name
    const productData = {
      ...product,
      category_name: product.categories?.name,
      price: parseFloat(product.price),
      discount_price: product.discount_price ? parseFloat(product.discount_price) : null,
    };
    delete productData.categories;

    // Lấy các đánh giá đã được duyệt
    const { data: reviews, error: reviewsError } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', product.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (reviewsError) throw reviewsError;

    // Lấy các sản phẩm liên quan (cùng danh mục)
    const { data: relatedProductsRaw, error: relatedError } = await supabase
      .from('products')
      .select(`
        id, name, slug, price, discount_price, image_url, 
        categories(name)
      `)
      .eq('category_id', product.category_id)
      .neq('id', product.id)
      .eq('status', 'active')
      .limit(8);

    if (relatedError) throw relatedError;

    const relatedProducts = relatedProductsRaw.map(p => ({
      ...p,
      category_name: p.categories?.name,
      price: parseFloat(p.price),
      discount_price: p.discount_price ? parseFloat(p.discount_price) : null,
    })).map(p => {
      delete p.categories;
      return p;
    });

    return NextResponse.json({
      success: true,
      product: productData,
      reviews: reviews || [],
      relatedProducts: relatedProducts || []
    });

  } catch (error) {
    console.error(`API Error - /api/products/${slug}:`, error);
    return NextResponse.json({ success: false, message: 'Lỗi Server', error: error.message }, { status: 500 });
  }
}