# Hướng dẫn Deploy lên Vercel

## Vấn đề: Lỗi "Application error: a server-side exception has occurred"

Lỗi này thường xảy ra khi thiếu **biến môi trường (Environment Variables)** trên Vercel.

## Giải pháp: Cấu hình Biến Môi Trường trên Vercel

### Bước 1: Truy cập Vercel Dashboard
1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project của bạn (`banhtamcodao`)
3. Vào **Settings** → **Environment Variables**

### Bước 2: Thêm các biến môi trường BẮT BUỘC

Thêm các biến sau vào Vercel (với môi trường: **Production**, **Preview**, và **Development**):

#### 1. Supabase Configuration (BẮT BUỘC)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Cách lấy:**
- Vào [Supabase Dashboard](https://app.supabase.com)
- Chọn project của bạn
- Vào **Settings** → **API**
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

#### 2. JWT Secret (BẮT BUỘC)
```
JWT_SECRET=your-random-secret-key-here
```

**Tạo JWT Secret:**
- Chạy: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Hoặc sử dụng một chuỗi ngẫu nhiên dài (ít nhất 32 ký tự)

#### 3. API URL (Tùy chọn nhưng nên có)
```
NEXT_PUBLIC_API_URL=https://banhtamcodao.vercel.app
```

### Bước 3: Biến môi trường TÙY CHỌN (nếu sử dụng)

#### Cloudinary (nếu upload ảnh)
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

#### Database (nếu không dùng Supabase)
```
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
```

### Bước 4: Redeploy

Sau khi thêm tất cả biến môi trường:
1. Vào **Deployments** tab
2. Click vào 3 chấm (⋯) của deployment mới nhất
3. Chọn **Redeploy**
4. Hoặc push code mới lên GitHub để trigger auto-deploy

## Kiểm tra sau khi deploy

1. Mở website: `https://banhtamcodao.vercel.app`
2. Kiểm tra console (F12) xem có lỗi không
3. Kiểm tra Vercel Logs:
   - Vào **Deployments** → Click vào deployment
   - Xem tab **Logs** để kiểm tra lỗi chi tiết

## Lưu ý quan trọng

⚠️ **KHÔNG BAO GIỜ** commit file `.env.local` lên GitHub!
- File `.env.local` đã được thêm vào `.gitignore`
- Chỉ thêm biến môi trường trên Vercel Dashboard

## Troubleshooting

### Lỗi vẫn còn sau khi thêm biến môi trường?
1. **Kiểm tra tên biến:** Đảm bảo tên chính xác (phân biệt hoa/thường)
2. **Kiểm tra giá trị:** Đảm bảo không có khoảng trắng thừa
3. **Redeploy:** Sau khi thêm biến, phải redeploy
4. **Kiểm tra Logs:** Xem Vercel Logs để biết lỗi cụ thể

### Lỗi "Database chưa được cấu hình"
- Kiểm tra `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` đã được thêm chưa
- Đảm bảo giá trị đúng từ Supabase Dashboard

### Lỗi "Supabase admin client chưa được khởi tạo"
- Kiểm tra `SUPABASE_SERVICE_ROLE_KEY` đã được thêm chưa
- Chỉ cần cho các API routes admin

## Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề, kiểm tra:
- Vercel Logs để xem lỗi chi tiết
- Supabase Dashboard để đảm bảo project đang hoạt động
- GitHub repository để đảm bảo code đã được push đúng

