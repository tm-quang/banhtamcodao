/**
 * Script để migrate user từ database cũ sang Supabase Auth
 * Usage: node scripts/migrate-user.js <email> <password>
 * 
 * Script này sẽ:
 * 1. Tìm user trong customers table bằng email
 * 2. Tạo user trong Supabase Auth nếu chưa có
 * 3. Cập nhật account_id trong customers table nếu cần
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

async function migrateUser(email, password) {
    try {
        console.log(`\n🔄 Đang migrate user: ${email}\n`);

        /**
         * 1. Kiểm tra xem user đã tồn tại trong Supabase Auth chưa
         */
        console.log('1️⃣ Kiểm tra trong Supabase Auth...');
        let authUser = null;
        
        try {
            // Thử tìm user trong Supabase Auth
            const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
            if (usersData?.users) {
                authUser = usersData.users.find(u => u.email === email);
            }
        } catch (error) {
            console.warn(`   ⚠️ Không thể kiểm tra Supabase Auth: ${error.message}`);
        }

        if (authUser) {
            console.log('   ✅ User đã tồn tại trong Supabase Auth');
            console.log(`      - User ID: ${authUser.id}`);
            console.log('   💡 Không cần migrate. Bạn có thể đăng nhập trực tiếp.');
            return;
        }

        /**
         * 2. Tìm user trong customers table
         */
        console.log('\n2️⃣ Tìm user trong customers table...');
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (customerError) {
            throw new Error(`Lỗi khi tìm customer: ${customerError.message}`);
        }

        if (!customer) {
            console.log('   ❌ Không tìm thấy user trong customers table');
            console.log('   💡 User cần được tạo mới. Chạy: node scripts/create-admin-user.js <email> <password> <fullName>');
            return;
        }

        console.log('   ✅ Tìm thấy user trong customers table');
        console.log(`      - Full Name: ${customer.full_name}`);
        console.log(`      - Phone: ${customer.phone_number || 'N/A'}`);
        console.log(`      - Current account_id: ${customer.account_id}`);

        /**
         * 3. Tạo user trong Supabase Auth
         */
        console.log('\n3️⃣ Tạo user trong Supabase Auth...');
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                full_name: customer.full_name,
                phone_number: customer.phone_number,
            }
        });

        if (authError) {
            if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
                console.log('   ⚠️ User đã tồn tại trong Supabase Auth (có thể do email đã được sử dụng)');
                // Thử tìm lại
                const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
                if (usersData?.users) {
                    authUser = usersData.users.find(u => u.email === email);
                    if (authUser) {
                        console.log(`   ✅ Tìm thấy user: ${authUser.id}`);
                    }
                }
            } else {
                throw authError;
            }
        } else {
            authUser = authData.user;
            console.log(`   ✅ Đã tạo user trong Supabase Auth: ${authUser.id}`);
        }

        if (!authUser) {
            throw new Error('Không thể tạo hoặc tìm thấy user trong Supabase Auth');
        }

        const newAccountId = authUser.id;

        /**
         * 4. Cập nhật account_id trong customers table
         */
        console.log('\n4️⃣ Cập nhật account_id trong customers table...');
        const { error: updateError } = await supabaseAdmin
            .from('customers')
            .update({ account_id: newAccountId })
            .eq('id', customer.id);

        if (updateError) {
            console.warn(`   ⚠️ Không thể cập nhật account_id: ${updateError.message}`);
            console.warn('   💡 Bạn có thể cập nhật thủ công trong database');
        } else {
            console.log(`   ✅ Đã cập nhật account_id: ${newAccountId}`);
        }

        /**
         * 5. Tạo record trong accounts table nếu chưa có
         */
        console.log('\n5️⃣ Kiểm tra accounts table...');
        const { data: account, error: accountError } = await supabaseAdmin
            .from('accounts')
            .select('*')
            .eq('id', newAccountId)
            .maybeSingle();

        if (accountError && !accountError.message.includes('does not exist')) {
            console.warn(`   ⚠️ Lỗi khi kiểm tra accounts: ${accountError.message}`);
        } else if (!account) {
            console.log('   📝 Tạo record trong accounts table...');
            const username = email.split('@')[0];
            const { error: insertAccountError } = await supabaseAdmin
                .from('accounts')
                .insert([
                    {
                        id: newAccountId,
                        username: username,
                        role: 'customer',
                        status: 'active',
                        password_hash: '' // Không cần vì dùng Supabase Auth
                    }
                ]);

            if (insertAccountError) {
                console.warn(`   ⚠️ Không thể tạo record trong accounts: ${insertAccountError.message}`);
            } else {
                console.log('   ✅ Đã tạo record trong accounts table');
            }
        } else {
            console.log('   ✅ Record đã tồn tại trong accounts table');
        }

        console.log('\n✅ Hoàn thành migrate!');
        console.log('\n📋 Thông tin tài khoản:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   User ID: ${newAccountId}`);
        console.log('\n💡 Bạn có thể đăng nhập với email và password trên.');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        if (error.details) {
            console.error('Chi tiết:', error.details);
        }
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
        process.exit(1);
    }
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.error('❌ Vui lòng cung cấp đầy đủ thông tin');
    console.error('Usage: node scripts/migrate-user.js <email> <password>');
    console.error('Example: node scripts/migrate-user.js user@example.com "Password123"');
    process.exit(1);
}

migrateUser(email, password);

