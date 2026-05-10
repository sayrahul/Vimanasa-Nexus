-- =====================================================
-- QUICK FIX - Create Users Table and Admin User
-- =====================================================
-- This script will:
-- 1. Create the users table
-- 2. Create supporting tables
-- 3. Add an admin user with password: Vimanasa@2026
-- 
-- ⚠️ CHANGE THE PASSWORD AFTER FIRST LOGIN!
-- =====================================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
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
  
  CONSTRAINT valid_role CHECK (role IN (
    'super_admin', 'admin', 'hr_manager', 'finance_manager', 'compliance_officer', 'employee'
  ))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission VARCHAR(100) NOT NULL,
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by UUID REFERENCES users(id),
  UNIQUE(user_id, permission)
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  username VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  resource_id UUID,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Delete existing admin user if exists
DELETE FROM users WHERE username = 'admin';

-- Insert admin user
-- Password: Vimanasa@2026
-- ⚠️ CHANGE THIS PASSWORD AFTER FIRST LOGIN!
INSERT INTO users (
  username,
  email,
  password_hash,
  full_name,
  role,
  is_active,
  must_change_password
) VALUES (
  'admin',
  'admin@vimanasa.com',
  '100000$+QkqKgqlQcfTSvBr5DgYww==$XnOd/LQ74kJEdI4ajBkOt3ThdM0ThWCtuAPaywYcK6g=',
  'System Administrator',
  'super_admin',
  true,
  false
);

-- Add admin permissions
INSERT INTO user_permissions (user_id, permission)
SELECT id, '*'
FROM users
WHERE username = 'admin';

-- Log the setup
INSERT INTO audit_logs (action, status, details)
VALUES (
  'quick_setup_admin',
  'success',
  jsonb_build_object(
    'message', 'Admin user created via quick fix',
    'timestamp', NOW()
  )
);

-- Show created user
SELECT 
  username,
  email,
  full_name,
  role,
  is_active,
  created_at
FROM users
WHERE username = 'admin';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Setup Complete!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Login Credentials:';
  RAISE NOTICE '   Username: admin';
  RAISE NOTICE '   Password: Vimanasa@2026';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: Change this password after first login!';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next Steps:';
  RAISE NOTICE '   1. Restart your dev server (npm run dev)';
  RAISE NOTICE '   2. Login at http://localhost:3000';
  RAISE NOTICE '   3. Change your password immediately';
END $$;
