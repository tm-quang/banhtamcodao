// Script để kiểm tra xem file .env.local có đủ các biến môi trường cần thiết không
const fs = require('fs');
const path = require('path');

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET'
];

const optionalVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'NEXT_PUBLIC_API_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'
];

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ File .env.local không tồn tại!');
    console.log('📝 Hãy tạo file .env.local từ template:');
    console.log('   cp env.example .env.local');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  console.log('\n📋 Kiểm tra Environment Variables:\n');
  
  let allRequired = true;
  console.log('🔴 BẮT BUỘC:');
  requiredVars.forEach(varName => {
    const value = envVars[varName];
    if (value && value !== `your_${varName.toLowerCase()}` && !value.includes('your_')) {
      console.log(`  ✅ ${varName} = ${value.substring(0, 20)}...`);
    } else {
      console.log(`  ❌ ${varName} - THIẾU hoặc chưa được cấu hình`);
      allRequired = false;
    }
  });

  console.log('\n🟡 TÙY CHỌN (nhưng được sử dụng trong code):');
  optionalVars.forEach(varName => {
    const value = envVars[varName];
    if (value && value !== `your_${varName.toLowerCase()}` && !value.includes('your_')) {
      console.log(`  ✅ ${varName}`);
    } else {
      console.log(`  ⚠️  ${varName} - Chưa có (tùy chọn)`);
    }
  });

  console.log('\n' + '='.repeat(50));
  if (allRequired) {
    console.log('✅ Tất cả các biến BẮT BUỘC đã được cấu hình!');
  } else {
    console.log('❌ Thiếu một số biến BẮT BUỘC. Vui lòng cập nhật file .env.local');
  }
  console.log('='.repeat(50) + '\n');
}

checkEnvFile();

