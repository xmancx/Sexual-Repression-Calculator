/**
 * 邀请码输入页面
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, CheckCircle, XCircle, ArrowLeft, Home } from 'lucide-react';
import { validateInviteCode, useInviteCode } from '@/lib/invite-code';

export default function InviteCodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('请输入邀请码');
      return;
    }

    setValidating(true);

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    const validation = validateInviteCode(code.trim().toUpperCase());

    setValidating(false);

    if (validation.valid) {
      // 验证成功，使用邀请码并保存用户状态
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const success = useInviteCode(code.trim().toUpperCase(), sessionId);

      if (success) {
        // 使用成功，跳转到主页
        navigate('/?verified=true');
      } else {
        setError('邀请码使用失败，请重试');
      }
    } else {
      setError(validation.reason || '邀请码无效');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-psychology-calm via-white to-psychology-warm flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>

        <Card className="sri-card p-8">
          <div className="space-y-6">
            {/* 头部 */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-psychology-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Key className="w-8 h-8 text-psychology-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-psychology-primary mb-2">
                  输入邀请码
                </h1>
                <p className="text-sm text-muted-foreground">
                  请输入您的邀请码以使用性压抑指数计算器
                </p>
              </div>
            </div>

            {/* 表单 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-code">邀请码</Label>
                <Input
                  id="invite-code"
                  type="text"
                  placeholder="输入12位邀请码"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={20}
                  className="text-center text-lg tracking-wider font-mono"
                  disabled={validating}
                  autoFocus
                />
              </div>

              {/* 错误提示 */}
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* 提交按钮 */}
              <Button
                type="submit"
                className="w-full bg-psychology-primary hover:bg-psychology-primary/90"
                disabled={validating || !code.trim()}
              >
                {validating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    验证中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    验证邀请码
                  </>
                )}
              </Button>
            </form>

            {/* 帮助信息 */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Home className="w-4 h-4" />
                如何获取邀请码？
              </h3>
              <p className="text-xs text-muted-foreground">
                如果您还没有邀请码，请联系管理员获取。邀请码是为了确保测评质量和数据安全。
              </p>
            </div>

            {/* 管理员入口 */}
            <div className="text-center">
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate('/admin/login')}
                className="text-xs text-muted-foreground"
              >
                管理员登录
              </Button>
            </div>
          </div>
        </Card>

        {/* 页脚 */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>性压抑指数计算器 v1.0</p>
          <p className="mt-1">基于科学研究的专业性心理健康评估工具</p>
        </div>
      </div>
    </div>
  );
}
