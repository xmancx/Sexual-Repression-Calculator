/**
 * Supabase 配置 - 直接配置方式
 */

// 直接在这里配置 Supabase 信息（用于测试）
const SUPABASE_CONFIG = {
  url: 'https://ekcpvvbsxfipgmkyyrjv.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrY3B2dmJzeGZpcGdta3l5cmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzEwMDYsImV4cCI6MjA3NjAwNzAwNn0.avkTxm3DbgEW4yCmydfSylqHQ3bWvwC1Ze-LxL10naQ'
};

// 尝试从环境变量读取，如果失败则使用上面的配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_CONFIG.url;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;

console.log('🔍 Supabase 配置检查:', {
  envUrl: import.meta.env.VITE_SUPABASE_URL,
  envKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '已设置' : '未设置',
  finalUrl: supabaseUrl,
  finalKey: supabaseAnonKey ? '已设置' : '未设置',
  urlLength: supabaseUrl.length,
  keyLength: supabaseAnonKey.length,
  usingFallback: !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase 配置未设置，将使用 localStorage 作为备用方案');
} else {
  console.log('✅ Supabase 配置已设置，将使用数据库模式');
}

export { supabaseUrl, supabaseAnonKey };