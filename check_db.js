
const { supabaseAdmin } = require('./src/lib/supabase-server');

async function checkColumns() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error fetching columns:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Columns in orders table:', Object.keys(data[0]));
  } else {
    console.log('No data found in orders table.');
  }
}

checkColumns();
