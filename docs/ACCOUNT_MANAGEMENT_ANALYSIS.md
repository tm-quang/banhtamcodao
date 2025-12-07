# Phân tích và Thiết kế Hệ thống Quản lý Tài khoản

## 📋 Yêu cầu

### 1. Phân quyền
- **Admin**: Tài khoản quản trị website, có quyền quản lý toàn bộ hệ thống
- **User (Customer)**: Tài khoản thường, không phân quyền, chỉ có quyền xem và mua hàng

### 2. Cấu trúc dữ liệu
- **Supabase Authentication**: Quản lý xác thực (email, password, userID - UUID)
- **Bảng `customers`**: Lưu thông tin chi tiết khách hàng
  - Tên, số điện thoại, địa chỉ
  - Điểm tích lũy (reward_points)
  - Đơn hàng (liên kết qua bảng orders)
  - account_id: UUID từ Supabase Auth

## ✅ Phân tích Logic và Khả thi

### Ưu điểm
1. **Bảo mật tốt**: 
   - Supabase Auth quản lý authentication (password hashing, session management)
   - Tách biệt authentication và profile data
   - Row Level Security (RLS) có thể áp dụng

2. **Scalable**:
   - UUID không bị conflict khi scale
   - Dễ dàng migrate hoặc sync data

3. **Đơn giản**:
   - Không cần quản lý password hash thủ công
   - Supabase xử lý email verification, password reset

### Vấn đề hiện tại
1. **Mâu thuẫn kiểu dữ liệu**:
   - `customers.account_id` hiện là BIGINT
   - Supabase Auth user.id là UUID
   - Cần migration để đổi sang UUID

2. **Bảng `accounts` không cần thiết**:
   - Nếu dùng Supabase Auth, không cần bảng accounts riêng
   - Role có thể lưu trong user_metadata hoặc customers table

## 🔧 Giải pháp Đề xuất

### Option 1: Đơn giản nhất (Khuyến nghị)
- Đổi `customers.account_id` từ BIGINT → UUID (text)
- Bỏ dependency vào `accounts` table
- Lưu role trong `customers.role` hoặc `user_metadata.role`
- Ưu điểm: Đơn giản, dễ maintain
- Nhược điểm: Mất dữ liệu cũ trong accounts (nếu có)

### Option 2: Giữ accounts table
- Thêm cột `auth_user_id UUID` vào `accounts` table
- Giữ `accounts.id` là BIGINT (cho backward compatibility)
- Link qua `auth_user_id`
- Ưu điểm: Giữ được dữ liệu cũ
- Nhược điểm: Phức tạp hơn, có thể gây confusion

## 🎯 Khuyến nghị: Option 1

### Schema mới:
```sql
-- customers table
account_id UUID NOT NULL UNIQUE  -- Link với Supabase Auth user.id
role TEXT DEFAULT 'customer'     -- 'admin' hoặc 'customer'
```

### Flow đăng ký:
1. User nhập thông tin → Validate
2. Tạo user trong Supabase Auth → Nhận UUID
3. Tạo record trong `customers` với `account_id = UUID`
4. Set role mặc định = 'customer'

### Flow đăng nhập:
1. User nhập email/password
2. Supabase Auth xác thực → Trả về session với user.id (UUID)
3. Query `customers` table với `account_id = user.id`
4. Trả về thông tin customer + role

## 🔒 Bảo mật

### Đã có:
- ✅ Password hashing tự động (Supabase)
- ✅ Session management (Supabase)
- ✅ Email verification (có thể bật)
- ✅ HTTPS (production)

### Nên thêm:
- ✅ Row Level Security (RLS) policies
- ✅ Rate limiting cho đăng ký/đăng nhập
- ✅ Input validation và sanitization
- ✅ Audit log cho admin actions

## 📊 So sánh với Yêu cầu

| Yêu cầu | Giải pháp | Status |
|---------|-----------|--------|
| Role Admin/User | Lưu trong `customers.role` | ✅ |
| Authentication | Supabase Auth | ✅ |
| Profile data | Bảng `customers` | ✅ |
| Bảo mật | Supabase Auth + RLS | ✅ |
| Scalable | UUID, không conflict | ✅ |

## ✅ Kết luận

**Logic khả thi và tối ưu** với các điều kiện:
1. Migration `account_id` sang UUID
2. Bỏ dependency vào `accounts` table
3. Implement RLS policies
4. Thêm validation và error handling

