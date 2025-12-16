/**
 * Products API route handler
 * @file src/app/api/products/route.js
 */
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import { slugify } from '@/lib/slugify';

/**
 * Hàm GET để lấy tất cả sản phẩm đang hoạt động
 * @param {Request} request - Request object
 * @returns {Promise<NextResponse>} Response with products
 */
export async function GET(request) {
  try {
    // Kiểm tra Supabase client
    if (!supabase) {
      console.error('Supabase client chưa được khởi tạo. Vui lòng kiểm tra biến môi trường.');
      return NextResponse.json({ 
        success: false, 
        message: 'Database chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
        products: [] 
      }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'name';
    const order = searchParams.get('order') || 'asc';
    const priceRange = searchParams.get('priceRange');

    /** Xây dựng query Supabase
     * select('*, categories(name)') để lấy tên danh mục
     */
    let query = supabase
      .from('products')
      .select('*, categories(name)')
      .eq('status', 'active');

    /** Thêm điều kiện tìm kiếm */
    if (search) {
      /** Supabase không hỗ trợ OR trực tiếp giữa các bảng khác nhau dễ dàng như SQL thuần
       * Nhưng với text search đơn giản, ta có thể dùng .or()
       * Lưu ý: cú pháp .or('name.ilike.%term%,description.ilike.%term%')
       */
      const term = `%${search}%`;
      query = query.or(`name.ilike.${term},description.ilike.${term}`);
    }

    // Thêm điều kiện lọc theo danh mục
    if (category) {
      query = query.eq('category_id', category);
    }

    // Thêm điều kiện lọc theo khoảng giá
    if (priceRange) {
      if (priceRange === '0-50000') {
        query = query.lte('price', 50000);
      } else if (priceRange === '50000-100000') {
        query = query.gt('price', 50000).lte('price', 100000);
      } else if (priceRange === '100000-200000') {
        query = query.gt('price', 100000).lte('price', 200000);
      } else if (priceRange === '200000+') {
        query = query.gt('price', 200000);
      }
    }

    // Thêm sắp xếp
    const validSortFields = ['name', 'price', 'created_at'];
    const validOrders = ['asc', 'desc'];
    const sortField = validSortFields.includes(sort) ? sort : 'name';
    const isAscending = (validOrders.includes(order) ? order : 'asc') === 'asc';

    query = query.order(sortField, { ascending: isAscending });

    const { data: rows, error } = await query;

    if (error) {
      throw error;
    }

    const products = rows.map(item => ({
      id: item.id,
      name: item.name || 'Sản phẩm',
      slug: item.slug || 'san-pham',
      price: parseFloat(item.price) || 0,
      discount_price: item.discount_price ? parseFloat(item.discount_price) : null,
      category_name: item.categories?.name || 'Danh mục', // Lấy từ join
      image_url: item.image_url || 'https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png',
      is_special: !!item.is_special,
      description: item.description || 'Mô tả sản phẩm',
    }));

    return NextResponse.json({ success: true, products }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

  } catch (error) {
    console.error('API Error - /api/products:', error);
    return NextResponse.json({ success: false, message: error.message, products: [] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const productData = await request.json();
    let { name, slug, description, image_url, price, discount_price, category_id, status, is_special } = productData;

    if (!name || !price || !category_id) {
      return NextResponse.json({ success: false, message: 'Tên, giá và danh mục là bắt buộc.' }, { status: 400 });
    }

    // --- 2. TỰ ĐỘNG TẠO SLUG NẾU BỊ TRỐNG ---
    const finalSlug = slug ? slugify(slug) : slugify(name);

    price = parseFloat(price);
    discount_price = discount_price ? parseFloat(discount_price) : null;
    category_id = parseInt(category_id, 10);
    is_special = is_special ? true : false; // Supabase boolean
    status = status || 'active';

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          slug: finalSlug,
          description,
          image_url,
          price,
          discount_price,
          category_id,
          status,
          is_special
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Thêm sản phẩm thành công!', productId: data[0].id });

  } catch (error) {
    console.error('API Error - POST /api/products:', error);
    return NextResponse.json({ success: false, message: 'Lỗi Server', error: error.message }, { status: 500 });
  }
}