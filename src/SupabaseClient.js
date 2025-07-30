import { createClient } from '@supabase/supabase-js';

const supabaseUrl    = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey= process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️  Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_KEY in your .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
