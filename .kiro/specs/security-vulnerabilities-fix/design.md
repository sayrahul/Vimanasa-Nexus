# Security Vulnerabilities Fix - Bugfix Design

## Overview

This design document outlines the technical solution for fixing five critical security vulnerabilities in the Vimanasa Nexus HR/Payroll application. The vulnerabilities span authentication, secrets management, access control, and public endpoint protection.

**Current Status**: Significant progress has been made on authentication (Vulnerability #3), with database-backed authentication, PBKDF2-SHA256 password hashing, JWT validation, user management UI, and audit logging already implemented. This design covers the complete solution including both completed and remaining work.

**Fix Strategy**: The approach is defense-in-depth, implementing multiple layers of security controls:
1. **Secrets Management**: Eliminate all hardcoded credentials and rotate exposed secrets
2. **Diagnostic Endpoint Protection**: Enforce admin-only authentication on sensitive endpoints
3. **Authentication Hardening**: Complete the database-backed auth system (mostly done) and remove all demo credentials
4. **Database API Security**: Enforce strict table allowlists and granular RBAC
5. **Public Endpoint Protection**: Add CAPTCHA, rate limiting, duplicate checking, and file validation

## Glossary

- **Bug_Condition (C)**: The conditions that trigger each of the five security vulnerabilities
- **Property (P)**: The desired secure behavior after fixes are applied
- **Preservation**: Existing legitimate functionality that must remain unchanged
- **PBKDF2-SHA256**: Password-Based Key Derivation Function 2 with SHA-256 hashing (already implemented)
- **JWT_SECRET**: Secret key for signing JSON Web Tokens (validation already implemented)
- **Supabase Service Role Key**: Admin-level database access key (must be in environment variables only)
- **tableMapping**: Explicit allowlist mapping frontend table names to database tables
- **resolveTable()**: Function that returns `undefined` for unmapped tables (already implemented)
- **Cloudflare Turnstile**: CAPTCHA service for bot prevention (to be implemented)
- **Rate Limiting**: Request throttling to prevent abuse (basic implementation exists, needs enhancement)

## Bug Details

### Bug Condition 1: Exposed Secrets in Repository

The application historically contained hardcoded credentials in source code files. While the main authentication system has been migrated to use environment variables, there may still be references in test scripts, setup files, and documentation.

**Formal Specification:**
```
FUNCTION isExposedSecretsCondition(input)
  INPUT: input of type SourceCodeFile
  OUTPUT: boolean
  
  RETURN (input.contains_hardcoded_api_keys OR
          input.contains_hardcoded_passwords OR
          input.contains_service_role_keys OR
          input.contains_jwt_secrets OR
          input.displays_secrets_in_console_output)
END FUNCTION
```

### Examples

- **Example 1**: Test scripts that log `process.env.SUPABASE_SERVICE_ROLE_KEY` to console (exposes secrets in logs)
- **Example 2**: Setup scripts that display demo passwords like 'Vimanasa@2026' in console output
- **Example 3**: Documentation files that contain example credentials that might be mistaken for real ones
- **Edge Case**: Environment variable validation that logs the actual secret value instead of just "SET" or "NOT SET"

### Bug Condition 2: Unauthenticated Diagnostic Access

The `/api/check-env` endpoint currently requires admin authentication, but the implementation needs verification. Other diagnostic routes may exist without protection.

**Formal Specification:**
```
FUNCTION isUnauthenticatedDiagnosticAccess(input)
  INPUT: input of type HTTPRequest
  OUTPUT: boolean
  
  RETURN (input.path IN ['/api/check-env', '/debug', '/recruitment-debug', '/health-check'] AND
          (input.auth_token IS NULL OR 
           input.user_role NOT IN ['super_admin', 'admin'] OR
           auth_check_can_be_bypassed))
END FUNCTION
```

### Examples

- **Example 1**: Unauthenticated GET request to `/api/check-env` returns environment status (should return 401)
- **Example 2**: Non-admin user with valid JWT accesses `/api/check-env` (should return 403)
- **Example 3**: Request to `/debug` or `/health-check` returns system information without authentication
- **Edge Case**: Diagnostic endpoint accessed via different HTTP methods (POST, PUT) that bypass auth checks

### Bug Condition 3: Demo/Local Auth in Production

The authentication system has been largely migrated to database-backed authentication with hashed passwords. However, demo credentials may still exist in setup scripts, documentation, or test files.

**Formal Specification:**
```
FUNCTION isDemoAuthInProduction(input)
  INPUT: input of type AuthenticationContext
  OUTPUT: boolean
  
  RETURN (input.environment = 'production' AND
          (input.has_demo_credentials_in_code OR
           input.has_fallback_jwt_secret OR
           input.displays_demo_passwords_in_setup OR
           input.allows_test_users_in_production))
END FUNCTION
```

### Examples

- **Example 1**: Setup script displays demo password 'Vimanasa@2026' in console output (information disclosure)
- **Example 2**: JWT_SECRET validation allows fallback to test secret in non-production environments (should fail fast)
- **Example 3**: Documentation contains demo credentials that could be confused with production credentials
- **Edge Case**: Test files with demo credentials are accidentally deployed to production environment

### Bug Condition 4: Arbitrary Table Access

The database API uses `resolveTable()` which returns `undefined` for unmapped tables, but the error handling and permission checks need to be comprehensive across all roles.

**Formal Specification:**
```
FUNCTION isArbitraryTableAccess(input)
  INPUT: input of type DatabaseAPIRequest
  OUTPUT: boolean
  
  RETURN (input.table NOT IN tableMapping.keys() OR
          (input.is_authenticated = true AND
           input.user_role NOT IN ['super_admin', 'admin'] AND
           NOT hasGranularPermission(input.user_role, input.table, input.method)))
END FUNCTION
```

### Examples

- **Example 1**: Authenticated user requests `?table=users` (not in tableMapping) - should return 400 with clear error
- **Example 2**: HR manager attempts to write to `payroll` table (lacks write permission) - should return 403
- **Example 3**: Finance manager attempts to read `candidates` table (lacks read permission) - should return 403
- **Edge Case**: User with `employee` role (no explicit permissions) attempts to access any table - should return 403

### Bug Condition 5: Unvalidated Public Submissions

The public candidate application endpoint has basic rate limiting (30 req/min) and Zod validation, but lacks CAPTCHA, duplicate checking, and comprehensive file validation.

**Formal Specification:**
```
FUNCTION isUnvalidatedPublicSubmission(input)
  INPUT: input of type CandidateSubmission
  OUTPUT: boolean
  
  RETURN (input.is_public_endpoint = true AND
          (input.lacks_captcha_verification OR
           input.lacks_duplicate_check OR
           input.lacks_file_type_validation OR
           input.lacks_file_size_limit OR
           input.lacks_malware_scanning OR
           input.rate_limit_too_permissive))
END FUNCTION
```

### Examples

- **Example 1**: Bot submits 100 candidate applications in 5 minutes (should be blocked by CAPTCHA and stricter rate limiting)
- **Example 2**: Same email submits 10 applications for different positions (should detect duplicate and reject)
- **Example 3**: Candidate uploads .exe file as resume (should reject non-PDF/DOCX files)
- **Example 4**: Candidate uploads 50MB PDF file (should reject files over 5MB limit)
- **Edge Case**: Candidate submits application with XSS payload in "Full Name" field (should sanitize input)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Valid admin users with correct credentials must continue to have full access to all resources
- HR managers must continue to have read access to workforce, attendance, leave, and candidates data
- Finance managers must continue to have read/write access to payroll, finance, invoices, and expenses
- Valid JWT tokens must continue to authenticate requests successfully
- Authorized users must continue to successfully query permitted tables via the database API
- Public users must continue to view open job postings without authentication
- Legitimate candidate applications with valid data must continue to be accepted and stored
- CORS headers must continue to work for allowed origins (nexus.vimanasa.com, localhost:3000)
- Error handling must continue to return appropriate status codes (400, 401, 403, 429, 500)

**Scope:**
All inputs that do NOT involve the five bug conditions (exposed secrets, unauthenticated diagnostic access, demo credentials, arbitrary table access, unvalidated public submissions) should be completely unaffected by this fix. This includes:
- All legitimate authenticated API requests with proper permissions
- All valid database operations on permitted tables
- All proper usage of environment variables
- All existing frontend functionality and user workflows

## Hypothesized Root Cause

Based on the bug analysis and code review, the root causes are:

### 1. Secrets Management Issues
- **Historical Technical Debt**: Application was initially developed with hardcoded credentials for rapid prototyping
- **Incomplete Migration**: While main auth system has been migrated to environment variables, test scripts and setup files still reference or display secrets
- **Logging Practices**: Console output in setup scripts displays sensitive information that could be captured in logs

### 2. Diagnostic Endpoint Protection
- **Current Implementation**: `/api/check-env` has admin authentication, but needs verification that it cannot be bypassed
- **Missing Endpoints**: Other diagnostic routes (`/debug`, `/recruitment-debug`, `/health-check`) may exist without protection
- **Incomplete Security Review**: Diagnostic endpoints may not have been audited for all HTTP methods and edge cases

### 3. Demo Credentials Remnants
- **Migration Mostly Complete**: Database-backed authentication with PBKDF2-SHA256 hashing is implemented
- **Documentation Lag**: Setup scripts and documentation still reference demo credentials for development setup
- **Test Environment Confusion**: Demo credentials intended for local development may be visible in production deployments

### 4. Database API Access Control
- **Table Allowlist Implemented**: `resolveTable()` returns `undefined` for unmapped tables
- **Permission Granularity**: Role-based permissions exist but may not cover all table/action combinations comprehensively
- **Error Handling**: Need to ensure all code paths properly reject unmapped tables and unauthorized access

### 5. Public Endpoint Validation Gaps
- **Basic Protections Exist**: Rate limiting (30 req/min) and Zod schema validation are implemented
- **Missing Bot Prevention**: No CAPTCHA verification to prevent automated submissions
- **No Duplicate Detection**: System accepts multiple submissions from same email/phone
- **Incomplete File Validation**: No file type restrictions, size limits, or malware scanning for uploaded resumes

## Correctness Properties

Property 1: Bug Condition - No Exposed Secrets

_For any_ source code file, test script, or documentation file in the repository, the fixed codebase SHALL contain no hardcoded credentials, API keys, or sensitive configuration values, and SHALL retrieve all secrets exclusively from environment variables without logging their actual values.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Bug Condition - Authenticated Diagnostic Access

_For any_ HTTP request to diagnostic endpoints (`/api/check-env`, `/debug`, `/recruitment-debug`, `/health-check`), the fixed system SHALL require valid admin authentication (super_admin or admin role) and SHALL return 401 Unauthorized for missing tokens or 403 Forbidden for non-admin users.

**Validates: Requirements 2.4, 2.5, 2.6**

Property 3: Bug Condition - Secure Production Authentication

_For any_ authentication attempt in any environment, the fixed system SHALL use database-backed authentication with PBKDF2-SHA256 hashed passwords, SHALL require JWT_SECRET to be configured (no fallback), and SHALL not display or accept demo credentials in production.

**Validates: Requirements 2.7, 2.8, 2.9, 2.10, 2.11**

Property 4: Bug Condition - Explicit Table Access Control

_For any_ database API request with a table name, the fixed system SHALL use an explicit allowlist via `resolveTable()`, SHALL return 400 for unmapped tables, SHALL enforce granular per-table per-action permissions for each role, and SHALL log unauthorized access attempts.

**Validates: Requirements 2.12, 2.13, 2.14, 2.15**

Property 5: Bug Condition - Comprehensive Public Validation

_For any_ public candidate application submission, the fixed system SHALL require Cloudflare Turnstile CAPTCHA verification, SHALL enforce strict rate limiting (5 submissions per IP per hour), SHALL check for duplicate submissions by email and phone, SHALL validate file types (PDF/DOCX only) and size (5MB max), and SHALL sanitize all input fields.

**Validates: Requirements 2.16, 2.17, 2.18, 2.19, 2.20, 2.21**

Property 6: Preservation - Maintain Existing Functionality

_For any_ input that does NOT trigger the five bug conditions (legitimate authenticated requests, valid operations, proper usage), the fixed system SHALL produce exactly the same behavior as the current system, preserving all existing functionality for authorized users.

**Validates: Requirements 3.1-3.16**

## Fix Implementation

### Changes Required

#### Vulnerability 1: Exposed Secrets in Repository

**Status**: Partially complete - main code uses environment variables, but cleanup needed

**Files to Modify**:
- `test-api.js`, `test-supabase-connection.js`, `diagnose-fetch-issue.js` - Remove console.log statements that display secret values
- `scripts/setup-secure-auth.js`, `scripts/quick-setup-users.js` - Update to never display demo passwords in console output
- `src/lib/envValidation.js` - Ensure validation only logs "SET" or "NOT SET", never actual values
- All setup scripts in root directory - Audit for any hardcoded credentials or secret logging

**Specific Changes**:
1. **Remove Secret Logging**: Replace all `console.log(process.env.SECRET_KEY)` with `console.log('SECRET_KEY:', process.env.SECRET_KEY ? 'SET' : 'NOT SET')`
2. **Audit Documentation**: Review all `.md` files for example credentials that could be confused with real ones
3. **Update Setup Scripts**: Remove any display of demo passwords; instead provide instructions to set secure passwords
4. **Rotate Exposed Secrets**: Generate new values for:
   - `SUPABASE_SERVICE_ROLE_KEY` (via Supabase dashboard)
   - `JWT_SECRET` (generate new 64-character random string)
   - `NEXT_PUBLIC_GEMINI_API_KEY` (if exposed, rotate via Google Cloud Console)
5. **Update Environment Variables**: Deploy new secrets to Vercel environment variables

#### Vulnerability 2: Public Environment Diagnostic Pages

**Status**: `/api/check-env` has admin auth, needs verification; other routes need audit

**Files to Modify**:
- `src/app/api/check-env/route.js` - Verify admin authentication cannot be bypassed
- Search for and remove or protect: `/debug`, `/recruitment-debug`, `/health-check` routes

**Specific Changes**:
1. **Verify Check-Env Protection**: Review `requireAdmin()` function to ensure it properly validates JWT and role
2. **Add Comprehensive Tests**: Test with no token, invalid token, valid non-admin token, valid admin token
3. **Audit for Other Diagnostic Routes**: Search codebase for routes containing "debug", "health", "diagnostic", "status"
4. **Remove or Protect**: Either delete diagnostic routes or add same admin authentication as `/api/check-env`
5. **Add Audit Logging**: Log all access attempts to diagnostic endpoints with user ID and result

#### Vulnerability 3: Demo/Local Auth in Production

**Status**: Mostly complete - database auth with PBKDF2-SHA256 implemented, cleanup needed

**Files Already Migrated** (No changes needed):
- `src/lib/auth.js` - Uses database authentication with `supabaseAdmin.from('users')`
- `src/lib/passwordHash.js` - Implements PBKDF2-SHA256 with 100,000 iterations
- `src/app/api/users/route.js` - User management API with proper password hashing
- `src/components/UserManagement.jsx` - Admin UI for user management

**Files to Audit/Modify**:
- `scripts/setup-secure-auth.js` - Remove any demo password display
- `scripts/quick-setup-users.js` - Remove hardcoded demo passwords from console output
- `AUTH_MIGRATION_GUIDE.md`, `USER_MANAGEMENT_GUIDE.md` - Update to remove demo credential references
- `src/lib/auth.js` - Verify JWT_SECRET validation fails fast in production (already implemented)

**Specific Changes**:
1. **Remove Demo Password Display**: Update setup scripts to generate random passwords instead of using 'Vimanasa@2026'
2. **Strengthen JWT Validation**: Ensure `JWT_SECRET` validation throws error in production if not set (already done)
3. **Update Documentation**: Replace all demo credential references with instructions to create secure credentials
4. **Add Environment Check**: Ensure demo users (if any exist in database) are marked `is_active=false` in production
5. **Audit Logging**: Verify audit_logs table captures all authentication attempts (already implemented)

#### Vulnerability 4: Unlocked Database API

**Status**: Table allowlist implemented via `resolveTable()`, needs comprehensive permission enforcement

**File to Modify**:
- `src/app/api/database/route.js`

**Specific Changes**:
1. **Verify Table Allowlist**: Ensure `resolveTable()` returns `undefined` for unmapped tables (already done)
2. **Enhance Error Handling**: Ensure all code paths check `dbTable === undefined` and return 400 error
3. **Audit Role Permissions**: Review `tablePermissions` object to ensure all roles have explicit permissions:
   ```javascript
   const tablePermissions = {
     super_admin: '*',
     admin: '*',
     hr_manager: {
       read: ['dashboard', 'workforce', 'employees', 'clients', 'partners', 'attendance', 'leave', 'leave_requests', 'candidates', 'job_openings'],
       write: ['workforce', 'employees', 'attendance', 'leave', 'leave_requests', 'candidates', 'job_openings'],
     },
     finance_manager: {
       read: ['dashboard', 'workforce', 'employees', 'clients', 'payroll', 'finance', 'expenses', 'expense_claims', 'invoices', 'client_invoices'],
       write: ['payroll', 'finance', 'expenses', 'expense_claims', 'invoices', 'client_invoices'],
     },
     compliance_officer: {
       read: ['dashboard', 'workforce', 'employees', 'compliance'],
       write: ['compliance'],
     },
     employee: {
       read: [],
       write: [],
     },
   };
   ```
4. **Add Default Deny**: Ensure `employee` role (and any undefined roles) have no permissions by default
5. **Add Audit Logging**: Log all 403 Forbidden responses with user ID, table, and action to `audit_logs` table
6. **Test All Roles**: Create integration tests for each role attempting to access each table with each method

#### Vulnerability 5: Unvalidated Public Applications

**Status**: Basic rate limiting and Zod validation exist, needs CAPTCHA, duplicate checking, file validation

**Files to Modify**:
- `src/app/api/database/route.js` - Enhance POST handler for candidates table
- Create new file: `src/lib/captcha.js` - Cloudflare Turnstile verification
- Create new file: `src/lib/fileValidation.js` - File type and size validation
- Frontend: Add Turnstile widget to candidate application form

**Specific Changes**:

1. **Implement Cloudflare Turnstile CAPTCHA**:
   ```javascript
   // src/lib/captcha.js
   export async function verifyCaptcha(token, ip) {
     const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         secret: process.env.TURNSTILE_SECRET_KEY,
         response: token,
         remoteip: ip,
       }),
     });
     const data = await response.json();
     return data.success;
   }
   ```

2. **Add Duplicate Detection**:
   ```javascript
   // In POST handler for candidates table
   const { data: existingCandidate } = await supabaseAdmin
     .from('candidates')
     .select('id')
     .or(`email.eq.${email},phone.eq.${phone}`)
     .single();
   
   if (existingCandidate) {
     return json(request, {
       error: 'Duplicate Submission',
       message: 'An application with this email or phone already exists',
     }, 400);
   }
   ```

3. **Implement File Validation**:
   ```javascript
   // src/lib/fileValidation.js
   const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
   const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
   
   export function validateFile(file) {
     if (!ALLOWED_TYPES.includes(file.type)) {
       return { valid: false, error: 'Only PDF and DOCX files are allowed' };
     }
     if (file.size > MAX_FILE_SIZE) {
       return { valid: false, error: 'File size must not exceed 5MB' };
     }
     return { valid: true };
   }
   ```

4. **Enhance Rate Limiting**:
   ```javascript
   // Stricter rate limit for public candidate submissions
   if (table === 'candidates' && auth.public) {
     if (!checkRateLimit(request, 'candidate-submission', 5, 3600000)) { // 5 per hour
       return json(request, {
         error: 'Rate Limited',
         message: 'Too many applications submitted. Please try again later.',
       }, 429);
     }
   }
   ```

5. **Add Input Sanitization**:
   ```javascript
   // Sanitize all string fields to prevent XSS
   function sanitizeInput(data) {
     const sanitized = {};
     for (const [key, value] of Object.entries(data)) {
       if (typeof value === 'string') {
         sanitized[key] = value
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;')
           .replace(/"/g, '&quot;')
           .replace(/'/g, '&#x27;')
           .trim();
       } else {
         sanitized[key] = value;
       }
     }
     return sanitized;
   }
   ```

6. **Update Candidate Schema Validation**:
   ```javascript
   const candidateSchema = z.object({
     'Full Name': z.string().trim().min(2).max(120).regex(/^[a-zA-Z\s.'-]+$/),
     Phone: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/), // E.164 format
     Email: z.string().trim().email().toLowerCase(),
     'Job Title': z.string().trim().min(2).max(160).optional(),
     'Job ID': z.string().trim().max(80).optional(),
     PAN: z.string().trim().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/).optional().or(z.literal('')),
     Aadhar: z.string().trim().regex(/^\d{12}$/).optional().or(z.literal('')),
     Status: z.string().trim().max(40).optional(),
     captchaToken: z.string().min(1), // Required for verification
   }).passthrough();
   ```

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate each vulnerability on the current code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the five vulnerabilities BEFORE implementing fixes. Confirm or refute the root cause analysis.

**Test Plan**: Write tests that attempt to exploit each vulnerability. Run these tests on the CURRENT code to observe failures and understand the attack vectors.

**Test Cases**:

1. **Exposed Secrets Test**: Scan all source files for hardcoded credentials (will find references in test scripts)
2. **Unauthenticated Diagnostic Access Test**: Send GET request to `/api/check-env` without auth token (should fail with 401 on current code)
3. **Demo Auth Test**: Search codebase for demo password strings like 'Vimanasa@2026' (will find in setup scripts)
4. **Arbitrary Table Access Test**: Send authenticated request with `?table=users` (should fail with 400 on current code)
5. **Unvalidated Submission Test**: Submit candidate application without CAPTCHA token (will succeed on current code - vulnerability confirmed)
6. **Duplicate Submission Test**: Submit same email twice (will succeed on current code - vulnerability confirmed)
7. **File Upload Test**: Attempt to upload .exe file (will fail validation if file upload is implemented, or N/A if not implemented yet)

**Expected Counterexamples**:
- Test scripts that log `SUPABASE_SERVICE_ROLE_KEY` value to console
- Setup scripts that display demo passwords in output
- Candidate submissions accepted without CAPTCHA verification
- Multiple submissions from same email accepted without duplicate check
- Possible causes: Incomplete migration from demo auth, missing CAPTCHA integration, no duplicate detection logic

### Fix Checking

**Goal**: Verify that for all inputs where each bug condition holds, the fixed system produces the expected secure behavior.

**Pseudocode:**
```
FOR ALL input WHERE isExposedSecretsCondition(input) DO
  result := scanSourceCode'(input)
  ASSERT result.contains_no_hardcoded_secrets = true
  ASSERT result.uses_environment_variables = true
END FOR

FOR ALL input WHERE isUnauthenticatedDiagnosticAccess(input) DO
  result := handleDiagnosticRequest'(input)
  ASSERT result.status IN [401, 403]
  ASSERT result.exposes_no_system_info = true
END FOR

FOR ALL input WHERE isDemoAuthInProduction(input) DO
  result := authenticate'(input)
  ASSERT result.uses_database_auth = true
  ASSERT result.uses_hashed_passwords = true
  ASSERT result.demo_credentials_rejected = true
END FOR

FOR ALL input WHERE isArbitraryTableAccess(input) DO
  result := handleDatabaseRequest'(input)
  ASSERT result.status IN [400, 403]
  ASSERT result.logs_unauthorized_attempt = true
END FOR

FOR ALL input WHERE isUnvalidatedPublicSubmission(input) DO
  result := submitCandidateApplication'(input)
  ASSERT result.captcha_verified = true
  ASSERT result.duplicate_checked = true
  ASSERT result.rate_limit_enforced = true
  ASSERT result.files_validated = true
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug conditions do NOT hold, the fixed system produces the same result as the current system.

**Pseudocode:**
```
FOR ALL input WHERE NOT (isExposedSecretsCondition(input) OR
                         isUnauthenticatedDiagnosticAccess(input) OR
                         isDemoAuthInProduction(input) OR
                         isArbitraryTableAccess(input) OR
                         isUnvalidatedPublicSubmission(input)) DO
  ASSERT F(input) = F'(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all legitimate inputs

**Test Plan**: Observe behavior on CURRENT code first for legitimate operations, then write property-based tests capturing that behavior.

**Test Cases**:

1. **Admin Access Preservation**: Verify admin users can still access all resources after fixes
2. **HR Manager Permissions Preservation**: Verify HR managers can still read workforce/attendance/leave data
3. **Finance Manager Permissions Preservation**: Verify finance managers can still read/write payroll/finance data
4. **Database API Preservation**: Verify authorized users can still query permitted tables successfully
5. **Public Job Viewing Preservation**: Verify public users can still view open job postings without auth
6. **Legitimate Candidate Submission Preservation**: Verify valid applications with CAPTCHA are accepted
7. **JWT Authentication Preservation**: Verify valid JWT tokens continue to authenticate requests
8. **CORS Preservation**: Verify CORS headers continue to work for allowed origins

### Unit Tests

- Test `resolveTable()` returns `undefined` for unmapped tables
- Test `hasTableAccess()` enforces correct permissions for each role
- Test `verifyCaptcha()` correctly validates Turnstile tokens
- Test `validateFile()` rejects invalid file types and sizes
- Test duplicate detection query finds existing candidates by email/phone
- Test input sanitization removes XSS payloads
- Test rate limiting blocks excessive requests
- Test admin authentication on `/api/check-env` endpoint
- Test JWT_SECRET validation fails fast when not configured
- Test password hashing uses PBKDF2-SHA256 with 100,000 iterations

### Property-Based Tests

- Generate random table names and verify unmapped ones return 400 error
- Generate random user roles and verify permissions are enforced correctly
- Generate random candidate data and verify validation rules are applied
- Generate random file uploads and verify type/size restrictions
- Generate random IP addresses and verify rate limiting works per-IP
- Generate random JWT tokens and verify only valid ones authenticate
- Generate random admin/non-admin users and verify diagnostic endpoint access

### Integration Tests

- Test full authentication flow: login → JWT token → authorized request
- Test full candidate submission flow: CAPTCHA → validation → duplicate check → rate limit → database insert
- Test full RBAC flow: authenticate as HR manager → attempt to access payroll table → receive 403
- Test full diagnostic endpoint flow: authenticate as admin → access `/api/check-env` → receive environment status
- Test secrets rotation flow: update JWT_SECRET → verify old tokens are invalidated → verify new tokens work
- Test file upload flow: submit application with PDF resume → verify file is validated and stored
- Test preservation flow: perform legitimate operations before and after fixes → verify identical behavior
