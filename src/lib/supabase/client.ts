/**
 * Supabase 客户端配置
 */

import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from './config';

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// 检查 Supabase 是否可用
export const isSupabaseAvailable = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          role: 'super-admin' | 'admin';
          created_at: string;
          last_login_at: string | null;
          is_active: boolean;
          metadata: Record<string, any>;
        };
        Insert: {
          id?: string;
          username: string;
          password_hash: string;
          role: 'super-admin' | 'admin';
          created_at?: string;
          last_login_at?: string | null;
          is_active?: boolean;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          username?: string;
          password_hash?: string;
          role?: 'super-admin' | 'admin';
          created_at?: string;
          last_login_at?: string | null;
          is_active?: boolean;
          metadata?: Record<string, any>;
        };
      };
      invite_codes: {
        Row: {
          id: string;
          code: string;
          type: 'single' | 'multiple' | 'unlimited';
          max_uses: number;
          used_count: number;
          status: 'active' | 'used' | 'expired' | 'disabled';
          created_at: string;
          expires_at: string | null;
          created_by: string | null;
          note: string | null;
          metadata: Record<string, any>;
        };
        Insert: {
          id?: string;
          code: string;
          type: 'single' | 'multiple' | 'unlimited';
          max_uses?: number;
          used_count?: number;
          status?: 'active' | 'used' | 'expired' | 'disabled';
          created_at?: string;
          expires_at?: string | null;
          created_by?: string | null;
          note?: string | null;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          code?: string;
          type?: 'single' | 'multiple' | 'unlimited';
          max_uses?: number;
          used_count?: number;
          status?: 'active' | 'used' | 'expired' | 'disabled';
          created_at?: string;
          expires_at?: string | null;
          created_by?: string | null;
          note?: string | null;
          metadata?: Record<string, any>;
        };
      };
      invite_code_usages: {
        Row: {
          id: string;
          code_id: string;
          code: string;
          used_at: string;
          session_id: string;
          user_agent: string | null;
          ip_address: string | null;
          metadata: Record<string, any>;
        };
        Insert: {
          id?: string;
          code_id: string;
          code: string;
          used_at?: string;
          session_id: string;
          user_agent?: string | null;
          ip_address?: string | null;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          code_id?: string;
          code?: string;
          used_at?: string;
          session_id?: string;
          user_agent?: string | null;
          ip_address?: string | null;
          metadata?: Record<string, any>;
        };
      };
    };
    Views: {
      invite_code_stats: {
        Row: {
          total_codes: number;
          active_codes: number;
          used_codes: number;
          expired_codes: number;
          disabled_codes: number;
          total_usages: number;
        };
      };
      invite_codes_with_creator: {
        Row: {
          id: string;
          code: string;
          type: 'single' | 'multiple' | 'unlimited';
          max_uses: number;
          used_count: number;
          status: 'active' | 'used' | 'expired' | 'disabled';
          created_at: string;
          expires_at: string | null;
          created_by: string | null;
          note: string | null;
          metadata: Record<string, any>;
          creator_username: string | null;
          creator_role: string | null;
        };
      };
    };
    Functions: {
      validate_invite_code: {
        Args: {
          p_code: string;
        };
        Returns: {
          valid: boolean;
          code_id: string | null;
          reason: string;
          code_data: Record<string, any> | null;
        }[];
      };
      get_invite_stats: {
        Args: Record<string, never>;
        Returns: {
          total_codes: number;
          active_codes: number;
          used_codes: number;
          expired_codes: number;
          disabled_codes: number;
          total_usages: number;
          recent_usages: Record<string, any>[];
        }[];
      };
    };
  };
}
