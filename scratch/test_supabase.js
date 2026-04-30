
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Testing connection to combo_promotions...');
    const { data, error } = await supabase
        .from('combo_promotions')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Supabase error:', error);
    } else {
        console.log('Success! Data:', data);
    }
}

testSupabase();
