/**
 * Supabase 版本的邀请码管理系统
 * 支持数据库持久化、多管理员协同和bcrypt密码加密
 */

import { supabase, isSupabaseAvailable } from '@/lib/supabase/client';
import {
  InviteCode,
  InviteCodeUsage,
  InviteCodeValidation,
  InviteCodeGenerateOptions,
  InviteCodeStats,
  AdminUser
} from '@/types/invite-code';
import bcrypt from 'bcryptjs';

const USER_INVITE_KEY = 'sri_user_invite_code';
const ADMIN_SESSION_KEY = 'sri_admin_session';

/**
 * 生成随机邀请码
 */
export function generateRandomCode(length: number = 12, prefix?: string): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix || '';

  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return code;
}

/**
 * 密码加密
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * 创建新的邀请码
 */
export async function createInviteCode(
  options: InviteCodeGenerateOptions,
  createdBy?: string
): Promise<InviteCode> {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase 未配置');
  }

  // 生成唯一的邀请码
  let code: string;
  let attempts = 0;
  let exists = true;

  while (exists && attempts < 100) {
    code = generateRandomCode(options.length || 12, options.prefix);

    const { data } = await supabase
      .from('invite_codes')
      .select('code')
      .eq('code', code)
      .single();

    exists = Boolean(data);
    attempts++;
  }

  if (attempts >= 100) {
    throw new Error('无法生成唯一的邀请码，请重试');
  }

  // 插入数据库
  const { data, error } = await supabase
    .from('invite_codes')
    .insert({
      code: code!,
      type: options.type,
      max_uses: options.maxUses || (options.type === 'single' ? 1 : options.type === 'unlimited' ? -1 : 10),
      used_count: 0,
      status: 'active',
      expires_at: options.expiresAt?.toISOString() || null,
      created_by: createdBy || null,
      note: options.note || null
    })
    .select()
    .single();

  if (error) {
    throw new Error(`创建邀请码失败: ${error.message}`);
  }

  return {
    ...data,
    createdAt: new Date(data.created_at),
    expiresAt: data.expires_at ? new Date(data.expires_at) : undefined
  } as InviteCode;
}

/**
 * 批量创建邀请码
 */
export async function batchCreateInviteCodes(
  count: number,
  options: InviteCodeGenerateOptions,
  createdBy?: string
): Promise<InviteCode[]> {
  const codes: InviteCode[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const code = await createInviteCode(options, createdBy);
      codes.push(code);
    } catch (error) {
      console.error(`Failed to generate code ${i + 1}:`, error);
    }
  }

  return codes;
}

/**
 * 验证邀请码
 */
export async function validateInviteCode(code: string): Promise<InviteCodeValidation> {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase 未配置');
  }

  // 调用数据库函数验证
  const { data, error } = await supabase
    .rpc('validate_invite_code', { p_code: code });

  if (error) {
    console.error('验证邀请码失败:', error);
    return {
      valid: false,
      reason: '验证失败，请重试'
    };
  }

  if (!data || data.length === 0) {
    return {
      valid: false,
      reason: '邀请码不存在'
    };
  }

  const result = data[0];

  return {
    valid: result.valid,
    code: result.code_data ? {
      ...result.code_data,
      createdAt: new Date(result.code_data.created_at),
      expiresAt: result.code_data.expires_at ? new Date(result.code_data.expires_at) : undefined
    } : undefined,
    reason: result.reason
  };
}

/**
 * 使用邀请码（记录使用）
 */
export async function useInviteCode(code: string, sessionId: string): Promise<boolean> {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase 未配置');
  }

  const validation = await validateInviteCode(code);

  if (!validation.valid || !validation.code) {
    return false;
  }

  // 记录使用
  const { error } = await supabase
    .from('invite_code_usages')
    .insert({
      code_id: validation.code.id,
      code: code,
      session_id: sessionId,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
    });

  if (error) {
    console.error('记录使用失败:', error);
    return false;
  }

  // 保存用户的邀请码
  saveUserInviteCode(code);

  return true;
}

/**
 * 保存用户使用的邀请码
 */
export function saveUserInviteCode(code: string): void {
  try {
    localStorage.setItem(USER_INVITE_KEY, code);
  } catch (error) {
    console.error('Error saving user invite code:', error);
  }
}

/**
 * 获取用户的邀请码
 */
export function getUserInviteCode(): string | null {
  try {
    return localStorage.getItem(USER_INVITE_KEY);
  } catch (error) {
    console.error('Error getting user invite code:', error);
    return null;
  }
}

/**
 * 检查用户是否已有有效的邀请码
 */
export async function hasValidUserInviteCode(): Promise<boolean> {
  const code = getUserInviteCode();
  if (!code) {
    return false;
  }

  const validation = await validateInviteCode(code);
  return validation.valid;
}

/**
 * 获取所有邀请码
 */
export async function getAllInviteCodes(): Promise<InviteCode[]> {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase 未配置');
  }

  const { data, error } = await supabase
    .from('invite_codes_with_creator')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`获取邀请码失败: ${error.message}`);
  }

  return (data || []).map(item => ({
    id: item.id,
    code: item.code,
    type: item.type,
    maxUses: item.max_uses,
    usedCount: item.used_count,
    status: item.status,
    createdAt: new Date(item.created_at),
    expiresAt: item.expires_at ? new Date(item.expires_at) : undefined,
    createdBy: item.created_by || '',
    note: item.note || undefined,
    metadata: item.metadata
  }));
}

/**
 * 获取邀请码统计
 */
