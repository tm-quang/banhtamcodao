import { supabaseAdmin } from './src/lib/supabase.js';

async function checkColumns() {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  } else {
    console.log('No data found in categories table.');
  }
}

checkColumns();
