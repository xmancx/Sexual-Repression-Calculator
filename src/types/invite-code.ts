/**
 * 邀请码系统类型定义
 */

// 邀请码状态
export type InviteCodeStatus = 'active' | 'used' | 'expired' | 'disabled';

// 邀请码类型
export type InviteCodeType = 'single' | 'multiple' | 'unlimited';

// 邀请码数据结构
export interface InviteCode {
  id: string;
  code: string; // 邀请码
  type: InviteCodeType; // 类型
  maxUses: number; // 最大使用次数 (-1 表示无限)
  usedCount: number; // 已使用次数
  status: InviteCodeStatus; // 状态
  createdAt: Date; // 创建时间
  expiresAt?: Date; // 过期时间
  createdBy: string; // 创建者
  note?: string; // 备注
  metadata?: Record<string, any>; // 额外元数据
}

// 邀请码使用记录
export interface InviteCodeUsage {
  id: string;
  codeId: string;
  code: string;
  usedAt: Date;
  sessionId: string; // 关联的测评会话ID
  userAgent?: string;
  ipAddress?: string; // 客户端IP（如果可获取）
}

// 管理员用户
export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  role: 'super-admin' | 'admin';
  createdAt: Date;
  lastLoginAt?: Date;
}

// 邀请码统计数据
export interface InviteCodeStats {
  totalCodes: number;
  activeCodes: number;
  usedCodes: number;
  expiredCodes: number;
  disabledCodes: number;
  totalUsages: number;
  recentUsages: InviteCodeUsage[];
}

// 管理后台存储数据
export interface AdminStorageData {
  inviteCodes: InviteCode[];
  usages: InviteCodeUsage[];
  admins: AdminUser[];
  version: string;
}

// 邀请码验证结果
export interface InviteCodeValidation {
  valid: boolean;
  code?: InviteCode;
  reason?: string; // 失败原因
}

// 邀请码生成选项
export interface InviteCodeGenerateOptions {
  type: InviteCodeType;
  maxUses?: number;
  expiresAt?: Date;
  note?: string;
  prefix?: string; // 自定义前缀
  length?: number; // 邀请码长度
}
