// src/app/api/admin/products/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { slugify } from '@/lib/slugify'; // <-- 1. Import hàm slugify

// Hàm GET để lấy tất cả sản phẩm đang hoạt động
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'name';
    const order = searchParams.get('order') || 'asc';

    let query = `
        SELECT 
            p.id, p.name, p.slug, p.price, p.discount_price, c.name AS category_name, 
            p.image_url, p.is_special, p.status, p.description
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'active'
    `;
    
    const params = [];

    // Thêm điều kiện tìm kiếm
    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Thêm điều kiện lọc theo danh mục
    if (category) {
      query += ` AND c.id = ?`;
      params.push(category);
    }

    // Thêm điều kiện lọc theo khoảng giá
    if (searchParams.get('priceRange')) {
      const priceRange = searchParams.get('priceRange');
      if (priceRange === '0-50000') {
        query += ` AND p.price <= 50000`;
      } else if (priceRange === '50000-100000') {
        query += ` AND p.price > 50000 AND p.price <= 100000`;
      } else if (priceRange === '100000-200000') {
        query += ` AND p.price > 100000 AND p.price <= 200000`;
      } else if (priceRange === '200000+') {
        query += ` AND p.price > 200000`;
      }
    }

    // Thêm sắp xếp
    const validSortFields = ['name', 'price', 'created_at'];
    const validOrders = ['asc', 'desc'];
    const sortField = validSortFields.includes(sort) ? sort : 'name';
    const sortOrder = validOrders.includes(order) ? order : 'asc';
    
    query += ` ORDER BY ${sortField} ${sortOrder.toUpperCase()}`;

    const [rows] = await pool.execute(query, params);

    const products = rows.map(item => ({
        id: item.id,
        name: item.name || 'Sản phẩm',
        slug: item.slug || 'san-pham',
        price: parseFloat(item.price) || 0,
        discount_price: item.discount_price ? parseFloat(item.discount_price) : null,
        category_name: item.category_name || 'Danh mục',
        image_url: item.image_url || 'https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png',
        is_special: !!item.is_special,
        description: item.description || 'Mô tả sản phẩm',
    }));

    // Fallback mock data when database returns empty (for demo)
    if (!products || products.length === 0) {
      const mockProducts = [
        {
          id: 1,
          name: 'Bánh Tằm Bì Xíu Mại',
          slug: 'banh-tam-bi-xiu-mai',
          price: 45000,
          discount_price: 40000,
          category_name: 'Bánh Tằm',
          image_url: 'https://res.cloudinary.com/dgoe8cra8/image/upload/v1759424737/mp8eyqrjdubbld6nuzzf.jpg',
          is_special: true,
          description: 'Bánh tằm thơm ngon với bì xíu mại đậm đà'
        },
        {
          id: 2,
          name: 'Bánh Tằm Thịt Nướng',
          slug: 'banh-tam-thit-nuong',
          price: 50000,
          discount_price: null,
          category_name: 'Bánh Tằm',
          image_url: 'https://res.cloudinary.com/dgoe8cra8/image/upload/v1759424774/d7zwybqybiabifeifkpw.jpg',
          is_special: false,
          description: 'Bánh tằm với thịt nướng thơm lừng'
        },
        {
          id: 3,
          name: 'Trà Sữa Trân Châu',
          slug: 'tra-sua-tran-chau',
          price: 35000,
          discount_price: 30000,
          category_name: 'Thức Uống',
          image_url: 'https://res.cloudinary.com/dgoe8cra8/image/upload/v1759424775/poy7n7argfnxkv1g383m.jpg',
          is_special: false,
          description: 'Trà sữa thơm ngon với trân châu dai giòn'
        }
      ];
      return NextResponse.json({ success: true, products: mockProducts });
    }

    return NextResponse.json({ success: true, products }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

  } catch (error) {
    console.error('API Error - /api/products:', error);
    // Trả về dữ liệu mẫu nếu database lỗi
    const mockProducts = [
      {
        id: 1,
        name: 'Bánh Tằm Bì Xíu Mại',
        slug: 'banh-tam-bi-xiu-mai',
        price: 45000,
        discount_price: 40000,
        category_name: 'Bánh Tằm',
        image_url: 'https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png',
        is_special: true,
        description: 'Bánh tằm thơm ngon với bì xíu mại đậm đà'
      },
      {
        id: 2,
        name: 'Bánh Tằm Thịt Nướng',
        slug: 'banh-tam-thit-nuong',
        price: 50000,
        discount_price: null,
        category_name: 'Bánh Tằm',
        image_url: 'https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png',
        is_special: false,
        description: 'Bánh tằm với thịt nướng thơm lừng'
      },
      {
        id: 3,
        name: 'Trà Sữa Trân Châu',
        slug: 'tra-sua-tran-chau',
        price: 35000,
        discount_price: 30000,
        category_name: 'Thức Uống',
        image_url: 'https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png',
        is_special: false,
        description: 'Trà sữa thơm ngon với trân châu dai giòn'
      },
      {
        id: 4,
        name: 'Chè Đậu Đỏ',
        slug: 'che-dau-do',
        price: 25000,
        discount_price: null,
        category_name: 'Tráng Miệng',
        image_url: 'https://res.cloudinary.com/dz2rvqcve/image/upload/v1759398964/banner-codao_wrpcll.png',
        is_special: false,
        description: 'Chè đậu đỏ ngọt thanh, mát lạnh'
      }
    ];
    
    // Lọc theo category nếu có
    let filteredProducts = mockProducts;
    if (category) {
      const categoryName = category === '1' ? 'Bánh Tằm' : 
                          category === '2' ? 'Thức Uống' :
                          category === '3' ? 'Tráng Miệng' : 'Món Khác';
      filteredProducts = mockProducts.filter(p => p.category_name === categoryName);
    }
    
    return NextResponse.json({ success: true, products: filteredProducts });
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
        is_special = is_special ? 1 : 0;
        status = status || 'active';

        const [result] = await pool.execute(
            `INSERT INTO products (name, slug, description, image_url, price, discount_price, category_id, status, is_special) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, finalSlug, description, image_url, price, discount_price, category_id, status, is_special]
        );

        return NextResponse.json({ success: true, message: 'Thêm sản phẩm thành công!', productId: result.insertId });

    } catch (error) {
        console.error('API Error - POST /api/admin/products:', error);
        return NextResponse.json({ success: false, message: 'Lỗi Server', error: error.message }, { status: 500 });
    }
}