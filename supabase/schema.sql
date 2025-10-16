-- ==========================================
-- 性压抑指数计算器 - Supabase 数据库表结构
-- ==========================================

-- 1. 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super-admin', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 管理员表索引
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_is_active ON admins(is_active);

-- 2. 邀请码表
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('single', 'multiple', 'unlimited')),
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('active', 'used', 'expired', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  note TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 邀请码表索引
CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_status ON invite_codes(status);
CREATE INDEX idx_invite_codes_created_by ON invite_codes(created_by);
CREATE INDEX idx_invite_codes_expires_at ON invite_codes(expires_at);

-- 3. 邀请码使用记录表
CREATE TABLE IF NOT EXISTS invite_code_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES invite_codes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 使用记录表索引
CREATE INDEX idx_invite_code_usages_code_id ON invite_code_usages(code_id);
CREATE INDEX idx_invite_code_usages_session_id ON invite_code_usages(session_id);
CREATE INDEX idx_invite_code_usages_used_at ON invite_code_usages(used_at DESC);

-- ==========================================
-- 行级安全策略 (RLS)
-- ==========================================

-- 启用 RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_code_usages ENABLE ROW LEVEL SECURITY;

-- 管理员表策略
CREATE POLICY "管理员可以查看所有管理员" ON admins
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "超级管理员可以插入管理员" ON admins
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id = auth.uid()::uuid
      AND role = 'super-admin'
    )
  );

CREATE POLICY "管理员可以更新自己的信息" ON admins
  FOR UPDATE
  USING (id = auth.uid()::uuid);

-- 邀请码表策略
CREATE POLICY "管理员可以查看所有邀请码" ON invite_codes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id = auth.uid()::uuid
      AND is_active = true
    )
  );

CREATE POLICY "管理员可以创建邀请码" ON invite_codes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id = auth.uid()::uuid
      AND is_active = true
    )
  );

CREATE POLICY "管理员可以更新邀请码" ON invite_codes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id = auth.uid()::uuid
      AND is_active = true
    )
  );

CREATE POLICY "管理员可以删除邀请码" ON invite_codes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id = auth.uid()::uuid
      AND is_active = true
    )
  );

-- 使用记录表策略
CREATE POLICY "管理员可以查看所有使用记录" ON invite_code_usages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id = auth.uid()::uuid
      AND is_active = true
    )
  );

CREATE POLICY "系统可以创建使用记录" ON invite_code_usages
  FOR INSERT
  WITH CHECK (true);

-- ==========================================
-- 触发器和函数
-- ==========================================

-- 自动更新邀请码状态的函数
CREATE OR REPLACE FUNCTION update_invite_code_status()
RETURNS TRIGGER AS $$
BEGIN
  -- 检查是否达到使用上限
  IF NEW.max_uses != -1 AND NEW.used_count >= NEW.max_uses THEN
    NEW.status := 'used';
  END IF;

  -- 检查是否过期
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at < NOW() THEN
    NEW.status := 'expired';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_update_invite_code_status
BEFORE UPDATE ON invite_codes
FOR EACH ROW
EXECUTE FUNCTION update_invite_code_status();

-- 增加邀请码使用次数的函数
CREATE OR REPLACE FUNCTION increment_invite_code_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invite_codes
  SET used_count = used_count + 1
  WHERE id = NEW.code_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_increment_usage
AFTER INSERT ON invite_code_usages
FOR EACH ROW
EXECUTE FUNCTION increment_invite_code_usage();

-- ==========================================
-- 视图
-- ==========================================

-- 邀请码统计视图
CREATE OR REPLACE VIEW invite_code_stats AS
SELECT
  COUNT(*) AS total_codes,
  COUNT(*) FILTER (WHERE status = 'active') AS active_codes,
  COUNT(*) FILTER (WHERE status = 'used') AS used_codes,
  COUNT(*) FILTER (WHERE status = 'expired') AS expired_codes,
  COUNT(*) FILTER (WHERE status = 'disabled') AS disabled_codes,
  (SELECT COUNT(*) FROM invite_code_usages) AS total_usages
FROM invite_codes;

-- 邀请码详细信息视图（包含创建者信息）
CREATE OR REPLACE VIEW invite_codes_with_creator AS
SELECT
  ic.*,
  a.username AS creator_username,
  a.role AS creator_role
