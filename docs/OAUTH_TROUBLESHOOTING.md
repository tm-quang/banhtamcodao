# Troubleshooting: OAuth không tạo Customer Record

## 🔍 Vấn đề

Đã tạo được tài khoản auth trong Supabase nhưng không tạo được record trong bảng `customers`.

## ✅ Các bước Kiểm tra và Sửa lỗi

### Bước 1: Kiểm tra Schema của bảng `customers`

1. Vào Supabase Dashboard > Table Editor > `customers`
2. Kiểm tra xem có các cột sau không:
   - `account_id` (kiểu UUID)
   - `role` (kiểu TEXT)

**Nếu thiếu các cột này**, cần chạy migration SQL:

```sql
-- Thêm cột account_id nếu chưa có
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS account_id UUID;

-- Thêm cột role nếu chưa có
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- Tạo index cho account_id
CREATE INDEX IF NOT EXISTS idx_customers_account_id ON customers(account_id);

-- Tạo unique constraint cho account_id
ALTER TABLE customers 
ADD CONSTRAINT customers_account_id_unique UNIQUE (account_id);
```

### Bước 2: Kiểm tra Logs

1. Mở Browser Console (F12)
2. Thử đăng nhập lại bằng Google
3. Xem logs trong Console để tìm lỗi

Các lỗi thường gặp:
- `column "account_id" does not exist` → Cần chạy migration
- `column "role" does not exist` → Cần chạy migration
- `invalid input syntax for type uuid` → `account_id` vẫn là BIGINT, cần migration
- `permission denied` → RLS policy chặn insert

### Bước 3: Kiểm tra RLS Policies

1. Vào Supabase Dashboard > Authentication > Policies
2. Tìm table `customers`
3. Kiểm tra xem có policy nào chặn INSERT không

**Nếu có RLS enabled và chặn INSERT**, có 2 cách:

**Cách 1: Tắt RLS tạm thời (chỉ cho development)**
```sql
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
```

**Cách 2: Thêm policy cho phép insert (khuyến nghị)**
```sql
-- Cho phép insert customer record khi có session
CREATE POLICY "Allow insert for authenticated users"
ON customers FOR INSERT
TO authenticated
WITH CHECK (true);
```

### Bước 4: Kiểm tra Server Logs

1. Xem logs trong terminal nơi chạy `npm run dev`
2. Tìm các log bắt đầu bằng:
   - `Creating customer record:`
   - `Error creating customer record:`

### Bước 5: Test lại

1. Đăng xuất (nếu đang đăng nhập)
2. Xóa cookies
3. Thử đăng nhập lại bằng Google
4. Kiểm tra bảng `customers` trong Supabase Dashboard

## 🔧 Script Kiểm tra Schema

Chạy SQL sau trong Supabase SQL Editor để kiểm tra schema:

```sql
-- Kiểm tra schema của bảng customers
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;
```

Kết quả mong đợi phải có:
- `account_id` với `data_type = 'uuid'`
- `role` với `data_type = 'text'`

## 🐛 Các Lỗi Thường Gặp

### Lỗi: "column customers.account_id does not exist"
**Nguyên nhân:** Schema chưa được migration  
**Giải pháp:** Chạy migration SQL ở Bước 1

### Lỗi: "invalid input syntax for type uuid"
**Nguyên nhân:** `account_id` vẫn là BIGINT thay vì UUID  
**Giải pháp:** 
```sql
-- Xóa cột cũ và tạo lại
ALTER TABLE customers DROP COLUMN IF EXISTS account_id;
ALTER TABLE customers ADD COLUMN account_id UUID;
```

### Lỗi: "permission denied for table customers"
**Nguyên nhân:** RLS policy chặn insert  
**Giải pháp:** Thêm policy như ở Bước 3

### Lỗi: "duplicate key value violates unique constraint"
**Nguyên nhân:** Đã có customer record với `account_id` này  
**Giải pháp:** Kiểm tra xem user đã có customer record chưa:
```sql
SELECT * FROM customers WHERE account_id = '<user-id-from-auth>';
```

## 📝 Tạo Customer Record Thủ công (Nếu cần)

Nếu vẫn không tự động tạo được, có thể tạo thủ công:

1. Lấy User ID từ Supabase Auth:
   - Vào Authentication > Users
   - Tìm user và copy User UID

2. Tạo customer record:
```sql
INSERT INTO customers (account_id, full_name, email, role)
VALUES (
    '<user-uid-from-auth>',
    'Tên người dùng',
    'email@example.com',
    'customer'
);
```

## ✅ Sau khi Fix

1. Test lại đăng nhập bằng Google
2. Kiểm tra bảng `customers` có record mới không
3. Kiểm tra logs không còn lỗi
