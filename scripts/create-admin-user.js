/**
 * Script để tạo tài khoản admin mới trong Supabase Auth
 * Usage: node scripts/create-admin-user.js <email> <password> <fullName>
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

/**
 * Load .env.local manually
 */
function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    process.env[key.trim()] = valueParts.join('=').trim();
                }
            }
        });
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Thiếu cấu hình Supabase trong .env.local');
    console.error('Cần: NEXT_PUBLIC_SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdminUser(email, password, fullName) {
    try {
        /**
         * Kiểm tra xem email đã tồn tại chưa
         */
        let existingUser = null;
        
        try {
            // Thử dùng getUserByEmail nếu có
            if (supabaseAdmin.auth.admin.getUserByEmail) {
                const result = await supabaseAdmin.auth.admin.getUserByEmail(email);
                if (result?.data?.user) {
                    existingUser = result.data;
                }
            } else {
                // Nếu không có, dùng listUsers và filter
                const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
                if (!listError && usersData?.users) {
                    const foundUser = usersData.users.find(u => u.email === email);
                    if (foundUser) {
                        existingUser = { user: foundUser };
                    }
                }
            }
        } catch (checkError) {
            console.warn(`⚠️ Không thể kiểm tra user hiện có: ${checkError.message}`);
        }
        
        if (existingUser?.user) {
            console.error(`❌ Email ${email} đã tồn tại trong Supabase Auth`);
            console.log('💡 Bạn có thể dùng script set-admin-role.js để gán role admin cho user này');
            process.exit(1);
        }

        /**
         * Tạo user trong Supabase Auth
         */
        console.log('📝 Đang tạo user trong Supabase Auth...');
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName || 'Admin User'
            }
        });

        if (authError) {
            throw authError;
        }

        const userId = authData.user.id;
        console.log(`✅ Đã tạo user trong Supabase Auth: ${email} (ID: ${userId})`);

        /**
         * Tạo record trong customers table với role admin
         * account_id là UUID từ Supabase Auth
         */
        console.log('📝 Đang tạo record trong customers table với role admin...');
        const { error: customerError } = await supabaseAdmin
            .from('customers')
            .insert([
                {
                    account_id: userId, // UUID từ Supabase Auth
                    full_name: fullName || 'Admin User',
                    email: email,
                    phone_number: null,
                    role: 'admin' // Set role admin
                }
            ]);

        if (customerError) {
            // Nếu lỗi, xóa user trong Supabase Auth để rollback
            await supabaseAdmin.auth.admin.deleteUser(userId);
            throw customerError;
        }

        console.log('✅ Đã tạo record trong customers table với role admin');

        console.log('\n📋 Thông tin tài khoản admin:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   Full Name: ${fullName || 'Admin User'}`);
        console.log(`   Role: admin`);
        console.log(`   User ID: ${userId}`);

        console.log('\n✅ Hoàn thành! Bạn có thể đăng nhập với email và password trên.');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        if (error.details) {
            console.error('Chi tiết:', error.details);
        }
        process.exit(1);
    }
}

const email = process.argv[2];
const password = process.argv[3];
const fullName = process.argv[4];

if (!email || !password) {
    console.error('❌ Vui lòng cung cấp đầy đủ thông tin');
    console.error('Usage: node scripts/create-admin-user.js <email> <password> [fullName]');
    console.error('Example: node scripts/create-admin-user.js admin@example.com "SecurePassword123" "Admin User"');
    process.exit(1);
}

createAdminUser(email, password, fullName);

