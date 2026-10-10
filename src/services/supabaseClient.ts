import { createClient } from '@supabase/supabase-js';

export function createTeacherCloudClient() {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) throw new Error('Chưa có cấu hình Supabase.');
  if (key.startsWith('sb_secret_')) throw new Error('Không được dùng Secret key trong web.');
  if (key.startsWith('eyJ')) {
    try {
      const payload = key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      if (JSON.parse(atob(payload)).role !== 'anon') throw new Error('invalid');
    } catch { throw new Error('Chỉ dùng Publishable hoặc anon key trong web.'); }
  } else if (!key.startsWith('sb_publishable_')) throw new Error('Khóa công khai Supabase không hợp lệ.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
