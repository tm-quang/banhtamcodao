import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request) {
  try {
    const { items_list } = await request.json();

    if (!items_list || items_list.length === 0) {
      return NextResponse.json({ success: false, message: 'Giỏ hàng trống.' }, { status: 400 });
    }

    // Extract non-free product IDs
    const productIds = items_list.filter(item => !item.is_free).map(item => item.id);

    if (productIds.length > 0) {
      // Fetch current status and prices from database
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, price, discount_price, status')
        .in('id', productIds);

      if (error) throw error;

      const productMap = products.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});

      // Validate items
      for (const item of items_list) {
        if (item.is_free) continue; // Skip free items validation for now, or could check combo

        const dbProduct = productMap[item.id];

        // 1. Check if product exists and is active
        if (!dbProduct || dbProduct.status !== 'active') {
          return NextResponse.json({
            success: false,
            message: `Sản phẩm "${item.name}" đã ngừng bán hoặc không tồn tại.`,
            errorItem: item
          });
        }

        // 2. Check if price matches
        const clientPrice = item.discount_price ?? item.price ?? item.finalPrice ?? 0;
        const dbPrice = dbProduct.discount_price ?? dbProduct.price ?? 0;

        if (clientPrice !== dbPrice) {
          return NextResponse.json({
            success: false,
            message: `Giá của sản phẩm "${item.name}" đã thay đổi. Vui lòng tải lại giỏ hàng.`,
            errorItem: item,
            dbPrice: dbPrice
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Giỏ hàng hợp lệ.' });
  } catch (error) {
    console.error('API Error - POST /api/cart/validate:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server khi kiểm tra giỏ hàng.' },
      { status: 500 }
    );
  }
}
