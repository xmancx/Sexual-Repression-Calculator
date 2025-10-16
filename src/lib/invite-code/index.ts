/**
 * 邀请码管理系统 - 核心功能实现
 */

import {
  InviteCode,
  InviteCodeUsage,
  InviteCodeValidation,
  InviteCodeGenerateOptions,
  AdminStorageData,
  InviteCodeStats,
  AdminUser
} from '@/types/invite-code';

const ADMIN_STORAGE_KEY = 'sri_admin_data';
const ADMIN_VERSION = '1.0.0';
const USER_INVITE_KEY = 'sri_user_invite_code';

/**
 * 获取管理后台存储数据
 */
export function getAdminStorage(): AdminStorageData {
  try {
    const data = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!data) {
      return {
        inviteCodes: [],
        usages: [],
        admins: [],
        version: ADMIN_VERSION
      };
    }

    const parsed = JSON.parse(data) as AdminStorageData;

    // 恢复Date对象
    parsed.inviteCodes = parsed.inviteCodes.map(code => ({
      ...code,
      createdAt: new Date(code.createdAt),
      expiresAt: code.expiresAt ? new Date(code.expiresAt) : undefined
    }));

    parsed.usages = parsed.usages.map(usage => ({
      ...usage,
      usedAt: new Date(usage.usedAt)
    }));

    return parsed;
  } catch (error) {
    console.error('Error loading admin storage:', error);
    return {
      inviteCodes: [],
      usages: [],
      admins: [],
      version: ADMIN_VERSION
    };
  }
}

/**
 * 保存管理后台数据
 */
export function saveAdminStorage(data: AdminStorageData): void {
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving admin storage:', error);
    throw new Error('无法保存管理数据');
  }
}

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
 * 创建新的邀请码
 */
export function createInviteCode(
  options: InviteCodeGenerateOptions,
  createdBy: string = 'admin'
): InviteCode {
  const storage = getAdminStorage();

  // 生成唯一的邀请码
  let code: string;
  let attempts = 0;
  do {
    code = generateRandomCode(options.length || 12, options.prefix);
    attempts++;
    if (attempts > 100) {
      throw new Error('无法生成唯一的邀请码，请重试');
    }
  } while (storage.inviteCodes.some(c => c.code === code));

  const newCode: InviteCode = {
    id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    code,
    type: options.type,
    maxUses: options.maxUses || (options.type === 'single' ? 1 : options.type === 'unlimited' ? -1 : 10),
    usedCount: 0,
    status: 'active',
    createdAt: new Date(),
    expiresAt: options.expiresAt,
    createdBy,
    note: options.note
  };

  storage.inviteCodes.push(newCode);
  saveAdminStorage(storage);

  return newCode;
}

/**
 * 批量生成邀请码
 */
