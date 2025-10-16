/**
 * 主页组件 - 性压抑指数计算器的首页
 * 提供评估介绍、快速开始入口和功能说明
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github } from "lucide-react";
import { 
  Brain, 
  Clock, 
  Shield, 
  Users, 
  BarChart3, 
  FileText, 
  Heart,
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  BookOpen,
  Target,
  History
} from 'lucide-react';
import { Menu } from 'lucide-react'; // 添加菜单图标
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { hasValidUserInviteCode, getUserInviteCode, validateInviteCode, useInviteCode } from '@/lib/invite-code';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle as CheckCircleIcon, Key, X, AlertCircle } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hasValidCode, setHasValidCode] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState('');

  useEffect(() => {
    // 检查是否有有效的邀请码
    const valid = hasValidUserInviteCode();
    setHasValidCode(valid);

    // 如果没有有效邀请码，自动弹出邀请码输入窗口
    if (!valid) {
      setTimeout(() => setShowInviteDialog(true), 1000); // 延迟1秒显示，让用户先看到页面
    }

    // 检查是否刚刚验证成功
    if (searchParams.get('verified') === 'true') {
      const code = getUserInviteCode();
      if (code) {
        setShowSuccessMessage(true);
        // 5秒后隐藏成功消息
        setTimeout(() => setShowSuccessMessage(false), 5000);
      }
    }
  }, [searchParams]);

  // 处理邀请码验证
  const handleInviteCodeSubmit = async () => {
    if (!inviteCodeInput.trim()) {
      setCodeError('请输入邀请码');
      return;
    }

    setValidatingCode(true);
    setCodeError('');

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    const validation = validateInviteCode(inviteCodeInput.trim().toUpperCase());

    setValidatingCode(false);

    if (validation.valid) {
      // 验证成功，使用邀请码并保存用户状态
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const success = useInviteCode(inviteCodeInput.trim().toUpperCase(), sessionId);

      if (success) {
        setShowInviteDialog(false);
        setInviteCodeInput('');
        setHasValidCode(true);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
      } else {
        setCodeError('邀请码使用失败，请重试');
      }
    } else {
      setCodeError(validation.reason || '邀请码无效');
    }
  };

  const handleStartAssessment = (type: 'quick' | 'full') => {
    // 实时检查邀请码状态，而不是依赖状态变量
    const hasValidCode = hasValidUserInviteCode();
    if (!hasValidCode) {
      // 没有有效邀请码，跳转到邀请码输入页面
      navigate('/invite');
    } else {
      // 有有效邀请码，直接开始测评
      navigate(`/assessment?type=${type}`);
    }
  };

  return (
    <div className="min-h-screen sri-gradient-hero relative">
      {/* 增强的背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-8 h-8 bg-psychology-primary/10 rounded-full sri-floating-element"></div>
        <div className="absolute top-40 right-32 w-12 h-12 bg-psychology-accent/15 rounded-full sri-floating-element" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-1/4 w-6 h-6 bg-psychology-secondary/10 rounded-full sri-floating-element" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 right-20 w-10 h-10 bg-psychology-primary/8 rounded-full sri-floating-element" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/3 left-1/6 w-16 h-16 bg-psychology-gradient_2/5 rounded-full sri-glow-effect"></div>
        <div className="absolute bottom-1/3 right-1/6 w-20 h-20 bg-psychology-gradient_3/4 rounded-full sri-glow-effect" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10">
        {/* 导航栏 */}
        <nav className="sri-nav-blur sticky top-0 z-50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-psychology-primary to-psychology-primary_dark rounded-xl flex items-center justify-center shadow-soft">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-xl text-psychology-primary">SRI Calculator</h1>
                  <p className="text-sm text-muted-foreground">性压抑指数计算器</p>
                </div>
              </div>
            
          {/* 移动端菜单 - 只在小屏幕上显示 */}
