# Hướng dẫn Quản lý Tài khoản Admin

## 📋 Tổng quan

Có 2 cách để tạo hoặc cấp quyền admin:
1. **Tạo tài khoản admin mới** - Tạo user mới với role admin
2. **Gán quyền admin cho user đã có** - Nâng cấp user thường thành admin

## 🔧 Cách 1: Tạo Tài khoản Admin Mới

### Sử dụng Script (Khuyến nghị)

```bash
node scripts/create-admin-user.js <email> <password> [fullName]
```

**Ví dụ:**
```bash
node scripts/create-admin-user.js admin@example.com "SecurePassword123" "Admin User"
```

**Script sẽ:**
1. ✅ Tạo user trong Supabase Auth
2. ✅ Tạo record trong `customers` table với `role = 'admin'`
3. ✅ Link `account_id` với UUID từ Supabase Auth

**Lưu ý:**
- Email phải chưa tồn tại trong Supabase Auth
- Password nên mạnh (ít nhất 8 ký tự, có chữ hoa, số, ký tự đặc biệt)
- Full name là tùy chọn

### Sử dụng API (Nếu đã có admin)

Nếu bạn đã có 1 admin, có thể dùng API:

```bash
POST /api/admin/set-role
Headers: {
  "Content-Type": "application/json",
  "Cookie": "sb-access-token=..."
}
Body: {
  "email": "newadmin@example.com",
  "role": "admin"
}
```

**Lưu ý:** Cần đăng nhập với tài khoản admin trước.

## 🔧 Cách 2: Gán Quyền Admin cho User Đã Có

### Sử dụng Script (Khuyến nghị)

```bash
node scripts/set-admin-role.js <email>
```

**Ví dụ:**
```bash
node scripts/set-admin-role.js user@example.com
```

**Script sẽ:**
1. ✅ Tìm user trong Supabase Auth bằng email
2. ✅ Cập nhật `role = 'admin'` trong `customers` table
3. ✅ Nếu chưa có customer record, tạo mới với role admin

**Lưu ý:**
- User phải đã tồn tại trong Supabase Auth
- User phải đã có customer record (hoặc script sẽ tạo)

### Sử dụng API

```bash
POST /api/admin/set-role
Headers: {
  "Content-Type": "application/json",
  "Cookie": "sb-access-token=..."
}
Body: {
  "email": "user@example.com",
  "role": "admin"
}
```

## 📊 Kiểm tra Quyền Admin

### Kiểm tra bằng Script

```bash
node scripts/check-user.js <email>
```

Script sẽ hiển thị:
- ✅ Thông tin trong Supabase Auth
- ✅ Thông tin trong customers table
- ✅ Role hiện tại (admin/customer)

### Kiểm tra bằng API

```bash
GET /api/auth/me
Headers: {
  "Cookie": "sb-access-token=..."
}
```

Response sẽ có:
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "...",
    "role": "admin",  // hoặc "customer"
    ...
  }
}
```

## 🔄 Thay đổi Role

### Từ Admin → Customer

```bash
POST /api/admin/set-role
Body: {
  "email": "admin@example.com",
  "role": "customer"
}
```

### Từ Customer → Admin

```bash
node scripts/set-admin-role.js user@example.com
```

hoặc

```bash
POST /api/admin/set-role
Body: {
  "email": "user@example.com",
  "role": "admin"
}
```

## 🛡️ Bảo mật

### Best Practices

1. **Tạo admin đầu tiên:**
   - Dùng script `create-admin-user.js`
   - Lưu thông tin đăng nhập an toàn
   - Đổi password sau lần đăng nhập đầu

2. **Quản lý admin:**
   - Chỉ có admin mới có thể set role
   - Log tất cả thay đổi role
   - Kiểm tra định kỳ danh sách admin

3. **Password:**
   - Sử dụng password mạnh
   - Không share password
   - Đổi password định kỳ

## 📝 Ví dụ Workflow

### Tạo Admin đầu tiên

```bash
# 1. Tạo admin đầu tiên
node scripts/create-admin-user.js admin@example.com "StrongPass123!" "Admin User"

# 2. Đăng nhập với admin
# 3. Tạo thêm admin khác qua API hoặc script
```

### Nâng cấp User thành Admin

```bash
# 1. User đã đăng ký và có tài khoản
# 2. Admin chạy script để nâng cấp
node scripts/set-admin-role.js user@example.com

# Hoặc dùng API (nếu đã đăng nhập admin)
curl -X POST http://localhost:3000/api/admin/set-role \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"email": "user@example.com", "role": "admin"}'
```

## ⚠️ Troubleshooting

### Lỗi: "Email đã tồn tại"
- User đã có trong Supabase Auth
- Dùng `set-admin-role.js` thay vì `create-admin-user.js`

### Lỗi: "Không tìm thấy user"
- User chưa được tạo trong Supabase Auth
- Cần đăng ký trước hoặc dùng `create-admin-user.js`

### Lỗi: "Forbidden - Admin only"
- Bạn không có quyền admin
- Cần đăng nhập với tài khoản admin

## 📚 Tài liệu liên quan

- `docs/ACCOUNT_MANAGEMENT_ANALYSIS.md` - Phân tích hệ thống
- `docs/IMPLEMENTATION_GUIDE.md` - Hướng dẫn triển khai
- `scripts/create-admin-user.js` - Script tạo admin
- `scripts/set-admin-role.js` - Script set role
- `scripts/check-user.js` - Script kiểm tra user

