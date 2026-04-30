import { NextResponse } from 'next/server';
import { validateCartItems } from '@/utils/cartValidation';

export async function POST(request) {
  try {
    const { items_list } = await request.json();

    const result = await validateCartItems(items_list);

    if (!result.success) {
      return NextResponse.json(result, { status: 200 }); // Return 200 with success: false for client handling
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
