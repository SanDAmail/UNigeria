

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// In a sandboxed environment, process.env variables are not available.
// We provide placeholder values to prevent the app from crashing.
// In a real application, these should be securely managed.
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials not found. Using placeholder values. Authentication will not function.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);


export const upsertProfile = async (profile: Database['public']['Tables']['profiles']['Update']) => {
    const { error } = await supabase.from('profiles').upsert(profile as any, { onConflict: 'id' });
    if (error) {
        console.error('Error upserting profile:', error);
        throw error;
    }
}
