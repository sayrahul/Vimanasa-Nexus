/**
 * Security Vulnerabilities Test Suite
 * 
 * Phase 1: Exploratory Bug Condition Testing (BEFORE Fixes)
 * These tests are designed to FAIL on unfixed code to surface counterexamples
 * 
 * Phase 2: Preservation Property Testing (BEFORE Fixes)
 * These tests capture baseline behavior and should PASS on unfixed code
 * 
 * After fixes are implemented, ALL tests should PASS
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

// ============================================================================
// PHASE 1: EXPLORATORY BUG CONDITION TESTING
// ============================================================================

describe('Phase 1: Exploratory Bug Condition Testing', () => {
  
  // Property 1: Bug Condition - Hardcoded Secrets Detection
  describe('1.1 Vulnerability #1: Exposed Secrets', () => {
    
    test('should NOT find hardcoded secrets in source code', () => {
      const secretPatterns = [
        /SUPABASE_SERVICE_ROLE_KEY\s*=\s*['"]eyJ[^'"]+['"]/gi,
        /JWT_SECRET\s*=\s*['"][^'"]{10,}['"]/gi,
        /GEMINI_API_KEY\s*=\s*['"]AIzaSy[^'"]+['"]/gi,
        /Vimanasa@2026/gi,
        /hr123/gi,
        /finance123/gi,
      ];

      const filesToCheck = [
        'test-api.js',
        'check-network.js',
        'USER_MANAGEMENT_GUIDE.md',
        'LOGIN_FIX_INSTRUCTIONS.md',
        'PRODUCTION_ISSUE_REPORT.md',
      ];

      const violations = [];

      filesToCheck.forEach(file => {
        const filePath = path.join(projectRoot, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          
          secretPatterns.forEach((pattern, index) => {
            const matches = content.match(pattern);
            if (matches) {
              violations.push({
                file,
                pattern: pattern.toString(),
                matches: matches.slice(0, 3), // First 3 matches
              });
            }
          });
        }
      });

      // This test should PASS after fixes (no violations)
      expect(violations).toEqual([]);
      
      if (violations.length > 0) {
        console.log('\n❌ Found hardcoded secrets:');
        violations.forEach(v => {
          console.log(`   File: ${v.file}`);
          console.log(`   Pattern: ${v.pattern}`);
          console.log(`   Matches: ${v.matches.join(', ')}`);
        });
      }
    });

    test('should NOT log actual secret values in console.log statements', () => {
      const filesToCheck = [
        'test-api.js',
        'check-network.js',
      ];

      const violations = [];
      // Pattern to detect console.log that directly logs env var value without ternary
      const dangerousPattern = /console\.log\([^)]*process\.env\.([A-Z_]+)(?!\s*\?)[^)]*\)/gi;

      filesToCheck.forEach(file => {
        const filePath = path.join(projectRoot, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            // Check if line logs env var directly (not with ternary or .length)
            if (line.includes('console.log') && line.includes('process.env')) {
              // Skip safe patterns: ternary (?), .length, || 'default'
              if (!line.includes('?') && !line.includes('.length') && !line.includes('||')) {
                const match = line.match(/process\.env\.([A-Z_]+)/);
                if (match) {
                  violations.push({
                    file,
                    line: index + 1,
                    content: line.trim(),
                    variable: match[1],
                  });
                }
              }
            }
          });
        }
      });

      // This test should PASS after fixes (no violations)
      expect(violations).toEqual([]);
      
      if (violations.length > 0) {
        console.log('\n❌ Found console.log statements that may expose secrets:');
        violations.forEach(v => {
          console.log(`   ${v.file}:${v.line} - ${v.variable}`);
          console.log(`   ${v.content}`);
        });
      }
    });

    test('should NOT display demo passwords in documentation', () => {
      const docFiles = [
        'USER_MANAGEMENT_GUIDE.md',
        'LOGIN_FIX_INSTRUCTIONS.md',
        'PRODUCTION_ISSUE_REPORT.md',
      ];

      const demoPasswords = ['Vimanasa@2026', 'hr123', 'finance123'];
      const violations = [];

      docFiles.forEach(file => {
        const filePath = path.join(projectRoot, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          
          demoPasswords.forEach(password => {
            if (content.includes(password)) {
              const lines = content.split('\n');
              const lineNumbers = lines
                .map((line, index) => line.includes(password) ? index + 1 : null)
                .filter(n => n !== null);
              
              violations.push({
                file,
                password,
                lines: lineNumbers,
              });
            }
          });
        }
      });

      // This test should PASS after fixes (no violations)
      expect(violations).toEqual([]);
      
      if (violations.length > 0) {
        console.log('\n❌ Found demo passwords in documentation:');
        violations.forEach(v => {
          console.log(`   ${v.file} - "${v.password}" on lines: ${v.lines.join(', ')}`);
        });
      }
    });
  });

  // Property 1: Bug Condition - Diagnostic Endpoint Protection
  describe('1.2 Vulnerability #2: Unauthenticated Diagnostic Access', () => {
    
    test('should require admin authentication for /api/check-env', async () => {
      // This test verifies the endpoint exists and requires auth
      const checkEnvPath = path.join(projectRoot, 'src/app/api/check-env/route.js');
      expect(fs.existsSync(checkEnvPath)).toBe(true);

      const content = fs.readFileSync(checkEnvPath, 'utf-8');
      
      // Verify it has requireAdmin or similar auth check
      const hasAuthCheck = content.includes('requireAdmin') || 
                          content.includes('verifyToken') ||
                          content.includes('authorization');
      
      expect(hasAuthCheck).toBe(true);
      
      // Verify it returns 401 for missing auth
      const returns401 = content.includes('401') || content.includes('Unauthorized');
      expect(returns401).toBe(true);
    });

    test('should NOT have unprotected diagnostic routes', () => {
      const srcPath = path.join(projectRoot, 'src');
      const diagnosticRoutes = [];

      function searchDirectory(dir) {
        if (!fs.existsSync(dir)) return;
        
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.includes('node_modules')) {
            // Check for diagnostic route directories
            if (item.match(/debug|health|diagnostic|status/i)) {
              diagnosticRoutes.push(fullPath);
            }
            searchDirectory(fullPath);
          }
        });
      }

      searchDirectory(srcPath);

      // This test should PASS after fixes (no unprotected routes)
      expect(diagnosticRoutes).toEqual([]);
      
      if (diagnosticRoutes.length > 0) {
        console.log('\n⚠️  Found potential diagnostic routes:');
        diagnosticRoutes.forEach(route => {
          console.log(`   ${route}`);
        });
      }
    });
  });

  // Property 1: Bug Condition - Demo Credentials Detection
  describe('1.3 Vulnerability #3: Demo Credentials in Production', () => {
    
    test('should NOT have demo credentials in auth.js', () => {
      const authPath = path.join(projectRoot, 'src/lib/auth.js');
      const content = fs.readFileSync(authPath, 'utf-8');

      const demoPatterns = [
        /const\s+USERS\s*=\s*\[/i,
        /Vimanasa@2026/,
        /hr123/,
        /finance123/,
        /password:\s*['"][^'"]+['"]/i,
      ];

      const violations = demoPatterns.filter(pattern => pattern.test(content));

      // This test should PASS after fixes (no demo credentials)
      expect(violations).toEqual([]);
      
      if (violations.length > 0) {
        console.log('\n❌ Found demo credential patterns in auth.js');
      }
    });

    test('should require JWT_SECRET in production', () => {
      const authPath = path.join(projectRoot, 'src/lib/auth.js');
      const content = fs.readFileSync(authPath, 'utf-8');

      // Verify JWT_SECRET validation exists
      const hasJWTCheck = content.includes('JWT_SECRET') && 
                         content.includes('production');
      
      expect(hasJWTCheck).toBe(true);

      // Verify it throws error if missing
      const throwsError = content.includes('throw new Error') &&
                         content.includes('JWT_SECRET');
      
      expect(throwsError).toBe(true);
    });
  });

  // Property 1: Bug Condition - Unmapped Table Access
  describe('1.4 Vulnerability #4: Arbitrary Table Access', () => {
    
    test('should have explicit table allowlist', () => {
      const dbApiPath = path.join(projectRoot, 'src/app/api/database/route.js');
      const content = fs.readFileSync(dbApiPath, 'utf-8');

      // Verify tableMapping exists
      expect(content).toContain('tableMapping');
      
      // Verify resolveTable function exists
      expect(content).toContain('resolveTable');
      
      // Verify it returns undefined for unmapped tables
      const resolveTableMatch = content.match(/function resolveTable\([^)]+\)\s*{([^}]+)}/);
      if (resolveTableMatch) {
        const functionBody = resolveTableMatch[1];
        expect(functionBody).toContain('undefined');
      }
    });

    test('should have comprehensive role permissions', () => {
      const dbApiPath = path.join(projectRoot, 'src/app/api/database/route.js');
      const content = fs.readFileSync(dbApiPath, 'utf-8');

      // Verify tablePermissions exists
      expect(content).toContain('tablePermissions');
      
      // Verify key roles are defined
      expect(content).toContain('super_admin');
      expect(content).toContain('hr_manager');
      expect(content).toContain('finance_manager');
      
      // Verify employee role exists (should have no permissions)
      const hasEmployeeRole = content.includes('employee');
      
      // After fix, employee role should be explicitly defined
      // Before fix, it might be missing
      if (!hasEmployeeRole) {
        console.log('\n⚠️  Employee role not explicitly defined in permissions');
      }
    });

    test('should check permissions before database access', () => {
      const dbApiPath = path.join(projectRoot, 'src/app/api/database/route.js');
      const content = fs.readFileSync(dbApiPath, 'utf-8');

      // Verify hasTableAccess function exists
      expect(content).toContain('hasTableAccess');
      
      // Verify it's called before database operations
      const hasPermissionCheck = content.includes('hasTableAccess') &&
                                 content.includes('verifyRequest');
      
      expect(hasPermissionCheck).toBe(true);
    });
  });

  // Property 1: Bug Condition - Public Submission Validation Gaps
  describe('1.5 Vulnerability #5: Unvalidated Public Submissions', () => {
    
    test('should require CAPTCHA for candidate submissions', () => {
      const dbApiPath = path.join(projectRoot, 'src/app/api/database/route.js');
      const content = fs.readFileSync(dbApiPath, 'utf-8');

      // Check if CAPTCHA verification exists
      const hasCaptcha = content.includes('captcha') || 
                        content.includes('turnstile') ||
                        content.includes('verifyCaptcha');
      
      // This test should FAIL before fix (no CAPTCHA)
      // This test should PASS after fix (CAPTCHA implemented)
      if (!hasCaptcha) {
        console.log('\n❌ CAPTCHA verification not found in database API');
      }
      
      expect(hasCaptcha).toBe(true);
    });

    test('should check for duplicate submissions', () => {
      const dbApiPath = path.join(projectRoot, 'src/app/api/database/route.js');
      const content = fs.readFileSync(dbApiPath, 'utf-8');

      // Check if duplicate detection exists
      const hasDuplicateCheck = content.includes('duplicate') ||
                               (content.includes('email') && content.includes('phone') && content.includes('existing'));
      
      // This test should FAIL before fix (no duplicate check)
      // This test should PASS after fix (duplicate check implemented)
      if (!hasDuplicateCheck) {
        console.log('\n❌ Duplicate submission check not found');
      }
      
      expect(hasDuplicateCheck).toBe(true);
    });

    test('should validate file uploads', () => {
      const dbApiPath = path.join(projectRoot, 'src/app/api/database/route.js');
      const content = fs.readFileSync(dbApiPath, 'utf-8');

      // Check if file validation exists
      const hasFileValidation = content.includes('validateFile') ||
                               content.includes('ALLOWED_TYPES') ||
                               content.includes('MAX_FILE_SIZE');
      
      // This test should FAIL before fix (no file validation)
      // This test should PASS after fix (file validation implemented)
      if (!hasFileValidation) {
        console.log('\n❌ File validation not found');
      }
      
      expect(hasFileValidation).toBe(true);
    });

    test('should have strict rate limiting for public submissions', () => {
      const dbApiPath = path.join(projectRoot, 'src/app/api/database/route.js');
      const content = fs.readFileSync(dbApiPath, 'utf-8');

      // Check if rate limiting exists
      expect(content).toContain('checkRateLimit');
      
      // Check if there's specific rate limiting for candidates
      const hasCandidateRateLimit = content.includes('candidates') &&
                                   content.includes('checkRateLimit');
      
      // After fix, should have stricter rate limit (5 per hour)
      if (hasCandidateRateLimit) {
        const rateLimitMatch = content.match(/checkRateLimit\([^)]*candidates[^)]*\)/);
        if (rateLimitMatch) {
          console.log(`\n✓ Found rate limit for candidates: ${rateLimitMatch[0]}`);
        }
      }
      
      expect(hasCandidateRateLimit).toBe(true);
    });

    test('should sanitize input to prevent XSS', () => {
      const dbApiPath = path.join(projectRoot, 'src/app/api/database/route.js');
      const content = fs.readFileSync(dbApiPath, 'utf-8');

      // Check if input sanitization exists
      const hasSanitization = content.includes('sanitize') ||
                             content.includes('escape') ||
                             content.includes('&lt;') ||
                             content.includes('&gt;');
      
      // This test should FAIL before fix (no sanitization)
      // This test should PASS after fix (sanitization implemented)
      if (!hasSanitization) {
        console.log('\n❌ Input sanitization not found');
      }
      
      expect(hasSanitization).toBe(true);
    });
  });
});

// ============================================================================
// PHASE 2: PRESERVATION PROPERTY TESTING
// ============================================================================

describe('Phase 2: Preservation Property Testing', () => {
  
  // Property 2: Preservation - Admin Full Access Maintained
  describe('2.1 Preservation: Admin Access', () => {
    
    test('should maintain admin full access to all resources', () => {
      const dbApiPath = path.join(projectRoot, 'src/app/api/database/route.js');
      const content = fs.readFileSync(dbApiPath, 'utf-8');

      // Verify super_admin and admin have '*' permissions
      const adminPermissions = content.match(/super_admin:\s*['"]?\*['"]?/);
      expect(adminPermissions).toBeTruthy();
      
      const adminPermissions2 = content.match(/admin:\s*['"]?\*['"]?/);
      expect(adminPermissions2).toBeTruthy();
    });
  });

  // Property 2: Preservation - HR Manager Read Access Maintained
  describe('2.2 Preservation: HR Manager Permissions', () => {
    
    test('should maintain HR manager read access to workforce data', () => {
      const dbApiPath = path.join(projectRoot, 'src/app/api/database/route.js');
      const content = fs.readFileSync(dbApiPath, 'utf-8');

      // Verify HR manager has read access to key tables
      const hrManagerSection = content.match(/hr_manager:\s*{[^}]+}/s);
      expect(hrManagerSection).toBeTruthy();
      
      if (hrManagerSection) {
        const section = hrManagerSection[0];
        expect(section).toContain('workforce');
        expect(section).toContain('employees');
        expect(section).toContain('attendance');
        expect(section).toContain('leave');
        expect(section).toContain('candidates');
      }
    });
  });

  // Property 2: Preservation - Finance Manager Access Maintained
  describe('2.3 Preservation: Finance Manager Permissions', () => {
    
    test('should maintain finance manager access to financial data', () => {
      const dbApiPath = path.join(projectRoot, 'src/app/api/database/route.js');
      const content = fs.readFileSync(dbApiPath, 'utf-8');

      // Verify finance manager has access to financial tables
      const financeManagerSection = content.match(/finance_manager:\s*{[^}]+}/s);
      expect(financeManagerSection).toBeTruthy();
      
      if (financeManagerSection) {
        const section = financeManagerSection[0];
        expect(section).toContain('payroll');
        expect(section).toContain('finance');
        expect(section).toContain('invoices');
        expect(section).toContain('expenses');
      }
    });
  });

  // Property 2: Preservation - JWT Authentication Continues to Work
  describe('2.4 Preservation: JWT Authentication', () => {
    
    test('should maintain JWT token verification', () => {
      const authPath = path.join(projectRoot, 'src/lib/auth.js');
      const content = fs.readFileSync(authPath, 'utf-8');

      // Verify JWT functions exist
      expect(content).toContain('createToken');
      expect(content).toContain('verifyToken');
      expect(content).toContain('jwtVerify');
      expect(content).toContain('SignJWT');
    });
  });

  // Property 2: Preservation - Database API Operations Continue to Work
  describe('2.5 Preservation: Database API Operations', () => {
    
    test('should maintain CRUD operations for authorized users', () => {
      const dbApiPath = path.join(projectRoot, 'src/app/api/database/route.js');
      const content = fs.readFileSync(dbApiPath, 'utf-8');

      // Verify all HTTP methods are exported
      expect(content).toContain('export async function GET');
      expect(content).toContain('export async function POST');
      expect(content).toContain('export async function PUT');
      expect(content).toContain('export async function DELETE');
      
      // Verify data mappers are used
      expect(content).toContain('toDB');
      expect(content).toContain('toFrontend');
    });
  });

  // Property 2: Preservation - Public Job Viewing Continues to Work
  describe('2.6 Preservation: Public Job Viewing', () => {
    
    test('should maintain public access to open job postings', () => {
      const dbApiPath = path.join(projectRoot, 'src/app/api/database/route.js');
      const content = fs.readFileSync(dbApiPath, 'utf-8');

      // Verify public rules exist
      expect(content).toContain('publicRules');
      
      // Verify job_openings is in public rules
      const publicRulesMatch = content.match(/publicRules\s*=\s*\[([^\]]+)\]/s);
      if (publicRulesMatch) {
        const rules = publicRulesMatch[1];
        expect(rules).toContain('job_openings');
        expect(rules).toContain('GET');
      }
    });
  });

  // Property 2: Preservation - CORS and Security Headers Continue to Work
  describe('2.8 Preservation: CORS and Headers', () => {
    
    test('should maintain CORS headers for allowed origins', () => {
      const dbApiPath = path.join(projectRoot, 'src/app/api/database/route.js');
      const content = fs.readFileSync(dbApiPath, 'utf-8');

      // Verify CORS configuration exists
      expect(content).toContain('Access-Control-Allow-Origin');
      expect(content).toContain('allowedOrigins');
      
      // Verify Cache-Control header
      expect(content).toContain('Cache-Control');
      expect(content).toContain('no-store');
    });
  });

  // Property 2: Preservation - Error Handling Continues to Work
  describe('2.9 Preservation: Error Handling', () => {
    
    test('should maintain proper error responses', () => {
      const dbApiPath = path.join(projectRoot, 'src/app/api/database/route.js');
      const content = fs.readFileSync(dbApiPath, 'utf-8');

      // Verify error handling exists
      expect(content).toContain('400'); // Bad Request
      expect(content).toContain('401'); // Unauthorized
      expect(content).toContain('403'); // Forbidden
      expect(content).toContain('429'); // Rate Limited
      expect(content).toContain('500'); // Server Error
      
      // Verify graceful error handling
      expect(content).toContain('handleSchemaError');
    });
  });
});

console.log('\n✅ Security Vulnerabilities Test Suite Loaded');
console.log('   Run with: npm test tests/security-vulnerabilities.test.js\n');