FROM invite_codes ic
LEFT JOIN admins a ON ic.created_by = a.id;

-- ==========================================
-- 初始数据
-- ==========================================

-- 插入默认超级管理员（密码：admin123，需要使用bcrypt加密）
-- 注意：这里的密码哈希需要在应用层生成
-- INSERT INTO admins (username, password_hash, role)
-- VALUES ('admin', '$2a$10$...(bcrypt hash)', 'super-admin');

-- ==========================================
-- 有用的查询函数
-- ==========================================

-- 验证邀请码的函数
CREATE OR REPLACE FUNCTION validate_invite_code(p_code TEXT)
RETURNS TABLE (
  valid BOOLEAN,
  code_id UUID,
  reason TEXT,
  code_data JSONB
) AS $$
DECLARE
  v_code invite_codes%ROWTYPE;
BEGIN
  -- 查找邀请码
  SELECT * INTO v_code FROM invite_codes WHERE code = p_code;

  -- 邀请码不存在
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::uuid, '邀请码不存在'::text, NULL::jsonb;
    RETURN;
  END IF;

  -- 检查状态
  IF v_code.status != 'active' THEN
    RETURN QUERY SELECT
      false,
      v_code.id,
      '邀请码已失效'::text,
      row_to_json(v_code)::jsonb;
    RETURN;
  END IF;

  -- 检查过期
  IF v_code.expires_at IS NOT NULL AND v_code.expires_at < NOW() THEN
    -- 更新状态为过期
    UPDATE invite_codes SET status = 'expired' WHERE id = v_code.id;
    RETURN QUERY SELECT
      false,
      v_code.id,
      '邀请码已过期'::text,
      row_to_json(v_code)::jsonb;
    RETURN;
  END IF;

  -- 检查使用次数
  IF v_code.max_uses != -1 AND v_code.used_count >= v_code.max_uses THEN
    -- 更新状态为已用完
    UPDATE invite_codes SET status = 'used' WHERE id = v_code.id;
    RETURN QUERY SELECT
      false,
      v_code.id,
      '邀请码使用次数已达上限'::text,
      row_to_json(v_code)::jsonb;
    RETURN;
  END IF;

  -- 验证通过
  RETURN QUERY SELECT
    true,
    v_code.id,
    '验证成功'::text,
    row_to_json(v_code)::jsonb;
END;
$$ LANGUAGE plpgsql;

-- 获取统计数据的函数
CREATE OR REPLACE FUNCTION get_invite_stats()
RETURNS TABLE (
  total_codes BIGINT,
  active_codes BIGINT,
  used_codes BIGINT,
  expired_codes BIGINT,
  disabled_codes BIGINT,
  total_usages BIGINT,
  recent_usages JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_codes,
    COUNT(*) FILTER (WHERE status = 'active')::BIGINT AS active_codes,
    COUNT(*) FILTER (WHERE status = 'used')::BIGINT AS used_codes,
    COUNT(*) FILTER (WHERE status = 'expired')::BIGINT AS expired_codes,
    COUNT(*) FILTER (WHERE status = 'disabled')::BIGINT AS disabled_codes,
    (SELECT COUNT(*)::BIGINT FROM invite_code_usages) AS total_usages,
    (
      SELECT jsonb_agg(row_to_json(u))
      FROM (
        SELECT * FROM invite_code_usages
        ORDER BY used_at DESC
        LIMIT 10
      ) u
    ) AS recent_usages
  FROM invite_codes;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 注释
-- ==========================================

COMMENT ON TABLE admins IS '管理员账户表';
COMMENT ON TABLE invite_codes IS '邀请码表';
COMMENT ON TABLE invite_code_usages IS '邀请码使用记录表';

COMMENT ON COLUMN invite_codes.type IS '邀请码类型: single=单次, multiple=多次, unlimited=无限';
COMMENT ON COLUMN invite_codes.max_uses IS '最大使用次数，-1表示无限';
COMMENT ON COLUMN invite_codes.status IS '状态: active=激活, used=已用完, expired=过期, disabled=禁用';

COMMENT ON FUNCTION validate_invite_code IS '验证邀请码是否有效';
COMMENT ON FUNCTION get_invite_stats IS '获取邀请码统计信息';
