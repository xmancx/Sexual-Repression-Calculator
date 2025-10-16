/**
 * 后端 API 路由设置
 */

import { Hono } from 'hono';

export function setupRoutes(app: Hono) {
  // 环境变量接口
  app.get('/api/env', (c) => {
    // 在开发环境，我们可以直接返回配置
    const showAbusePopup = import.meta.env.DEV ? 'false' : 'true';

    return c.json({
      showAbusePopup,
      supabaseConfigured: !!import.meta.env.VITE_SUPABASE_URL
    });
  });

  // 健康检查接口
  app.get('/api/health', (c) => {
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // Supabase 连接测试接口
  app.get('/api/test-supabase', async (c) => {
    try {
      const { supabase } = await import('./client');
      const { data, error } = await supabase.from('admins').select('count').limit(1);

      return c.json({
        connected: !error,
        error: error?.message,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      return c.json({
        connected: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });
}