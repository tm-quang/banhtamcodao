// src/app/api/products/featured/route.js
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

// Hàm GET để lấy các sản phẩm nổi bật
export async function GET(request) {
  try {
    const { data: rows, error } = await supabase
      .from('products')
      .select(`
          id, name, slug, price, discount_price, image_url, is_special,
          categories(name)
      `)
      .eq('status', 'active')
      .eq('is_special', true)
      .limit(8);

    if (error) throw error;

    const products = rows.map(item => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: parseFloat(item.price),
      discount_price: item.discount_price ? parseFloat(item.discount_price) : null,
      category_name: item.categories?.name,
      image_url: item.image_url,
    }));

    return NextResponse.json({ success: true, products });

  } catch (error) {
    console.error('API Error - /api/products/featured:', error);
    return NextResponse.json({ success: false, message: 'Lỗi Server' }, { status: 500 });
  }
}

