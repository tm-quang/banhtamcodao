/**
 * Script để kiểm tra user trong Supabase Auth và database
 * Usage: node scripts/check-user.js <email>
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

async function checkUser(email) {
    try {
        console.log(`\n🔍 Đang kiểm tra user: ${email}\n`);

        /**
         * Kiểm tra trong Supabase Auth
         */
        console.log('1️⃣ Kiểm tra trong Supabase Auth...');
        let authUser = null;
        let userId = null;
        
        try {
            // Thử dùng getUserByEmail nếu có
            if (supabaseAdmin.auth.admin.getUserByEmail) {
                const result = await supabaseAdmin.auth.admin.getUserByEmail(email);
                if (result?.data?.user) {
                    authUser = result.data;
                    userId = result.data.user.id;
                }
            } else {
                // Nếu không có, dùng listUsers và filter
                const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
                if (!listError && usersData?.users) {
                    const foundUser = usersData.users.find(u => u.email === email);
                    if (foundUser) {
                        authUser = { user: foundUser };
                        userId = foundUser.id;
                    }
                }
            }
        } catch (error) {
            console.log(`   ⚠️ Lỗi khi kiểm tra Supabase Auth: ${error.message}`);
        }

        if (!authUser?.user) {
            console.log('   ❌ Không tìm thấy trong Supabase Auth');
            console.log('   💡 User cần được tạo trong Supabase Auth trước khi đăng nhập');
            
            // Kiểm tra xem user có trong customers table không
            const { data: customerByEmail } = await supabaseAdmin
                .from('customers')
                .select('*')
                .eq('email', email)
                .maybeSingle();
            
            if (customerByEmail) {
                console.log('\n   📋 Tìm thấy user trong customers table:');
                console.log(`      - Full Name: ${customerByEmail.full_name}`);
                console.log(`      - Phone: ${customerByEmail.phone_number || 'N/A'}`);
                console.log(`   💡 Chạy: node scripts/migrate-user.js ${email} <password>`);
                console.log('      (Script này sẽ tạo user trong Supabase Auth và cập nhật account_id)');
            } else {
                console.log('   💡 Chạy: node scripts/create-admin-user.js <email> <password> <fullName>');
            }
            return;
        }

        console.log('   ✅ Tìm thấy trong Supabase Auth');
        console.log(`      - User ID: ${authUser.user.id}`);
        console.log(`      - Email: ${authUser.user.email}`);
        console.log(`      - Phone: ${authUser.user.phone || 'N/A'}`);
        console.log(`      - Email Confirmed: ${authUser.user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`      - Created: ${authUser.user.created_at}`);

        userId = authUser.user.id;

        /**
         * Kiểm tra trong customers table
         */
        console.log('\n2️⃣ Kiểm tra trong customers table...');
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('account_id', userId)
            .maybeSingle();

        if (customerError) {
            console.log(`   ⚠️ Lỗi: ${customerError.message}`);
        } else if (!customer) {
            console.log('   ⚠️ Không tìm thấy trong customers table');
            console.log('   💡 Có thể tạo record bằng cách đăng ký lại hoặc tạo thủ công');
        } else {
            console.log('   ✅ Tìm thấy trong customers table');
            console.log(`      - Full Name: ${customer.full_name}`);
            console.log(`      - Phone: ${customer.phone_number || 'N/A'}`);
            console.log(`      - Email: ${customer.email || 'N/A'}`);
        }

        /**
         * Kiểm tra trong accounts table
         */
        console.log('\n3️⃣ Kiểm tra trong accounts table...');
        const { data: account, error: accountError } = await supabaseAdmin
            .from('accounts')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (accountError) {
            console.log(`   ⚠️ Lỗi: ${accountError.message}`);
        } else if (!account) {
            console.log('   ⚠️ Không tìm thấy trong accounts table');
            console.log('   💡 Chạy: node scripts/set-admin-role.js <email> để tạo record');
        } else {
            console.log('   ✅ Tìm thấy trong accounts table');
            console.log(`      - Username: ${account.username || 'N/A'}`);
            console.log(`      - Role: ${account.role}`);
            console.log(`      - Status: ${account.status}`);
        }

        /**
         * Tóm tắt
         */
        console.log('\n📋 Tóm tắt:');
        console.log(`   ✅ Supabase Auth: Có`);
        console.log(`   ${customer ? '✅' : '⚠️'} Customers table: ${customer ? 'Có' : 'Không'}`);
        console.log(`   ${account ? '✅' : '⚠️'} Accounts table: ${account ? 'Có' : 'Không'}`);

        if (!customer || !account) {
            console.log('\n💡 Để sửa:');
            if (!customer) {
                console.log('   - Tạo record trong customers table với account_id =', userId);
            }
            if (!account) {
                console.log('   - Chạy: node scripts/set-admin-role.js', email);
            }
        } else {
            console.log('\n✅ User đã được cấu hình đầy đủ!');
        }

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        if (error.details) {
            console.error('Chi tiết:', error.details);
        }
        process.exit(1);
    }
}

const email = process.argv[2];

if (!email) {
    console.error('❌ Vui lòng cung cấp email của user');
    console.error('Usage: node scripts/check-user.js <email>');
    console.error('Example: node scripts/check-user.js admin@example.com');
    process.exit(1);
}

checkUser(email);

