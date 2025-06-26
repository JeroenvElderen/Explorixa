import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://psgsygzjsjulyfxfksiq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZ3N5Z3pqc2p1bHlmeGZrc2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTM0NTUsImV4cCI6MjA2NTIyOTQ1NX0.9iivqPSRgtNh_4enQsDaq0bUVHK3Zum-Kbt8hYO7mdE';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
