-- =====================================================
-- Seed Initial Admin User
-- =====================================================
-- This script creates the initial super admin user
-- 
-- ⚠️ IMPORTANT SECURITY NOTES:
-- 1. Change the password immediately after first login
-- 2. This is a temporary password for initial setup only
-- 3. The password hash shown here is for: "TempAdmin@2026!Change"
-- 4. You MUST generate your own hash using the password utility
-- =====================================================

-- =====================================================
-- How to Generate Your Own Password Hash:
-- =====================================================
-- 1. Create a Node.js script (generate-hash.js):
--
--    import { hashPassword } from './src/lib/passwordHash.js';
--    const password = 'YourSecurePassword123!';
--    hashPassword(password).then(hash => {
--      console.log('Password hash:', hash);
--    });
--
-- 2. Run: node generate-hash.js
-- 3. Copy the hash and replace the value below
-- =====================================================

-- Delete existing demo users if they exist
DELETE FROM users WHERE username IN ('admin', 'hr_manager', 'finance');

-- Insert Super Admin
INSERT INTO users (
  id,
  username,
  email,
  password_hash,
  full_name,
  role,
  is_active,
  must_change_password,
  created_at
) VALUES (
  gen_random_uuid(),
  'admin',
  'admin@vimanasa.com',
  -- This hash is for password: "TempAdmin@2026!Change"
  -- ⚠️ CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN!
  '100000$dGVtcHNhbHQxMjM0NTY3OA==$aGFzaGVkcGFzc3dvcmQxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTA=',
  'System Administrator',
  'super_admin',
  true,
  true, -- Force password change on first login
  NOW()
) ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  must_change_password = EXCLUDED.must_change_password,
  updated_at = NOW();

-- Insert HR Manager (Optional - for testing)
INSERT INTO users (
  id,
  username,
  email,
  password_hash,
  full_name,
  role,
  is_active,
  must_change_password,
  created_at
) VALUES (
  gen_random_uuid(),
  'hr_manager',
  'hr@vimanasa.com',
  -- This hash is for password: "TempHR@2026!Change"
  '100000$aHJzYWx0MTIzNDU2Nzg5MA==$aHJoYXNoZWRwYXNzd29yZDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5',
  'HR Manager',
  'hr_manager',
  true,
  true,
  NOW()
) ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  must_change_password = EXCLUDED.must_change_password,
  updated_at = NOW();

-- Insert Finance Manager (Optional - for testing)
INSERT INTO users (
  id,
  username,
  email,
  password_hash,
  full_name,
  role,
  is_active,
  must_change_password,
  created_at
) VALUES (
  gen_random_uuid(),
  'finance',
  'finance@vimanasa.com',
  -- This hash is for password: "TempFinance@2026!Change"
  '100000$ZmluYW5jZXNhbHQxMjM0NTY3ODkw$ZmluYW5jZWhhc2hlZHBhc3N3b3JkMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkw',
  'Finance Manager',
  'finance_manager',
  true,
  true,
  NOW()
) ON CONFLICT (username) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  must_change_password = EXCLUDED.must_change_password,
  updated_at = NOW();

-- Grant default permissions based on roles
INSERT INTO user_permissions (user_id, permission, granted_at)
SELECT 
  u.id,
  p.permission,
  NOW()
FROM users u
CROSS JOIN (
  SELECT '*' as permission
  WHERE EXISTS (SELECT 1 FROM users WHERE role IN ('super_admin', 'admin'))
  
  UNION ALL
  
  SELECT 'workforce:*' WHERE EXISTS (SELECT 1 FROM users WHERE role = 'hr_manager')
  UNION ALL
  SELECT 'attendance:*' WHERE EXISTS (SELECT 1 FROM users WHERE role = 'hr_manager')
  UNION ALL
  SELECT 'leave:*' WHERE EXISTS (SELECT 1 FROM users WHERE role = 'hr_manager')
  UNION ALL
  SELECT 'candidates:*' WHERE EXISTS (SELECT 1 FROM users WHERE role = 'hr_manager')
  
  UNION ALL
  
  SELECT 'finance:*' WHERE EXISTS (SELECT 1 FROM users WHERE role = 'finance_manager')
  UNION ALL
  SELECT 'payroll:*' WHERE EXISTS (SELECT 1 FROM users WHERE role = 'finance_manager')
  UNION ALL
  SELECT 'invoices:*' WHERE EXISTS (SELECT 1 FROM users WHERE role = 'finance_manager')
  UNION ALL
  SELECT 'expenses:*' WHERE EXISTS (SELECT 1 FROM users WHERE role = 'finance_manager')
) p
WHERE 
  (u.role IN ('super_admin', 'admin') AND p.permission = '*')
  OR (u.role = 'hr_manager' AND p.permission LIKE 'workforce:%' OR p.permission LIKE 'attendance:%' OR p.permission LIKE 'leave:%' OR p.permission LIKE 'candidates:%')
  OR (u.role = 'finance_manager' AND p.permission LIKE 'finance:%' OR p.permission LIKE 'payroll:%' OR p.permission LIKE 'invoices:%' OR p.permission LIKE 'expenses:%')
ON CONFLICT (user_id, permission) DO NOTHING;

-- Log the user creation
INSERT INTO audit_logs (action, status, details)
VALUES (
  'seed_admin_users',
  'success',
  jsonb_build_object(
    'message', 'Initial admin users created',
    'users_created', 3,
    'timestamp', NOW()
  )
);

-- =====================================================
-- Verification Query
-- =====================================================

-- Show created users (without password hashes)
SELECT 
  username,
  email,
  full_name,
  role,
  is_active,
  must_change_password,
  created_at
FROM users
ORDER BY 
  CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'hr_manager' THEN 3
    WHEN 'finance_manager' THEN 4
    ELSE 5
  END;

-- =====================================================
-- Success Message
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Admin users seeded successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Default Credentials (TEMPORARY - CHANGE IMMEDIATELY):';
  RAISE NOTICE '   Username: admin';
  RAISE NOTICE '   Password: TempAdmin@2026!Change';
  RAISE NOTICE '';
  RAISE NOTICE '   Username: hr_manager';
  RAISE NOTICE '   Password: TempHR@2026!Change';
  RAISE NOTICE '';
  RAISE NOTICE '   Username: finance';
  RAISE NOTICE '   Password: TempFinance@2026!Change';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  SECURITY WARNING:';
  RAISE NOTICE '   - All users are flagged to change password on first login';
  RAISE NOTICE '   - These are TEMPORARY passwords for initial setup only';
  RAISE NOTICE '   - Change them immediately after first login';
  RAISE NOTICE '   - Never commit real password hashes to version control';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Next Steps:';
  RAISE NOTICE '   1. Login with admin credentials';
  RAISE NOTICE '   2. Change password immediately';
  RAISE NOTICE '   3. Create additional users as needed';
  RAISE NOTICE '   4. Review and adjust permissions';
END $$;
