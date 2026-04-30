
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('status', 'active')
    .limit(5);
    
  if (error) {
    console.error('Fetch error:', error);
  } else {
    console.log('Fetch success! Count:', data.length);
    console.log('Sample:', JSON.stringify(data[0], null, 2));
  }
}

testFetch();