export function batchCreateInviteCodes(
  count: number,
  options: InviteCodeGenerateOptions,
  createdBy: string = 'admin'
): InviteCode[] {
  const codes: InviteCode[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const code = createInviteCode(options, createdBy);
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
export function validateInviteCode(code: string): InviteCodeValidation {
  const storage = getAdminStorage();
  const inviteCode = storage.inviteCodes.find(c => c.code === code);

  if (!inviteCode) {
    return {
      valid: false,
      reason: '邀请码不存在'
    };
  }

  // 检查状态
  if (inviteCode.status !== 'active') {
    return {
      valid: false,
      reason: '邀请码已失效',
      code: inviteCode
    };
  }

  // 检查是否过期
  if (inviteCode.expiresAt && inviteCode.expiresAt < new Date()) {
    // 自动更新状态为过期
    inviteCode.status = 'expired';
    saveAdminStorage(storage);

    return {
      valid: false,
      reason: '邀请码已过期',
      code: inviteCode
    };
  }

  // 检查使用次数
  if (inviteCode.maxUses !== -1 && inviteCode.usedCount >= inviteCode.maxUses) {
    // 自动更新状态为已用完
    inviteCode.status = 'used';
    saveAdminStorage(storage);

    return {
      valid: false,
      reason: '邀请码使用次数已达上限',
      code: inviteCode
    };
  }

  return {
    valid: true,
    code: inviteCode
  };
}

/**
 * 使用邀请码（记录使用）
 */
export function useInviteCode(code: string, sessionId: string): boolean {
  const validation = validateInviteCode(code);

  if (!validation.valid || !validation.code) {
    return false;
  }

  const storage = getAdminStorage();
  const inviteCode = storage.inviteCodes.find(c => c.id === validation.code!.id);

  if (!inviteCode) {
    return false;
  }

  // 增加使用次数
  inviteCode.usedCount += 1;

  // 如果达到上限，更新状态
  if (inviteCode.maxUses !== -1 && inviteCode.usedCount >= inviteCode.maxUses) {
    inviteCode.status = 'used';
  }

  // 记录使用日志
  const usage: InviteCodeUsage = {
    id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    codeId: inviteCode.id,
    code: inviteCode.code,
    usedAt: new Date(),
    sessionId,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
  };

  storage.usages.push(usage);
  saveAdminStorage(storage);

  // 保存用户的邀请码（用于后续验证）
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
export function hasValidUserInviteCode(): boolean {
  const code = getUserInviteCode();
  if (!code) {
    return false;
  }

  const validation = validateInviteCode(code);
  return validation.valid;
}

/**
 * 获取所有邀请码
 */
export function getAllInviteCodes(): InviteCode[] {
  const storage = getAdminStorage();
  return storage.inviteCodes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * 获取邀请码统计
 */
export function getInviteCodeStats(): InviteCodeStats {
  const storage = getAdminStorage();

  return {
    totalCodes: storage.inviteCodes.length,
    activeCodes: storage.inviteCodes.filter(c => c.status === 'active').length,
    usedCodes: storage.inviteCodes.filter(c => c.status === 'used').length,
    expiredCodes: storage.inviteCodes.filter(c => c.status === 'expired').length,
    disabledCodes: storage.inviteCodes.filter(c => c.status === 'disabled').length,
    totalUsages: storage.usages.length,
    recentUsages: storage.usages
      .sort((a, b) => b.usedAt.getTime() - a.usedAt.getTime())
      .slice(0, 10)
  };
}

/**
 * 更新邀请码状态
 */
export function updateInviteCodeStatus(codeId: string, status: InviteCode['status']): boolean {
  const storage = getAdminStorage();
  const code = storage.inviteCodes.find(c => c.id === codeId);

  if (!code) {
    return false;
  }

  code.status = status;
  saveAdminStorage(storage);
  return true;
}

/**
 * 删除邀请码
 */
export function deleteInviteCode(codeId: string): boolean {
  const storage = getAdminStorage();
  const initialLength = storage.inviteCodes.length;

  storage.inviteCodes = storage.inviteCodes.filter(c => c.id !== codeId);

  if (storage.inviteCodes.length < initialLength) {
    saveAdminStorage(storage);
    return true;
  }

  return false;
}

/**
 * 获取邀请码的使用记录
 */
export function getInviteCodeUsages(codeId: string): InviteCodeUsage[] {
  const storage = getAdminStorage();
  return storage.usages
    .filter(u => u.codeId === codeId)
    .sort((a, b) => b.usedAt.getTime() - a.usedAt.getTime());
}

/**
 * 简单的密码哈希（仅用于演示，生产环境应使用bcrypt等）
 */
export function hashPassword(password: string): string {
  // 这是一个简单的实现，生产环境应使用更安全的方法
  return btoa(password + 'sri_salt_2024');
}

/**
 * 验证管理员密码
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * 管理员登录
 */
export function adminLogin(username: string, password: string): AdminUser | null {
  const storage = getAdminStorage();
  const admin = storage.admins.find(a => a.username === username);

  if (!admin) {
    return null;
  }

  if (!verifyPassword(password, admin.passwordHash)) {
    return null;
  }

  // 更新最后登录时间
  admin.lastLoginAt = new Date();
  saveAdminStorage(storage);

  return admin;
}

/**
 * 创建管理员账户（初始化用）
 */
export function createAdminUser(username: string, password: string): AdminUser {
  const storage = getAdminStorage();

  // 检查用户名是否已存在
  if (storage.admins.some(a => a.username === username)) {
    throw new Error('用户名已存在');
  }

  const admin: AdminUser = {
    id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    username,
    passwordHash: hashPassword(password),
    role: storage.admins.length === 0 ? 'super-admin' : 'admin',
    createdAt: new Date()
  };

  storage.admins.push(admin);
  saveAdminStorage(storage);

  return admin;
}

/**
 * 检查是否需要初始化管理员
 */
export function needsAdminInitialization(): boolean {
  const storage = getAdminStorage();
  return storage.admins.length === 0;
}

/**
 * 导出邀请码数据为CSV
 */
export function exportInviteCodesCSV(): string {
  const codes = getAllInviteCodes();

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
export function downloadInviteCodesCSV(): void {
  const csv = exportInviteCodesCSV();
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
