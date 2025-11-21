#!/bin/bash

# Script để build và push code lên GitHub

echo "🚀 Bắt đầu build và deploy..."

# Kiểm tra xem có thay đổi chưa commit không
if [[ -n $(git status -s) ]]; then
  echo "📝 Đang commit các thay đổi..."
  git add .
  read -p "Nhập commit message (hoặc Enter để dùng mặc định): " commit_msg
  if [ -z "$commit_msg" ]; then
    commit_msg="Update: Build and deploy"
  fi
  git commit -m "$commit_msg"
fi

# Build project
echo "🔨 Đang build project..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build thành công!"
  
  # Push lên GitHub
  echo "📤 Đang push lên GitHub..."
  git push origin main || git push origin master
  
  if [ $? -eq 0 ]; then
    echo "✅ Đã push thành công lên GitHub!"
    echo "🌐 GitHub Actions sẽ tự động build và deploy"
  else
    echo "❌ Lỗi khi push lên GitHub"
    exit 1
  fi
else
  echo "❌ Build thất bại!"
  exit 1
fi

