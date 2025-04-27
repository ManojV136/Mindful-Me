import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fnubpvtavzvepojdlgbn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZudWJwdnRhdnp2ZXBvamRsZ2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg5MTUyNTMsImV4cCI6MjAyNDQ5MTI1M30.nK1foIeKHBc1vGDyiRojJzmjBau21mBvGy_lkaZdCAA';

const options = {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);