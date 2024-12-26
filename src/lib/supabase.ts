import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// More descriptive error messages
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is missing in environment variables');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is missing in environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);