/**
 * Diagnostic script
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runDiagnostics() {
    console.log('--- DIAGNOSTICS ---');
    
    // Check Orders
    const { data: orders, error: oError } = await supabase.from('orders').select('id, status').limit(5);
    console.log('Orders table:', oError ? 'ERROR: ' + oError.message : 'OK (' + orders.length + ' rows)');

    // Check Categories
    const { data: cats, error: cError } = await supabase.from('categories').select('id, name').limit(5);
    console.log('Categories table:', cError ? 'ERROR: ' + cError.message : 'OK (' + cats.length + ' rows)');

    // Check Customer Groups
    const { data: groups, error: gError } = await supabase.from('customer_groups').select('id, name').limit(5);
    console.log('Customer Groups table:', gError ? 'ERROR: ' + gError.message : 'OK (' + groups.length + ' rows)');

    // Check Customers
    const { data: custs, error: cuError } = await supabase.from('customers').select('id').limit(5);
    console.log('Customers table:', cuError ? 'ERROR: ' + cuError.message : 'OK (' + custs.length + ' rows)');
}

runDiagnostics();
