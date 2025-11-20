// src/app/api/products/[slug]/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  try {
    const [productRows] = await pool.execute(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ?',
      [slug]
    );

    if (productRows.length === 0) {
      return NextResponse.json({ success: false, message: 'Sản phẩm không tồn tại.' }, { status: 404 });
    }
    const product = productRows[0];

    // Lấy các đánh giá đã được duyệt
    const [reviews] = await pool.execute(
        'SELECT * FROM product_reviews WHERE product_id = ? AND status = ? ORDER BY created_at DESC',
        [product.id, 'approved']
    );

    // --- SỬA LỖI TRUY VẤN TẠI ĐÂY ---
    // Lấy các sản phẩm liên quan (cùng danh mục)
    const [relatedProducts] = await pool.execute(
        `SELECT 
            p.id, p.name, p.slug, p.price, p.discount_price, p.image_url, 
            c.name as category_name 
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.category_id = ? AND p.id != ? AND p.status = ? 
         LIMIT 8`,
        [product.category_id, product.id, 'active']
    );

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        price: parseFloat(product.price),
        discount_price: product.discount_price ? parseFloat(product.discount_price) : null,
      },
      reviews,
      relatedProducts
    });

  } catch (error) {
    console.error(`API Error - /api/products/${slug}:`, error);
    return NextResponse.json({ success: false, message: 'Lỗi Server', error: error.message }, { status: 500 });
  }
}