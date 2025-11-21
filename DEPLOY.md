# Hướng dẫn Build và Deploy lên GitHub

## Cách 1: Sử dụng Script tự động (Khuyến nghị)

### Windows:
```bash
build-and-push.bat
```

### Linux/Mac:
```bash
chmod +x build-and-push.sh
./build-and-push.sh
```

Script sẽ tự động:
1. Commit các thay đổi (nếu có)
2. Build project
3. Push code lên GitHub
4. GitHub Actions sẽ tự động build và deploy

## Cách 2: Build và Push thủ công

### 1. Build project:
```bash
npm run build
```

### 2. Kiểm tra build:
```bash
npm run start
```

### 3. Commit và push:
```bash
git add .
git commit -m "Build and deploy"
git push origin main
```

## GitHub Actions

Sau khi push code lên GitHub, GitHub Actions sẽ tự động:
- ✅ Build project
- ✅ Chạy linter
- ✅ Upload build artifacts
- ✅ Deploy (nếu đã cấu hình Vercel)

## Cấu hình Vercel (Tùy chọn)

Nếu muốn deploy tự động lên Vercel:

1. Tạo Vercel project
2. Lấy các thông tin:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

3. Thêm vào GitHub Secrets:
   - Vào repository → Settings → Secrets and variables → Actions
   - Thêm 3 secrets trên

4. Workflow sẽ tự động deploy khi push code

## Lưu ý

- Đảm bảo đã cấu hình `.env` cho production
- Kiểm tra `next.config.mjs` trước khi build
- Build artifacts sẽ được lưu trong 7 ngày

