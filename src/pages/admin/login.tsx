/**
 * 管理后台登录页面
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ArrowLeft, AlertTriangle } from 'lucide-react';
import {
  adminLogin,
  needsAdminInitialization,
  createAdminUser
} from '@/lib/invite-code';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInitMode, setIsInitMode] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // 检查是否需要初始化管理员
    setIsInitMode(needsAdminInitialization());

    // 检查是否已登录
    const adminSession = sessionStorage.getItem('sri_admin_session');
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        const expiresAt = new Date(session.expiresAt);
        if (expiresAt > new Date()) {
          // 会话有效，直接跳转
          navigate('/admin/dashboard');
          return;
        }
      } catch (error) {
        console.error('Invalid session:', error);
        sessionStorage.removeItem('sri_admin_session');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    if (isInitMode) {
      // 初始化模式：创建管理员
      if (password !== confirmPassword) {
        setError('两次密码输入不一致');
        return;
      }

      if (password.length < 6) {
        setError('密码长度至少6位');
        return;
      }

      setLoading(true);

      try {
        const admin = createAdminUser(username, password);

        // 创建会话
        const session = {
          adminId: admin.id,
          username: admin.username,
          role: admin.role,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时
        };

        sessionStorage.setItem('sri_admin_session', JSON.stringify(session));

        // 跳转到管理后台
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } catch (err) {
        setError(err instanceof Error ? err.message : '创建管理员失败');
      } finally {
        setLoading(false);
      }
    } else {
      // 登录模式
      setLoading(true);

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      const admin = adminLogin(username, password);

      if (admin) {
        // 创建会话
        const session = {
          adminId: admin.id,
          username: admin.username,
          role: admin.role,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时
        };

        sessionStorage.setItem('sri_admin_session', JSON.stringify(session));

        // 跳转到管理后台
        navigate('/admin/dashboard');
      } else {
        setError('用户名或密码错误');
      }

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-4 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>

        <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700 p-8 shadow-2xl">
          <div className="space-y-6">
            {/* 头部 */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {isInitMode ? '初始化管理员' : '管理后台登录'}
                </h1>
                <p className="text-sm text-slate-400">
                  {isInitMode
                    ? '首次使用，请创建管理员账户'
                    : '请使用管理员账户登录'}
                </p>
              </div>
            </div>

            {/* 初始化提示 */}
            {isInitMode && (
              <Alert className="bg-yellow-500/10 border-yellow-500/50 text-yellow-400">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  首次使用需要创建管理员账户，请妥善保管用户名和密码
                </AlertDescription>
              </Alert>
            )}

            {/* 表单 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">
                  用户名
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="输入用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  密码
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={loading}
                />
              </div>

              {/* 初始化模式下的确认密码 */}
              {isInitMode && (
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-slate-300">
                    确认密码
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="再次输入密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    disabled={loading}
                  />
                </div>
              )}

              {/* 错误提示 */}
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
                  <AlertDescription className="text-red-400 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* 提交按钮 */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {isInitMode ? '创建中...' : '登录中...'}
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    {isInitMode ? '创建管理员' : '登录'}
                  </>
                )}
              </Button>
            </form>
          </div>
        </Card>

        {/* 页脚 */}
        <div className="text-center mt-6 text-xs text-slate-500">
          <p>SRI Calculator Admin Panel v1.0</p>
          <p className="mt-1">请勿将管理员账户泄露给他人</p>
        </div>
      </div>
    </div>
  );
}