export async function getInviteCodeStats(): Promise<InviteCodeStats> {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase 未配置');
  }

  const { data, error } = await supabase.rpc('get_invite_stats');

  if (error || !data || data.length === 0) {
    return {
      totalCodes: 0,
      activeCodes: 0,
      usedCodes: 0,
      expiredCodes: 0,
      disabledCodes: 0,
      totalUsages: 0,
      recentUsages: []
    };
  }

  const stats = data[0];

  return {
    totalCodes: Number(stats.total_codes),
    activeCodes: Number(stats.active_codes),
    usedCodes: Number(stats.used_codes),
    expiredCodes: Number(stats.expired_codes),
    disabledCodes: Number(stats.disabled_codes),
    totalUsages: Number(stats.total_usages),
    recentUsages: stats.recent_usages || []
  };
}

/**
 * 更新邀请码状态
 */
export async function updateInviteCodeStatus(
  codeId: string,
  status: InviteCode['status']
): Promise<boolean> {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase 未配置');
  }

  const { error } = await supabase
    .from('invite_codes')
    .update({ status })
    .eq('id', codeId);

  if (error) {
    console.error('更新状态失败:', error);
    return false;
  }

  return true;
}

/**
 * 删除邀请码
 */
export async function deleteInviteCode(codeId: string): Promise<boolean> {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase 未配置');
  }

  const { error } = await supabase
    .from('invite_codes')
    .delete()
    .eq('id', codeId);

  if (error) {
    console.error('删除失败:', error);
    return false;
  }

  return true;
}

/**
 * 获取邀请码的使用记录
 */
export async function getInviteCodeUsages(codeId: string): Promise<InviteCodeUsage[]> {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase 未配置');
  }

  const { data, error } = await supabase
    .from('invite_code_usages')
    .select('*')
    .eq('code_id', codeId)
    .order('used_at', { ascending: false });

  if (error) {
    console.error('获取使用记录失败:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    codeId: item.code_id,
    code: item.code,
    usedAt: new Date(item.used_at),
    sessionId: item.session_id,
    userAgent: item.user_agent || undefined,
    ipAddress: item.ip_address || undefined
  }));
}

/**
 * 管理员登录
 */
export async function adminLogin(username: string, password: string): Promise<AdminUser | null> {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase 未配置');
  }

  // 查找管理员
  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('username', username)
    .eq('is_active', true)
    .single();

  if (error || !admin) {
    return null;
  }

  // 验证密码
  const valid = await verifyPassword(password, admin.password_hash);
  if (!valid) {
    return null;
  }

  // 更新最后登录时间
  await supabase
    .from('admins')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', admin.id);

  return {
    id: admin.id,
    username: admin.username,
    passwordHash: admin.password_hash,
    role: admin.role,
    createdAt: new Date(admin.created_at),
    lastLoginAt: admin.last_login_at ? new Date(admin.last_login_at) : undefined
  };
}

/**
 * 创建管理员账户
 */
export async function createAdminUser(username: string, password: string): Promise<AdminUser> {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase 未配置');
  }

  // 检查用户名是否已存在
  const { data: existing } = await supabase
    .from('admins')
    .select('username')
    .eq('username', username)
    .single();

  if (existing) {
    throw new Error('用户名已存在');
  }

  // 加密密码
  const passwordHash = await hashPassword(password);

  // 检查是否是第一个管理员
  const { count } = await supabase
    .from('admins')
    .select('*', { count: 'exact', head: true });

  const role = count === 0 ? 'super-admin' : 'admin';

  // 创建管理员
  const { data, error } = await supabase
    .from('admins')
    .insert({
      username,
      password_hash: passwordHash,
      role,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    throw new Error(`创建管理员失败: ${error.message}`);
  }

  return {
    id: data.id,
    username: data.username,
    passwordHash: data.password_hash,
    role: data.role,
    createdAt: new Date(data.created_at)
  };
}

/**
 * 检查是否需要初始化管理员
 */
export async function needsAdminInitialization(): Promise<boolean> {
  if (!isSupabaseAvailable()) {
    return false;
  }

  const { count } = await supabase
    .from('admins')
    .select('*', { count: 'exact', head: true });

  return count === 0;
}

/**
 * 导出邀请码数据为CSV
 */
export async function exportInviteCodesCSV(): Promise<string> {
  const codes = await getAllInviteCodes();

  const headers = ['邀请码', '类型', '最大使用次数', '已使用次数', '状态', '创建时间', '过期时间', '备注'];

  const rows = codes.map(code => [
    code.code,
    code.type === 'single' ? '单次' : code.type === 'multiple' ? '多次' : '无限',
    code.maxUses === -1 ? '无限' : code.maxUses.toString(),
    code.usedCount.toString(),
    code.status === 'active' ? '激活' : code.status === 'used' ? '已用' : code.status === 'expired' ? '过期' : '禁用',
    code.createdAt.toLocaleString('zh-CN'),
    code.expiresAt ? code.expiresAt.toLocaleString('zh-CN') : '无',
    code.note || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return '\uFEFF' + csvContent;
}

/**
 * 下载邀请码CSV
 */
export async function downloadInviteCodesCSV(): Promise<void> {
  const csv = await exportInviteCodesCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invite-codes-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 保存管理员会话
 */
export function saveAdminSession(admin: AdminUser): void {
  const session = {
    adminId: admin.id,
    username: admin.username,
    role: admin.role,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };

  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

/**
 * 获取管理员会话
 */
export function getAdminSession(): any {
  try {
    const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!session) return null;

    const data = JSON.parse(session);
    if (new Date(data.expiresAt) <= new Date()) {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

/**
 * 清除管理员会话
 */
export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}
