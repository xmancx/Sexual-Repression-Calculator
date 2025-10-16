/**
 * 邀请码系统适配器 - 自动选择最佳存储方式
 * 优先使用 Supabase，回退到 localStorage
 */

import { isSupabaseAvailable } from '@/lib/supabase/client';
import {
  InviteCode,
  InviteCodeUsage,
  InviteCodeValidation,
  InviteCodeGenerateOptions,
  InviteCodeStats,
  AdminUser
} from '@/types/invite-code';

// Import localStorage 版本
import * as localStorageVersion from './index';

// Import Supabase 版本
import * as supabaseVersion from './supabase';

// 检查是否应该使用 Supabase
const useSupabase = (): boolean => {
  return isSupabaseAvailable();
};

/**
 * 智能适配器 - 根据配置选择最佳实现
 */
const adapter = {
  // 获取当前使用的后端类型
  getBackendType: () => useSupabase() ? 'supabase' : 'localStorage',

  // 邀请码生成
  generateRandomCode: (length?: number, prefix?: string) => {
    return useSupabase()
      ? supabaseVersion.generateRandomCode(length, prefix)
      : localStorageVersion.generateRandomCode(length, prefix);
  },

  // 创建邀请码
  createInviteCode: (options: InviteCodeGenerateOptions, createdBy?: string) => {
    return useSupabase()
      ? supabaseVersion.createInviteCode(options, createdBy)
      : localStorageVersion.createInviteCode(options, createdBy);
  },

  // 批量创建邀请码
  batchCreateInviteCodes: (count: number, options: InviteCodeGenerateOptions, createdBy?: string) => {
    return useSupabase()
      ? supabaseVersion.batchCreateInviteCodes(count, options, createdBy)
      : localStorageVersion.batchCreateInviteCodes(count, options, createdBy);
  },

  // 验证邀请码
  validateInviteCode: (code: string): InviteCodeValidation => {
    return useSupabase()
      ? supabaseVersion.validateInviteCode(code)
      : localStorageVersion.validateInviteCode(code);
  },

  // 使用邀请码
  useInviteCode: (code: string, sessionId: string): boolean => {
    return useSupabase()
      ? supabaseVersion.useInviteCode(code, sessionId)
      : localStorageVersion.useInviteCode(code, sessionId);
  },

  // 获取所有邀请码
  getAllInviteCodes: (): InviteCode[] => {
    return useSupabase()
      ? supabaseVersion.getAllInviteCodes()
      : localStorageVersion.getAllInviteCodes();
  },

  // 获取邀请码统计
  getInviteCodeStats: (): InviteCodeStats => {
    return useSupabase()
      ? supabaseVersion.getInviteCodeStats()
      : localStorageVersion.getInviteCodeStats();
  },

  // 更新邀请码状态
  updateInviteCodeStatus: (codeId: string, status: InviteCode['status']): boolean => {
    return useSupabase()
      ? supabaseVersion.updateInviteCodeStatus(codeId, status)
      : localStorageVersion.updateInviteCodeStatus(codeId, status);
  },

  // 删除邀请码
  deleteInviteCode: (codeId: string): boolean => {
    return useSupabase()
      ? supabaseVersion.deleteInviteCode(codeId)
      : localStorageVersion.deleteInviteCode(codeId);
  },

  // 获取邀请码使用记录
  getInviteCodeUsages: (codeId: string): InviteCodeUsage[] => {
    return useSupabase()
      ? supabaseVersion.getInviteCodeUsages(codeId)
      : localStorageVersion.getInviteCodeUsages(codeId);
  },

  // 管理员登录
  adminLogin: async (username: string, password: string): Promise<AdminUser | null> => {
    if (useSupabase()) {
      return await supabaseVersion.adminLogin(username, password);
    } else {
      return localStorageVersion.adminLogin(username, password);
    }
  },

  // 创建管理员
  createAdminUser: async (username: string, password: string): Promise<AdminUser> => {
    if (useSupabase()) {
      return await supabaseVersion.createAdminUser(username, password);
    } else {
      return localStorageVersion.createAdminUser(username, password);
    }
  },

  // 检查是否需要初始化管理员
  needsAdminInitialization: async (): Promise<boolean> => {
    if (useSupabase()) {
      return await supabaseVersion.needsAdminInitialization();
    } else {
      return localStorageVersion.needsAdminInitialization();
    }
  },

  // 用户邀请码相关
  getUserInviteCode: (): string | null => {
    return localStorageVersion.getUserInviteCode(); // 用户邀请码始终存储在本地
  },

  saveUserInviteCode: (code: string): void => {
    return localStorageVersion.saveUserInviteCode(code); // 用户邀请码始终存储在本地
  },

  hasValidUserInviteCode: (): boolean => {
    return localStorageVersion.hasValidUserInviteCode(); // 用户邀请码验证始终在本地
  },

  // 导出功能
  exportInviteCodesCSV: (): string => {
    return useSupabase()
      ? supabaseVersion.exportInviteCodesCSV()
      : localStorageVersion.exportInviteCodesCSV();
  },

  downloadInviteCodesCSV: (): void => {
    return useSupabase()
      ? supabaseVersion.downloadInviteCodesCSV()
      : localStorageVersion.downloadInviteCodesCSV();
  }
};

// 导出适配器作为默认导出
export default adapter;

// 同时也支持命名导出，以保持向后兼容
export const {
  generateRandomCode,
  createInviteCode,
  batchCreateInviteCodes,
  validateInviteCode,
  useInviteCode,
  getAllInviteCodes,
  getInviteCodeStats,
  updateInviteCodeStatus,
  deleteInviteCode,
  getInviteCodeUsages,
  adminLogin,
  createAdminUser,
  needsAdminInitialization,
  getUserInviteCode,
  saveUserInviteCode,
  hasValidUserInviteCode,
  exportInviteCodesCSV,
  downloadInviteCodesCSV
} = adapter;

// 导出后端类型信息
export const backendType = adapter.getBackendType();
export const isUsingSupabase = useSupabase();