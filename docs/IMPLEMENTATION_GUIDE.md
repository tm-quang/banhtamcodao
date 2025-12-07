# Hướng dẫn Triển khai Hệ thống Quản lý Tài khoản

## 📋 Tổng quan

Hệ thống đã được thiết kế lại để:
- Sử dụng Supabase Auth cho authentication (email, password, UUID)
- Lưu thông tin profile trong bảng `customers` với `account_id = UUID`
- Quản lý role (admin/customer) trong `customers.role`

## 🔧 Các bước Triển khai

### Bước 1: Migration Database

**QUAN TRỌNG**: Backup database trước khi chạy migration!

1. Mở Supabase SQL Editor
2. Chạy file `Tool/migrate_account_id_to_uuid.sql`
3. Kiểm tra kết quả:
   ```sql
   -- Kiểm tra schema
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'customers' AND column_name = 'account_id';
   -- Kết quả: account_id | uuid
   ```

### Bước 2: Cập nhật Code (Đã hoàn thành ✅)

Các file đã được cập nhật:
- ✅ `src/app/api/auth/register/route.js` - Đăng ký với role mặc định 'customer'
- ✅ `src/app/api/auth/login/route.js` - Lấy role từ customers table
- ✅ `src/app/api/auth/me/route.js` - Trả về role từ customers
- ✅ `src/app/api/admin/set-role/route.js` - Cập nhật role trong customers
- ✅ `src/app/api/admin/customers/route.js` - Lấy role từ customers

### Bước 3: Tạo Admin User

Sau khi migration, tạo admin user đầu tiên:

```bash
node scripts/create-admin-user.js admin@example.com "SecurePassword123" "Admin User"
```

**Lưu ý**: Script này cần được cập nhật để:
1. Tạo user trong Supabase Auth
2. Tạo record trong customers với `role = 'admin'`

### Bước 4: Kiểm tra

1. **Đăng ký user mới**:
   - Vào `/register`
   - Đăng ký với email mới
   - Kiểm tra trong database: `customers.role = 'customer'`

2. **Đăng nhập**:
   - Đăng nhập với email/password
   - Kiểm tra response có `role: 'customer'`

3. **Set role admin** (nếu là admin):
   ```bash
   POST /api/admin/set-role
   {
     "email": "user@example.com",
     "role": "admin"
   }
   ```

## 📊 Cấu trúc Database

### Bảng `customers`
```sql
CREATE TABLE customers (
  id BIGINT PRIMARY KEY,
  account_id UUID NOT NULL UNIQUE,  -- Link với Supabase Auth user.id
  full_name TEXT NOT NULL,
  phone_number TEXT UNIQUE,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  shipping_address TEXT,
  city TEXT,
  district TEXT,
  reward_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Supabase Auth
- Quản lý: email, password, user.id (UUID)
- User metadata: full_name, phone_number, username

## 🔒 Bảo mật

### Đã implement:
- ✅ Password hashing (Supabase tự động)
- ✅ Session management (Supabase)
- ✅ Email verification (có thể bật trong Supabase Dashboard)

### Nên thêm:
- ⚠️ Row Level Security (RLS) policies
- ⚠️ Rate limiting
- ⚠️ Input validation

### RLS Policy mẫu (nên thêm):

```sql
-- Cho phép user chỉ xem/chỉnh sửa profile của chính mình
CREATE POLICY "Users can view own profile"
ON customers FOR SELECT
USING (account_id = auth.uid());

CREATE POLICY "Users can update own profile"
ON customers FOR UPDATE
USING (account_id = auth.uid());

-- Admin có thể xem tất cả
CREATE POLICY "Admins can view all customers"
ON customers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM customers
    WHERE account_id = auth.uid() AND role = 'admin'
  )
);
```

## 🐛 Troubleshooting

### Lỗi: "invalid input syntax for type bigint"
- **Nguyên nhân**: `account_id` vẫn là BIGINT
- **Giải pháp**: Chạy migration SQL

### Lỗi: "column customers.role does not exist"
- **Nguyên nhân**: Migration chưa chạy hoặc thiếu bước
- **Giải pháp**: Kiểm tra và chạy lại migration

### User không đăng nhập được
- **Kiểm tra**: User có trong Supabase Auth không?
  ```bash
  node scripts/check-user.js user@example.com
  ```
- **Nếu chưa có**: Chạy migrate-user script

## 📝 Notes

1. **Bảng `accounts`**: Không còn được sử dụng, có thể xóa sau khi đảm bảo không còn dependency

2. **Username**: Hiện lưu trong `user_metadata` của Supabase Auth, có thể query từ đó

3. **Backward compatibility**: Nếu có dữ liệu cũ trong `accounts` table, cần migrate thủ công

## ✅ Checklist

- [ ] Backup database
- [ ] Chạy migration SQL
- [ ] Kiểm tra schema
- [ ] Tạo admin user đầu tiên
- [ ] Test đăng ký user mới
- [ ] Test đăng nhập
- [ ] Test set role (admin)
- [ ] Thêm RLS policies (optional nhưng khuyến nghị)
- [ ] Update scripts nếu cần

