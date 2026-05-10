-- =====================================================
-- Secure Users Table for Authentication
-- =====================================================
-- This script creates a secure users table with proper
-- password hashing and role-based access control
-- =====================================================

-- Drop existing table if exists (CAUTION: This will delete all users!)
-- DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- PBKDF2-SHA256 hash
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'employee',
  is_active BOOLEAN DEFAULT true,
  is_locked BOOLEAN DEFAULT false,
  failed_login_attempts INTEGER DEFAULT 0,
  last_login_at TIMESTAMP,
  last_login_ip VARCHAR(45),
  password_changed_at TIMESTAMP DEFAULT NOW(),
  must_change_password BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  
  -- Constraints
  CONSTRAINT valid_role CHECK (role IN (
    'super_admin', 
    'admin', 
    'hr_manager', 
    'finance_manager', 
    'compliance_officer', 
    'employee'
  )),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT username_length CHECK (LENGTH(username) >= 3 AND LENGTH(username) <= 50)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- =====================================================
-- User Permissions Table
-- =====================================================

CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission VARCHAR(100) NOT NULL,
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by UUID REFERENCES users(id),
  
  UNIQUE(user_id, permission)
);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);

-- =====================================================
-- Audit Log Table
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  username VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  resource_id UUID,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20) NOT NULL, -- success, failure, error
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);

-- =====================================================
-- Session Management Table (Optional - for token blacklist)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_jti VARCHAR(255) UNIQUE NOT NULL, -- JWT ID for token revocation
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_jti ON user_sessions(token_jti);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

-- Policy: Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('super_admin', 'admin')
    )
  );

-- Policy: Only admins can insert users
CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('super_admin', 'admin')
    )
  );

-- Policy: Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (
    -- Users cannot change their own role or active status
    role = (SELECT role FROM users WHERE id::text = auth.uid()::text)
    AND is_active = (SELECT is_active FROM users WHERE id::text = auth.uid()::text)
  );

-- Policy: Admins can update any user
CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('super_admin', 'admin')
    )
  );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function: Get user by username
CREATE OR REPLACE FUNCTION get_user_by_username(p_username VARCHAR)
RETURNS TABLE (
  id UUID,
  username VARCHAR,
  email VARCHAR,
  password_hash TEXT,
  full_name VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  is_locked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.email,
    u.password_hash,
    u.full_name,
    u.role,
    u.is_active,
    u.is_locked
  FROM users u
  WHERE u.username = p_username
  AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Record login attempt
CREATE OR REPLACE FUNCTION record_login_attempt(
  p_user_id UUID,
  p_success BOOLEAN,
  p_ip_address VARCHAR,
  p_user_agent TEXT
)
RETURNS VOID AS $$
BEGIN
  IF p_success THEN
    -- Successful login: reset failed attempts and update last login
    UPDATE users
    SET 
      failed_login_attempts = 0,
      last_login_at = NOW(),
      last_login_ip = p_ip_address,
      is_locked = false
    WHERE id = p_user_id;
  ELSE
    -- Failed login: increment failed attempts
    UPDATE users
    SET failed_login_attempts = failed_login_attempts + 1
    WHERE id = p_user_id;
    
    -- Lock account after 5 failed attempts
    UPDATE users
    SET is_locked = true
    WHERE id = p_user_id
    AND failed_login_attempts >= 5;
  END IF;
  
  -- Log the attempt
  INSERT INTO audit_logs (user_id, action, status, ip_address, user_agent, details)
  VALUES (
    p_user_id,
    'login_attempt',
    CASE WHEN p_success THEN 'success' ELSE 'failure' END,
    p_ip_address,
    p_user_agent,
    jsonb_build_object('success', p_success)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user is locked
CREATE OR REPLACE FUNCTION is_user_locked(p_username VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_locked BOOLEAN;
BEGIN
  SELECT is_locked INTO v_locked
  FROM users
  WHERE username = p_username;
  
  RETURN COALESCE(v_locked, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant Permissions
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT ON users TO authenticated;
GRANT SELECT ON user_permissions TO authenticated;
GRANT INSERT ON audit_logs TO authenticated;
GRANT SELECT, INSERT ON user_sessions TO authenticated;

-- Grant all permissions to service role (for API)
GRANT ALL ON users TO service_role;
GRANT ALL ON user_permissions TO service_role;
GRANT ALL ON audit_logs TO service_role;
GRANT ALL ON user_sessions TO service_role;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE users IS 'Secure user authentication table with password hashing';
COMMENT ON COLUMN users.password_hash IS 'PBKDF2-SHA256 hashed password (format: iterations$salt$hash)';
COMMENT ON COLUMN users.failed_login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN users.is_locked IS 'Account locked after 5 failed login attempts';
COMMENT ON TABLE audit_logs IS 'Audit trail for all user actions and security events';
COMMENT ON TABLE user_sessions IS 'Active user sessions for token management and revocation';

-- =====================================================
-- Success Message
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Users table created successfully!';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '   1. Run seed-admin-user.sql to create initial admin user';
  RAISE NOTICE '   2. Update JWT_SECRET in environment variables';
  RAISE NOTICE '   3. Deploy updated authentication code';
END $$;
