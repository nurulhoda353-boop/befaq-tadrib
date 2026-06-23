import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase
    .from('events')
    .select('id, form_schema, slug')
    .eq('slug', 'জাতীয়-হাদিস-সম্মেলন-9685');

  console.log(JSON.stringify(data, null, 2));
}

main();
