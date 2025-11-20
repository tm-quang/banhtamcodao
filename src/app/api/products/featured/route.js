    // src/app/api/products/featured/route.js
    import { NextResponse } from 'next/server';
    import pool from '@/lib/db';

    // Hàm GET để lấy các sản phẩm nổi bật
    export async function GET(request) {
      try {
        const [rows] = await pool.execute(
          `SELECT 
              p.id, p.name, p.slug, p.price, p.discount_price, c.name AS category_name, 
              p.image_url, p.is_special
          FROM products p 
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.status = 'active' AND p.is_special = 1
          LIMIT 8`
        );

        const products = rows.map(item => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            price: parseFloat(item.price),
            discount_price: item.discount_price ? parseFloat(item.discount_price) : null,
            category_name: item.category_name,
            image_url: item.image_url,
        }));

        return NextResponse.json({ success: true, products });

      } catch (error) {
        console.error('API Error - /api/products/featured:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
      }
    }
    
