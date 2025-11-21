#!/bin/bash

echo "🔧 Đang sửa lỗi build..."

echo "📁 Xóa thư mục .next cũ..."
if [ -d ".next" ]; then
    rm -rf .next
    echo "✅ Đã xóa .next"
else
    echo "ℹ️  Không tìm thấy .next"
fi

echo "📁 Xóa node_modules/.cache nếu có..."
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "✅ Đã xóa cache"
fi

echo "🔨 Đang build lại..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build thành công!"
else
    echo "❌ Build thất bại!"
    exit 1
fi

echo "✅ Hoàn tất!"

