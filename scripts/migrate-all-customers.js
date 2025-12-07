/**
 * Script để migrate tất cả customers có account_id = NULL
 * Tạo user trong Supabase Auth và cập nhật account_id
 * 
 * Usage: node scripts/migrate-all-customers.js [--password PASSWORD]
 * 
 * Nếu không có password, sẽ tạo password ngẫu nhiên cho mỗi user
 */
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
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

/**
 * Tạo password ngẫu nhiên
 */
function generatePassword(length = 12) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

async function migrateAllCustomers(defaultPassword) {
    try {
        console.log('\n🔄 Bắt đầu migrate tất cả customers có account_id = NULL\n');

        // Lấy danh sách customers có account_id = NULL
        const { data: customers, error: fetchError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .is('account_id', null);

        if (fetchError) {
            throw new Error(`Lỗi khi lấy danh sách customers: ${fetchError.message}`);
        }

        if (!customers || customers.length === 0) {
            console.log('✅ Không có customer nào cần migrate!');
            return;
        }

        console.log(`📋 Tìm thấy ${customers.length} customer(s) cần migrate:\n`);

        const results = [];
        const errors = [];

        for (let i = 0; i < customers.length; i++) {
            const customer = customers[i];
            console.log(`\n[${i + 1}/${customers.length}] Đang migrate: ${customer.full_name || 'N/A'}`);
            console.log(`   Email: ${customer.email || 'N/A'}`);
            console.log(`   Phone: ${customer.phone_number || 'N/A'}`);

            // Kiểm tra email hoặc phone
            if (!customer.email && !customer.phone_number) {
                console.log('   ⚠️ Không có email hoặc phone, bỏ qua');
                errors.push({
                    customer: customer,
                    error: 'Không có email hoặc phone number'
                });
                continue;
            }

            // Tạo email nếu không có (dùng phone)
            const email = customer.email || `${customer.phone_number}@temp.migrated`;
            const password = defaultPassword || generatePassword();

            try {
                // Kiểm tra xem user đã tồn tại trong Supabase Auth chưa
                let authUser = null;
                try {
                    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
                    if (usersData?.users) {
                        authUser = usersData.users.find(u => 
                            u.email === email || 
                            (customer.phone_number && u.phone === customer.phone_number)
                        );
                    }
                } catch (checkError) {
                    // Bỏ qua lỗi check
                }

                if (!authUser) {
                    // Tạo user mới trong Supabase Auth
                    console.log('   📝 Tạo user trong Supabase Auth...');
                    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                        email: email,
                        phone: customer.phone_number || undefined,
                        password: password,
                        email_confirm: true,
                        user_metadata: {
                            full_name: customer.full_name,
                            phone_number: customer.phone_number,
                            migrated: true
                        }
                    });

                    if (authError) {
                        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
                            // User đã tồn tại, tìm lại
                            const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
                            if (usersData?.users) {
                                authUser = usersData.users.find(u => u.email === email);
                            }
                        } else {
                            throw authError;
                        }
                    } else {
                        authUser = authData.user;
                        console.log(`   ✅ Đã tạo user: ${authUser.id}`);
                    }
                } else {
                    console.log(`   ✅ User đã tồn tại: ${authUser.id}`);
                }

                if (!authUser) {
                    throw new Error('Không thể tạo hoặc tìm thấy user trong Supabase Auth');
                }

                // Cập nhật account_id trong customers table
                console.log('   📝 Cập nhật account_id...');
                const { error: updateError } = await supabaseAdmin
                    .from('customers')
                    .update({ account_id: authUser.id })
                    .eq('id', customer.id);

                if (updateError) {
                    throw updateError;
                }

                console.log('   ✅ Hoàn thành!');
                results.push({
                    customer: customer,
                    authUserId: authUser.id,
                    email: email,
                    password: password
                });

            } catch (error) {
                console.error(`   ❌ Lỗi: ${error.message}`);
                errors.push({
                    customer: customer,
                    error: error.message
                });
            }
        }

        // Tóm tắt
        console.log('\n' + '='.repeat(60));
        console.log('📊 TÓM TẮT:');
        console.log(`   ✅ Thành công: ${results.length}`);
        console.log(`   ❌ Lỗi: ${errors.length}`);
        console.log('='.repeat(60));

        if (results.length > 0) {
            console.log('\n📋 Thông tin đăng nhập (LƯU LẠI!):\n');
            results.forEach((r, idx) => {
                console.log(`${idx + 1}. ${r.customer.full_name || r.email}`);
                console.log(`   Email: ${r.email}`);
                console.log(`   Password: ${r.password}`);
                console.log(`   User ID: ${r.authUserId}`);
                console.log('');
            });

            // Lưu vào file
            const outputFile = path.join(process.cwd(), 'migration_results.json');
            fs.writeFileSync(outputFile, JSON.stringify({
                timestamp: new Date().toISOString(),
                successful: results,
                errors: errors
            }, null, 2));
            console.log(`💾 Đã lưu kết quả vào: ${outputFile}`);
        }

        if (errors.length > 0) {
            console.log('\n❌ Các lỗi:');
            errors.forEach((e, idx) => {
                console.log(`${idx + 1}. ${e.customer.full_name || e.customer.email || e.customer.id}: ${e.error}`);
            });
        }

        console.log('\n✅ Hoàn thành migration!');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        if (error.stack) {
            console.error('Stack:', error.stack);
        }
        process.exit(1);
    }
}

// Parse arguments
const args = process.argv.slice(2);
let defaultPassword = null;

if (args.includes('--password')) {
    const index = args.indexOf('--password');
    if (args[index + 1]) {
        defaultPassword = args[index + 1];
    }
}

migrateAllCustomers(defaultPassword);

