
const { supabaseAdmin } = require('./src/lib/supabase-server');

async function testFetch() {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id, status_history')
      .limit(1);
    
    if (error) {
      console.error('Supabase Error:', error);
    } else {
      console.log('Success! Data:', data);
    }
  } catch (err) {
    console.error('Runtime Error:', err.message);
  }
}

// Manually load env if needed - assuming they are in .env or .env.local
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

testFetch();
