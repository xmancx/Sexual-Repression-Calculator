/**
 * 管理后台主页 - 邀请码管理
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Plus,
  Download,
  Eye,
  Ban,
  CheckCircle,
  Trash2,
  LogOut,
  RefreshCw,
  Key,
  Activity,
  Users,
  TrendingUp
} from 'lucide-react';
import {
  getAllInviteCodes,
  getInviteCodeStats,
  createInviteCode,
  batchCreateInviteCodes,
  updateInviteCodeStatus,
  deleteInviteCode,
  getInviteCodeUsages,
  downloadInviteCodesCSV,
  InviteCode,
  InviteCodeType
} from '@/lib/invite-code';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getInviteCodeStats>>();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUsageDialog, setShowUsageDialog] = useState(false);
  const [selectedCode, setSelectedCode] = useState<InviteCode | null>(null);
  const [loading, setLoading] = useState(false);

  // 创建邀请码的表单状态
  const [createForm, setCreateForm] = useState({
    type: 'single' as InviteCodeType,
    count: 1,
    maxUses: 1,
    note: '',
    expiresInDays: 0
  });

  useEffect(() => {
    // 检查登录状态
    const adminSession = sessionStorage.getItem('sri_admin_session');
    if (!adminSession) {
      navigate('/admin/login');
      return;
    }

    try {
      const session = JSON.parse(adminSession);
      const expiresAt = new Date(session.expiresAt);
      if (expiresAt <= new Date()) {
        sessionStorage.removeItem('sri_admin_session');
        navigate('/admin/login');
        return;
      }
    } catch (error) {
      sessionStorage.removeItem('sri_admin_session');
      navigate('/admin/login');
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = () => {
    setCodes(getAllInviteCodes());
    setStats(getInviteCodeStats());
  };

  const handleLogout = () => {
    sessionStorage.removeItem('sri_admin_session');
    navigate('/admin/login');
  };

  const handleCreateCode = () => {
    setLoading(true);

    try {
      const expiresAt = createForm.expiresInDays > 0
        ? new Date(Date.now() + createForm.expiresInDays * 24 * 60 * 60 * 1000)
        : undefined;

      if (createForm.count === 1) {
        createInviteCode({
          type: createForm.type,
          maxUses: createForm.maxUses,
          note: createForm.note,
          expiresAt
        });
        toast.success('邀请码创建成功');
      } else {
        const newCodes = batchCreateInviteCodes(createForm.count, {
          type: createForm.type,
          maxUses: createForm.maxUses,
          note: createForm.note,
          expiresAt
        });
        toast.success(`成功创建 ${newCodes.length} 个邀请码`);
      }

      loadData();
      setShowCreateDialog(false);
      setCreateForm({
        type: 'single',
        count: 1,
        maxUses: 1,
        note: '',
        expiresInDays: 0
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableCode = (code: InviteCode) => {
    if (confirm(`确定要禁用邀请码 ${code.code} 吗？`)) {
      updateInviteCodeStatus(code.id, 'disabled');
      toast.success('邀请码已禁用');
      loadData();
    }
  };

  const handleEnableCode = (code: InviteCode) => {
    updateInviteCodeStatus(code.id, 'active');
    toast.success('邀请码已启用');
    loadData();
  };

  const handleDeleteCode = (code: InviteCode) => {
    if (confirm(`确定要删除邀请码 ${code.code} 吗？此操作不可恢复！`)) {
      deleteInviteCode(code.id);
      toast.success('邀请码已删除');
      loadData();
    }
  };

  const handleViewUsage = (code: InviteCode) => {
    setSelectedCode(code);
    setShowUsageDialog(true);
  };

  const handleExport = () => {
    try {
      downloadInviteCodesCSV();
      toast.success('导出成功');
    } catch (error) {
      toast.error('导出失败');
    }
  };

  const getStatusBadge = (status: InviteCode['status']) => {
    const variants = {
      active: { label: '激活', className: 'bg-green-500' },
      used: { label: '已用完', className: 'bg-gray-500' },
      expired: { label: '已过期', className: 'bg-yellow-500' },
      disabled: { label: '已禁用', className: 'bg-red-500' }
    };
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getTypeBadge = (type: InviteCodeType) => {
    const labels = {
      single: '单次',
      multiple: '多次',
      unlimited: '无限'
    };
    return <Badge variant="outline">{labels[type]}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* 顶部导航 */}
      <nav className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-bold text-white">管理后台</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-400 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">总邀请码</p>
                <p className="text-3xl font-bold text-white">{stats?.totalCodes || 0}</p>
              </div>
              <Key className="w-10 h-10 text-blue-400 opacity-50" />
            </div>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">激活中</p>
                <p className="text-3xl font-bold text-green-400">{stats?.activeCodes || 0}</p>
              </div>
              <Activity className="w-10 h-10 text-green-400 opacity-50" />
            </div>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">总使用次数</p>
                <p className="text-3xl font-bold text-purple-400">{stats?.totalUsages || 0}</p>
              </div>
              <Users className="w-10 h-10 text-purple-400 opacity-50" />
            </div>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">已用完</p>
                <p className="text-3xl font-bold text-yellow-400">{stats?.usedCodes || 0}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-yellow-400 opacity-50" />
            </div>
          </Card>
        </div>

        {/* 主要内容 */}
        <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700">
          <Tabs defaultValue="codes" className="w-full">
            <div className="border-b border-slate-700 px-6 pt-6">
              <TabsList className="bg-slate-700/50">
                <TabsTrigger value="codes">邀请码管理</TabsTrigger>
                <TabsTrigger value="usage">使用记录</TabsTrigger>
              </TabsList>
            </div>

            {/* 邀请码列表 */}
            <TabsContent value="codes" className="p-6">
              <div className="space-y-4">
                {/* 操作按钮 */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      创建邀请码
                    </Button>
                    <Button
                      onClick={loadData}
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      刷新
                    </Button>
                  </div>
                  <Button
                    onClick={handleExport}
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    导出CSV
                  </Button>
                </div>

                {/* 表格 */}
                <div className="border border-slate-700 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-700/50">
                      <TableRow className="border-slate-700 hover:bg-slate-700/30">
                        <TableHead className="text-slate-300">邀请码</TableHead>
                        <TableHead className="text-slate-300">类型</TableHead>
                        <TableHead className="text-slate-300">使用情况</TableHead>
                        <TableHead className="text-slate-300">状态</TableHead>
                        <TableHead className="text-slate-300">创建时间</TableHead>
                        <TableHead className="text-slate-300">过期时间</TableHead>
                        <TableHead className="text-slate-300">备注</TableHead>
                        <TableHead className="text-slate-300 text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {codes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                            暂无邀请码，点击"创建邀请码"开始
                          </TableCell>
                        </TableRow>
                      ) : (
                        codes.map((code) => (
                          <TableRow
                            key={code.id}
                            className="border-slate-700 hover:bg-slate-700/30"
                          >
                            <TableCell className="font-mono text-white">
                              {code.code}
                            </TableCell>
                            <TableCell>{getTypeBadge(code.type)}</TableCell>
                            <TableCell className="text-slate-300">
                              {code.usedCount} / {code.maxUses === -1 ? '∞' : code.maxUses}
                            </TableCell>
                            <TableCell>{getStatusBadge(code.status)}</TableCell>
                            <TableCell className="text-slate-400 text-sm">
                              {code.createdAt.toLocaleString('zh-CN')}
                            </TableCell>
                            <TableCell className="text-slate-400 text-sm">
                              {code.expiresAt
                                ? code.expiresAt.toLocaleString('zh-CN')
                                : '无'}
                            </TableCell>
                            <TableCell className="text-slate-400 text-sm max-w-[200px] truncate">
                              {code.note || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleViewUsage(code)}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {code.status === 'active' ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDisableCode(code)}
                                    className="text-yellow-400 hover:text-yellow-300"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </Button>
                                ) : code.status === 'disabled' ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEnableCode(code)}
                                    className="text-green-400 hover:text-green-300"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                ) : null}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteCode(code)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* 使用记录 */}
            <TabsContent value="usage" className="p-6">
              <div className="text-slate-400 text-center py-8">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>最近使用记录显示在这里</p>
                <p className="text-sm mt-2">共 {stats?.totalUsages || 0} 次使用</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* 创建邀请码对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>创建邀请码</DialogTitle>
            <DialogDescription className="text-slate-400">
              配置新邀请码的参数
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>邀请码类型</Label>
              <Select
                value={createForm.type}
                onValueChange={(value: InviteCodeType) =>
                  setCreateForm({ ...createForm, type: value })
                }
              >
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="single">单次使用</SelectItem>
                  <SelectItem value="multiple">多次使用</SelectItem>
                  <SelectItem value="unlimited">无限使用</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {createForm.type === 'multiple' && (
              <div className="space-y-2">
                <Label>最大使用次数</Label>
                <Input
                  type="number"
                  min={1}
                  value={createForm.maxUses}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      maxUses: parseInt(e.target.value) || 1
                    })
                  }
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>生成数量</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={createForm.count}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    count: parseInt(e.target.value) || 1
                  })
                }
                className="bg-slate-700 border-slate-600"
              />
            </div>

            <div className="space-y-2">
              <Label>有效期（天，0为永久）</Label>
              <Input
                type="number"
                min={0}
                value={createForm.expiresInDays}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    expiresInDays: parseInt(e.target.value) || 0
                  })
                }
                className="bg-slate-700 border-slate-600"
              />
            </div>

            <div className="space-y-2">
              <Label>备注（可选）</Label>
              <Input
                type="text"
                placeholder="为这批邀请码添加备注"
                value={createForm.note}
                onChange={(e) =>
                  setCreateForm({ ...createForm, note: e.target.value })
                }
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="border-slate-600"
            >
              取消
            </Button>
            <Button
              onClick={handleCreateCode}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? '创建中...' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 使用详情对话框 */}
      <Dialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>使用详情</DialogTitle>
            <DialogDescription className="text-slate-400">
              邀请码: {selectedCode?.code}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {selectedCode && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">类型</p>
                    <p className="text-white mt-1">{getTypeBadge(selectedCode.type)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">状态</p>
                    <p className="text-white mt-1">{getStatusBadge(selectedCode.status)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">使用情况</p>
                    <p className="text-white mt-1">
                      {selectedCode.usedCount} /{' '}
                      {selectedCode.maxUses === -1 ? '∞' : selectedCode.maxUses}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">创建时间</p>
                    <p className="text-white mt-1 text-xs">
                      {selectedCode.createdAt.toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <p className="text-slate-400 text-sm mb-2">使用记录</p>
                  <div className="text-slate-500 text-sm">
                    {getInviteCodeUsages(selectedCode.id).length === 0 ? (
                      <p>暂无使用记录</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {getInviteCodeUsages(selectedCode.id).map((usage) => (
                          <div
                            key={usage.id}
                            className="bg-slate-700/50 rounded p-2 text-xs"
                          >
                            <p className="text-white">
                              使用时间: {usage.usedAt.toLocaleString('zh-CN')}
                            </p>
                            <p className="text-slate-400 mt-1">
                              会话ID: {usage.sessionId.slice(0, 20)}...
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowUsageDialog(false)}
              className="bg-slate-700 hover:bg-slate-600"
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
