/**
 * Script để gán role admin cho tài khoản
 * Usage: node scripts/set-admin-role.js <email>
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

async function setAdminRole(email) {
    try {
        /**
         * Tìm user trong Supabase Auth bằng email
         */
        let authUser = null;
        
        try {
            // Thử dùng getUserByEmail nếu có
            if (supabaseAdmin.auth.admin.getUserByEmail) {
                const result = await supabaseAdmin.auth.admin.getUserByEmail(email);
                if (result?.data?.user) {
                    authUser = result.data;
                }
            } else {
                // Nếu không có, dùng listUsers và filter
                const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
                if (!listError && usersData?.users) {
                    const foundUser = usersData.users.find(u => u.email === email);
                    if (foundUser) {
                        authUser = { user: foundUser };
                    }
                }
            }
        } catch (checkError) {
            console.error(`❌ Lỗi khi tìm user: ${checkError.message}`);
        }

        if (!authUser?.user) {
            console.error(`❌ Không tìm thấy user với email: ${email}`);
            console.error('Vui lòng đảm bảo user đã được tạo trong Supabase Auth');
            process.exit(1);
        }

        const userId = authUser.user.id;
        console.log(`✅ Tìm thấy user: ${email} (ID: ${userId})`);

        /**
         * Kiểm tra xem đã có record trong customers table chưa
         * account_id là UUID từ Supabase Auth
         */
        const { data: existingCustomer } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('account_id', userId)
            .maybeSingle();

        if (existingCustomer) {
            /**
             * Cập nhật role thành admin trong customers table
             */
            const { error: updateError } = await supabaseAdmin
                .from('customers')
                .update({ role: 'admin' })
                .eq('account_id', userId);

            if (updateError) {
                throw updateError;
            }

            console.log(`✅ Đã cập nhật role thành 'admin' cho user: ${email}`);
        } else {
            /**
             * Tạo record mới trong customers table với role admin
             * Nếu user chưa có customer record
             */
            const { error: insertError } = await supabaseAdmin
                .from('customers')
                .insert([
                    {
                        account_id: userId, // UUID từ Supabase Auth
                        full_name: authUser.user.user_metadata?.full_name || email.split('@')[0],
                        email: email,
                        phone_number: authUser.user.phone || null,
                        role: 'admin'
                    }
                ]);

            if (insertError) {
                throw insertError;
            }

            console.log(`✅ Đã tạo record trong customers table với role 'admin' cho user: ${email}`);
        }

        /**
         * Kiểm tra lại
         */
        const { data: customer } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('account_id', userId)
            .maybeSingle();

        if (!customer) {
            throw new Error('Không thể tìm thấy customer record sau khi cập nhật');
        }

        console.log('\n📋 Thông tin tài khoản:');
        console.log(`   Email: ${email}`);
        console.log(`   User ID: ${userId}`);
        console.log(`   Full Name: ${customer.full_name || 'N/A'}`);
        console.log(`   Role: ${customer.role}`);
        console.log(`   Phone: ${customer.phone_number || 'N/A'}`);

        console.log('\n✅ Hoàn thành! User đã có quyền admin.');

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
    console.error('Usage: node scripts/set-admin-role.js <email>');
    console.error('Example: node scripts/set-admin-role.js admin@example.com');
    process.exit(1);
}

setAdminRole(email);