<div className="md:hidden">
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="ghost" size="sm">
        <Menu className="w-5 h-5" />
      </Button>
    </SheetTrigger>
    <SheetContent side="right">
      <div className="flex flex-col gap-4 mt-4">
        <Button variant="ghost" size="sm" asChild className="justify-start">
          <Link to="/guide" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            使用指南
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="justify-start">
          <Link to="/science" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            科学依据
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="justify-start">
          <Link to="/history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            历史记录
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="justify-start">
          <a 
            href="https://github.com/lamos22/Sexual-Repression-Calculator" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Github className="w-4 h-4" />
            GitHub仓库地址
          </a>
        </Button>
      </div>
    </SheetContent>
  </Sheet>
</div>
            {/* 桌面端菜单 */}
            {/* <div className="flex items-center gap-1 sm:gap-4"> */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="h-auto py-1.5">
                <Link to="/guide" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-[10px] sm:text-sm">使用指南</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="h-auto py-1.5">
                <Link to="/science" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-[10px] sm:text-sm">科学依据</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="h-auto py-1.5">
                <Link to="/history" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2">
                  <History className="w-4 h-4" />
                  <span className="text-[10px] sm:text-sm">历史记录</span>
                </Link>
              </Button>
              {/* GitHub 链接 */}
  <Button variant="ghost" size="sm" asChild>
    <a 
      href="https://github.com/banlanzs/Sexual-Repression-Calculator" 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center"
    >
      <Github className="w-4 h-4" />
    </a>
  </Button>
            </div>
          </div>
          </div>
        </nav>

        {/* 主要内容区域 */}
        <main className="container mx-auto px-4 pb-12">
          {/* 英雄区域 */}
          <section className="text-center mb-12 animate-fade-in-up">
            <div className="max-w-4xl mx-auto">
              <div className="sri-hero-badge mb-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
                <Heart className="w-5 h-5 mr-2" />
                基于科学研究的心理测评工具
              </div>

              <h1 className="sri-heading mb-6 animate-fade-in" style={{animationDelay: '0.3s'}}>
                性压抑指数计算器
              </h1>

              <p className="sri-text mb-8 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.4s'}}>
                专业的性心理健康自我评估工具，基于多个经过验证的心理测量量表，
                帮助您科学地了解自己的性心理特征，促进性健康和亲密关系的发展。
              </p>
              
              {/* 邀请码验证成功提示 */}
              {showSuccessMessage && (
                <div className="sri-card-featured max-w-3xl mx-auto mb-6 border-green-300 bg-green-50 animate-fade-in" style={{animationDelay: '0.5s'}}>
                  <div className="flex items-start gap-4 p-5">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-base text-green-800 mb-1">邀请码验证成功！</h3>
                      <p className="text-green-700 text-sm leading-relaxed">
                        恭喜您！现在您可以开始使用所有测评功能。系统已记录您的验证状态，您可以随时开始测评。
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600">认证状态：已验证</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 已验证用户状态显示 */}
              {hasValidCode && !showSuccessMessage && (
                <div className="sri-card max-w-3xl mx-auto mb-6 border-psychology-primary/30 bg-psychology-primary/5 animate-fade-in" style={{animationDelay: '0.5s'}}>
                  <div className="flex items-center gap-4 p-5">
                    <div className="w-10 h-10 bg-psychology-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="h-5 w-5 text-psychology-primary" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-bold text-base text-psychology-primary mb-1">邀请码已认证</h3>
                      <p className="text-psychology-primary/80 text-sm leading-relaxed">
                        您的邀请码已通过验证，可以正常使用所有测评功能。享受专业的心理健康评估体验！
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-psychology-primary">
                      <div className="w-2 h-2 bg-psychology-primary rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium">已验证</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 邀请码状态提示 - 仅在未验证且弹窗未显示时显示 */}
              {!hasValidCode && !showInviteDialog && (
                <div className="sri-card max-w-2xl mx-auto mb-6 border-blue-200 bg-blue-50 animate-fade-in" style={{animationDelay: '0.5s'}}>
                  <div className="flex items-center gap-3 p-4">
                    <Key className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <AlertDescription className="text-blue-800 font-medium text-sm">
                      使用本工具需要邀请码。点击下方按钮输入邀请码后即可开始测评。
                    </AlertDescription>
                  </div>
                </div>
              )}

              {/* 适应性评估亮点 */}
              <div className="sri-card-featured max-w-3xl mx-auto mb-8 animate-fade-in" style={{animationDelay: '0.6s'}}>
                <div className="flex items-start gap-4 p-5">
                  <div className="w-10 h-10 bg-psychology-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-psychology-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-base text-psychology-primary mb-2">智能适应性评估</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      系统会根据您的年龄段和个人背景自动选择最适合的量表组合，为14-17岁青少年提供专门的保护机制，
                      为无性经验用户提供文化敏感的评估内容，确保每个人都能获得准确和适宜的评估体验。
                    </p>
                  </div>
                </div>
              </div>

  
              </div>
          </section>

          {/* 核心指标展示 */}
          <section className="mb-16">
            <div className="text-center mb-10">
              <h2 className="sri-subheading mb-3 text-center">评估亮点</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                快速了解我们的核心优势
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="sri-stat-card animate-fade-in" style={{animationDelay: '0.1s'}}>
                <div className="w-12 h-12 bg-psychology-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-psychology-primary" />
                </div>
                <div className="text-2xl font-bold text-psychology-primary mb-1">8-15</div>
                <div className="text-xs text-muted-foreground font-medium">分钟快测</div>
              </div>

              <div className="sri-stat-card animate-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="w-12 h-12 bg-psychology-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-psychology-secondary" />
                </div>
                <div className="text-2xl font-bold text-psychology-secondary mb-1">4</div>
                <div className="text-xs text-muted-foreground font-medium">核心维度</div>
              </div>

              <div className="sri-stat-card animate-fade-in" style={{animationDelay: '0.3s'}}>
                <div className="w-12 h-12 bg-psychology-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-psychology-accent" />
                </div>
                <div className="text-2xl font-bold text-psychology-accent mb-1">100%</div>
                <div className="text-xs text-muted-foreground font-medium">隐私保护</div>
              </div>

              <div className="sri-stat-card animate-fade-in" style={{animationDelay: '0.4s'}}>
                <div className="w-12 h-12 bg-psychology-success/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-psychology-success" />
                </div>
                <div className="text-2xl font-bold text-psychology-success mb-1">科学</div>
                <div className="text-xs text-muted-foreground font-medium">研究验证</div>
              </div>
            </div>
          </section>

          {/* 测评版本选择 */}
          <section className="mb-16">
            <div className="text-center mb-10">
              <h2 className="sri-subheading mb-3">选择适合您的测评版本</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                我们提供两种测评版本，您可以根据可用时间和详细程度需求选择
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* 快测版 */}
              <Card className="sri-card-featured relative overflow-hidden group hover:scale-[1.03] transition-all duration-500 animate-fade-in" style={{animationDelay: '0.1s'}}>
                <div className="absolute top-4 right-4">
                  <div className="sri-hero-badge">
                    <Star className="w-4 h-4 mr-1" />
                    推荐
                  </div>
                </div>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-psychology-primary to-psychology-primary_dark rounded-xl flex items-center justify-center shadow-soft">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-psychology-primary mb-1">快速测评版</CardTitle>
                      <p className="text-sm text-muted-foreground font-medium">适合初次使用和快速了解</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-2 bg-psychology-primary/5 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-psychology-success flex-shrink-0" />
                      <span className="text-sm font-medium">SIS/SES-SF 14项量表</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-psychology-primary/5 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-psychology-success flex-shrink-0" />
                      <span className="text-sm font-medium">Mosher性内疚10项简版</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-psychology-primary/5 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-psychology-success flex-shrink-0" />
                      <span className="text-sm font-medium">KISS-9性羞耻量表</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-psychology-primary/5 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-psychology-success flex-shrink-0" />
                      <span className="text-sm font-medium">SOS性观感筛查版</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-psychology-primary/10 to-psychology-primary_light/10 p-4 rounded-xl border border-psychology-primary/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-psychology-primary">预计用时</span>
                      <span className="text-sm font-bold text-psychology-primary">8-15 分钟</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-psychology-primary">题目数量</span>
                      <span className="text-sm font-bold text-psychology-primary">33-42 题</span>
                    </div>
                  </div>

                  <Button
                    className="sri-button-primary w-full"
                    onClick={() => handleStartAssessment('quick')}
                  >
                    开始快速测评
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* 完整版 */}
              <Card className="sri-card-interactive relative overflow-hidden group hover:scale-[1.03] transition-all duration-500 animate-fade-in" style={{animationDelay: '0.2s'}}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-psychology-secondary to-psychology-secondary rounded-xl flex items-center justify-center shadow-soft">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-psychology-secondary mb-1">完整测评版</CardTitle>
                      <p className="text-sm text-muted-foreground font-medium">更全面深入的专业分析</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-2 bg-psychology-secondary/5 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-psychology-success flex-shrink-0" />
                      <span className="text-sm font-medium">完整版SIS/SES量表</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-psychology-secondary/5 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-psychology-success flex-shrink-0" />
                      <span className="text-sm font-medium">完整Mosher性内疚量表</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-psychology-secondary/5 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-psychology-success flex-shrink-0" />
                      <span className="text-sm font-medium">KISS-9 + 额外维度分析</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-psychology-secondary/5 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-psychology-success flex-shrink-0" />
                      <span className="text-sm font-medium">BSAS性态度量表校标</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-psychology-secondary/10 to-psychology-secondary/10 p-4 rounded-xl border border-psychology-secondary/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-psychology-secondary">预计用时</span>
                      <span className="text-sm font-bold text-psychology-secondary">25-40 分钟</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-psychology-secondary">题目数量</span>
                      <span className="text-sm font-bold text-psychology-secondary">58-126 题</span>
                    </div>
                  </div>

                  <Button
                    className="sri-button-outline w-full"
                    onClick={() => handleStartAssessment('full')}
                  >
                    开始完整测评
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* 科学性说明 */}
          <section className="mb-16">
            <div className="text-center mb-10">
              <h2 className="sri-subheading mb-3">科学可靠的评估基础</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                基于国际认可的心理测量学量表，经过严格验证的科学工具
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="sri-feature-card animate-fade-in" style={{animationDelay: '0.1s'}}>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-base mb-2">双控制模型</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">基于Janssen等人的SIS/SES双控制模型，测量性抑制和性兴奋系统</p>
              </div>

              <div className="sri-feature-card animate-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-base mb-2">性内疚测量</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">采用Mosher性内疚量表，评估性相关的内疚感和道德负担</p>
              </div>

              <div className="sri-feature-card animate-fade-in" style={{animationDelay: '0.3s'}}>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-bold text-base mb-2">性羞耻评估</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">使用KISS-9量表测量性相关的羞耻体验和自我接纳</p>
              </div>

              <div className="sri-feature-card animate-fade-in" style={{animationDelay: '0.4s'}}>
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-base mb-2">性观感调查</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">SOS量表评估对性刺激的情绪取向和接近回避倾向</p>
              </div>
            </div>
          </section>

          {/* 隐私保护承诺 */}
          <section className="mb-16">
            <div className="sri-card-featured max-w-3xl mx-auto">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-psychology-primary to-psychology-primary_light rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft sri-glow-effect">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="sri-subheading mb-4">您的隐私是我们的首要关注</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  所有评估数据仅在您的设备本地处理和存储，不会上传到任何服务器。
                  您拥有完全的数据控制权，可以随时删除或导出您的评估历史。
                </p>
                <div className="grid md:grid-cols-3 gap-6 max-w-lg mx-auto">
                  <div className="flex flex-col items-center gap-2 p-3">
                    <div className="w-10 h-10 bg-psychology-success/10 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-psychology-success" />
                    </div>
                    <span className="text-sm font-medium">本地数据存储</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3">
                    <div className="w-10 h-10 bg-psychology-success/10 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-psychology-success" />
                    </div>
                    <span className="text-sm font-medium">完全匿名化</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3">
                    <div className="w-10 h-10 bg-psychology-success/10 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-psychology-success" />
                    </div>
                    <span className="text-sm font-medium">可随时删除</span>
                  </div>
                </div>
              </CardContent>
            </div>
          </section>

          {/* CTA区域 */}
          <section className="text-center mb-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="sri-subheading mb-4">准备好开始您的性心理健康之旅了吗？</h2>
              <p className="text-muted-foreground mb-6">
                通过科学的自我评估，更好地了解自己，促进健康的性心理发展和亲密关系。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="sri-button-accent" asChild>
                  <Link to="/guide">
                    <BookOpen className="w-4 h-4 mr-2" />
                    了解更多信息
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        {/* 页脚 */}
        <footer className="sri-nav-blur border-t">
          <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-psychology-primary to-psychology-primary_dark rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-lg text-psychology-primary">SRI Calculator</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  基于科学研究的性压抑指数计算器，帮助您更好地了解自己的性心理健康。
                </p>
              </div>

              <div>
                <h4 className="font-bold text-base mb-4 text-foreground">评估工具</h4>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/assessment?type=quick" className="text-muted-foreground hover:text-psychology-primary transition-colors">快速测评</Link></li>
                  <li><Link to="/assessment?type=full" className="text-muted-foreground hover:text-psychology-primary transition-colors">完整测评</Link></li>
                  <li><Link to="/history" className="text-muted-foreground hover:text-psychology-primary transition-colors">历史记录</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-base mb-4 text-foreground">资源</h4>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/guide" className="text-muted-foreground hover:text-psychology-primary transition-colors">使用指南</Link></li>
                  <li><Link to="/science" className="text-muted-foreground hover:text-psychology-primary transition-colors">科学依据</Link></li>
                  <li><a href="#" className="text-muted-foreground hover:text-psychology-primary transition-colors">隐私政策</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-base mb-4 text-foreground">支持</h4>
                <ul className="space-y-3 text-sm">
                  <li><a href="#" className="text-muted-foreground hover:text-psychology-primary transition-colors">常见问题</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-psychology-primary transition-colors">专业咨询</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-psychology-primary transition-colors">危机资源</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-psychology-neutral/40 mt-8 pt-6 text-center text-sm text-muted-foreground">
              <p>© 2025 性压抑指数计算器. 仅供教育和自我了解使用，不能替代专业心理健康服务。</p>
            </div>
          </div>
        </footer>

        {/* 邀请码输入弹窗 */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="max-w-md w-full sri-card p-8">
            <DialogHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-psychology-primary/10 rounded-xl flex items-center justify-center">
                  <Key className="w-6 h-6 text-psychology-primary" />
                </div>
                <DialogTitle className="text-xl font-bold text-psychology-primary">
                  输入邀请码
                </DialogTitle>
              </div>
              <DialogDescription className="text-base text-muted-foreground">
                请输入您的邀请码以使用性压抑指数计算器
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-code-dialog">邀请码</Label>
                <Input
                  id="invite-code-dialog"
                  type="text"
                  placeholder="输入12位邀请码"
                  value={inviteCodeInput}
                  onChange={(e) => {
                    setInviteCodeInput(e.target.value.toUpperCase());
                    setCodeError('');
                  }}
                  maxLength={20}
                  className="text-center text-lg tracking-wider font-mono"
                  disabled={validatingCode}
                  autoFocus
                />
              </div>

              {/* 错误提示 */}
              {codeError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{codeError}</AlertDescription>
                </Alert>
              )}

              {/* 提交按钮 */}
              <Button
                onClick={handleInviteCodeSubmit}
                className="sri-button-primary w-full"
                disabled={validatingCode || !inviteCodeInput.trim()}
              >
                {validatingCode ? (
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

              {/* 帮助信息 */}
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
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
