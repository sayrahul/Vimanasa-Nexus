# Implementation Plan

## Overview

This task list implements fixes for five critical security vulnerabilities in the Vimanasa Nexus HR/Payroll application. The authentication system (Vulnerability #3) has been largely implemented with database-backed authentication, PBKDF2-SHA256 password hashing, JWT validation, user management UI, and audit logging. This plan focuses on completing the remaining security fixes and comprehensive testing.

---

## Phase 1: Exploratory Bug Condition Testing (BEFORE Fixes)

### 1. Write bug condition exploration tests for all 5 vulnerabilities

- [ ] 1.1 Test Vulnerability #1: Exposed Secrets
  - **Property 1: Bug Condition** - Hardcoded Secrets Detection
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate secrets are exposed in source code
  - **Scoped PBT Approach**: Scan specific file patterns (test scripts, setup scripts, documentation) for hardcoded credentials
  - Test implementation: Scan all `.js`, `.md`, and `.sql` files for patterns matching API keys, passwords, service role keys
  - Search for: `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `GEMINI_API_KEY`, demo passwords like 'Vimanasa@2026', 'hr123', 'finance123'
  - Check for console.log statements that display actual secret values (not just "SET" or "NOT SET")
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS - finds secrets in test scripts, setup scripts, or documentation
  - Document counterexamples found (e.g., "test-api.js line 15 logs SUPABASE_SERVICE_ROLE_KEY value")
  - Mark task complete when test is written, run, and failures are documented
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 1.2 Test Vulnerability #2: Unauthenticated Diagnostic Access
  - **Property 1: Bug Condition** - Diagnostic Endpoint Protection
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate diagnostic endpoints can be accessed without proper authentication
  - **Scoped PBT Approach**: Test specific diagnostic endpoints with various authentication states
  - Test implementation:
    - Send GET request to `/api/check-env` without auth token (should return 401)
    - Send GET request to `/api/check-env` with valid non-admin JWT (should return 403)
    - Search codebase for routes containing "debug", "health", "diagnostic", "status"
    - Test any found routes without authentication
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS if any diagnostic endpoint is accessible without admin auth
  - Document counterexamples found (e.g., "/debug route returns system info without auth")
  - Mark task complete when test is written, run, and results are documented
  - _Requirements: 2.4, 2.5, 2.6_

- [ ] 1.3 Test Vulnerability #3: Demo Credentials in Production
  - **Property 1: Bug Condition** - Demo Credentials Detection
  - **CRITICAL**: This test may PASS on unfixed code if auth migration is complete - this is acceptable
  - **NOTE**: Auth system has been migrated to database-backed authentication, but demo credentials may exist in setup scripts
  - **GOAL**: Surface counterexamples that demonstrate demo credentials are still present in codebase
  - **Scoped PBT Approach**: Search for demo credential strings in all files
  - Test implementation:
    - Search all files for demo password strings: 'Vimanasa@2026', 'hr123', 'finance123'
    - Check setup scripts for console.log statements displaying demo passwords
    - Verify JWT_SECRET validation fails fast when not configured (already implemented)
    - Check if demo users exist in database with is_active=true in production
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS if demo credentials found in setup scripts or documentation
  - Document counterexamples found (e.g., "setup-secure-auth.js displays 'Vimanasa@2026' in console")
  - Mark task complete when test is written, run, and results are documented
  - _Requirements: 2.7, 2.8, 2.9, 2.10, 2.11_

- [ ] 1.4 Test Vulnerability #4: Arbitrary Table Access
  - **Property 1: Bug Condition** - Unmapped Table Access
  - **CRITICAL**: This test should PASS on unfixed code if resolveTable() is implemented correctly
  - **NOTE**: resolveTable() returns undefined for unmapped tables, but need to verify all code paths handle this
  - **GOAL**: Surface counterexamples that demonstrate arbitrary table access or insufficient permission checks
  - **Scoped PBT Approach**: Test specific unmapped table names and role/table/action combinations
  - Test implementation:
    - Send authenticated request with `?table=users` (not in tableMapping) - should return 400
    - Send authenticated request with `?table=internal_config` - should return 400
    - Test HR manager attempting to write to `payroll` table - should return 403
    - Test finance manager attempting to read `candidates` table - should return 403
    - Test employee role attempting to access any table - should return 403
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS if any unauthorized access is allowed or error handling is incomplete
  - Document counterexamples found (e.g., "HR manager can write to payroll table")
  - Mark task complete when test is written, run, and results are documented
  - _Requirements: 2.12, 2.13, 2.14, 2.15_

- [ ] 1.5 Test Vulnerability #5: Unvalidated Public Submissions
  - **Property 1: Bug Condition** - Public Submission Validation Gaps
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate public submissions lack proper validation
  - **Scoped PBT Approach**: Test specific validation gaps (CAPTCHA, duplicates, file validation, rate limiting)
  - Test implementation:
    - Submit candidate application without CAPTCHA token - should be rejected
    - Submit same email twice within short time - should detect duplicate
    - Attempt to upload .exe file as resume - should reject invalid file type
    - Attempt to upload 50MB PDF file - should reject oversized file
    - Submit 10 applications from same IP within 1 hour - should hit rate limit
    - Submit application with XSS payload in "Full Name" field - should sanitize input
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS - submissions accepted without CAPTCHA, duplicates allowed, files not validated
  - Document counterexamples found (e.g., "Application accepted without CAPTCHA token")
  - Mark task complete when test is written, run, and failures are documented
  - _Requirements: 2.16, 2.17, 2.18, 2.19, 2.20, 2.21_

---

## Phase 2: Preservation Property Testing (BEFORE Fixes)

### 2. Write preservation property tests (BEFORE implementing fixes)

- [ ] 2.1 Preservation Test: Admin Access
  - **Property 2: Preservation** - Admin Full Access Maintained
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Admin user with valid credentials can access all resources on unfixed code
  - Observe: Admin can read/write to all tables via database API
  - Observe: Admin can access user management dashboard
  - Write property-based test: For all admin users with valid JWT tokens, access to all resources succeeds
  - Verify test passes on UNFIXED code
  - _Requirements: 3.1_

- [ ] 2.2 Preservation Test: HR Manager Permissions
  - **Property 2: Preservation** - HR Manager Read Access Maintained
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: HR manager can read workforce, attendance, leave, candidates data on unfixed code
  - Observe: HR manager can write to workforce, employees, attendance, leave_requests, candidates tables
  - Write property-based test: For all HR managers with valid JWT tokens, permitted read/write operations succeed
  - Verify test passes on UNFIXED code
  - _Requirements: 3.2_

- [ ] 2.3 Preservation Test: Finance Manager Permissions
  - **Property 2: Preservation** - Finance Manager Access Maintained
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Finance manager can read/write payroll, finance, invoices, expenses data on unfixed code
  - Write property-based test: For all finance managers with valid JWT tokens, permitted read/write operations succeed
  - Verify test passes on UNFIXED code
  - _Requirements: 3.3_

- [ ] 2.4 Preservation Test: JWT Authentication
  - **Property 2: Preservation** - Valid JWT Tokens Continue to Work
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Valid JWT tokens authenticate requests successfully on unfixed code
  - Observe: Expired or invalid tokens are rejected
  - Write property-based test: For all valid JWT tokens, authentication succeeds; for all invalid tokens, authentication fails
  - Verify test passes on UNFIXED code
  - _Requirements: 3.4_

- [ ] 2.5 Preservation Test: Database API Operations
  - **Property 2: Preservation** - Authorized Database Operations Continue to Work
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Authorized users can query, create, update, delete records in permitted tables on unfixed code
  - Observe: toDB() and toFrontend() mappers transform data correctly
  - Write property-based test: For all authorized users and permitted tables, CRUD operations succeed
  - Verify test passes on UNFIXED code
  - _Requirements: 3.5, 3.6, 3.7, 3.8_

- [ ] 2.6 Preservation Test: Public Job Viewing
  - **Property 2: Preservation** - Public Job Viewing Continues to Work
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Public users can view open job postings without authentication on unfixed code
  - Write property-based test: For all unauthenticated requests to GET /api/database?table=job_openings, only jobs with status='open' are returned
  - Verify test passes on UNFIXED code
  - _Requirements: 3.9_

- [ ] 2.7 Preservation Test: Legitimate Candidate Submissions
  - **Property 2: Preservation** - Valid Applications Continue to Be Accepted
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Legitimate candidate applications with valid data are accepted on unfixed code
  - Write property-based test: For all valid candidate submissions (with CAPTCHA after fix), applications are stored successfully
  - Verify test passes on UNFIXED code (without CAPTCHA requirement)
  - _Requirements: 3.10, 3.11_

- [ ] 2.8 Preservation Test: CORS and Headers
  - **Property 2: Preservation** - CORS and Security Headers Continue to Work
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Requests from allowed origins receive proper CORS headers on unfixed code
  - Observe: API responses include Cache-Control: no-store headers
  - Write property-based test: For all requests from allowed origins, CORS headers are present
  - Verify test passes on UNFIXED code
  - _Requirements: 3.12, 3.13_

- [ ] 2.9 Preservation Test: Error Handling
  - **Property 2: Preservation** - Error Responses Continue to Work Correctly
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Database errors return empty arrays gracefully on unfixed code
  - Observe: Validation failures return 400 with descriptive messages
  - Observe: Rate limit exceeded returns 429
  - Write property-based test: For all error conditions, appropriate status codes and messages are returned
  - Verify test passes on UNFIXED code
  - _Requirements: 3.14, 3.15, 3.16_

---

## Phase 3: Implementation

### 3. Fix Vulnerability #1: Exposed Secrets in Repository

- [ ] 3.1 Clean up secret logging in test and setup scripts
  - Audit all test scripts: `test-api.js`, `test-supabase-connection.js`, `diagnose-fetch-issue.js`
  - Replace `console.log(process.env.SECRET_KEY)` with `console.log('SECRET_KEY:', process.env.SECRET_KEY ? 'SET' : 'NOT SET')`
  - Update setup scripts: `scripts/setup-secure-auth.js`, `scripts/quick-setup-users.js`
  - Remove any console output that displays demo passwords
  - Update `src/lib/envValidation.js` to ensure it only logs "SET" or "NOT SET", never actual values
  - Audit all `.md` documentation files for example credentials that could be confused with real ones
  - _Bug_Condition: isExposedSecretsCondition(input) where input.contains_hardcoded_credentials OR input.displays_secrets_in_console_output_
  - _Expected_Behavior: All secrets retrieved from environment variables, no hardcoded credentials in source code_
  - _Preservation: Existing environment variable usage and validation logic unchanged_
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3.2 Rotate exposed secrets
  - Generate new SUPABASE_SERVICE_ROLE_KEY via Supabase dashboard
  - Generate new JWT_SECRET (64-character random string)
  - If NEXT_PUBLIC_GEMINI_API_KEY was exposed, rotate via Google Cloud Console
  - Update all secrets in Vercel environment variables
  - Test application with new secrets to ensure functionality is preserved
  - _Bug_Condition: isExposedSecretsCondition(input) where input.uses_old_exposed_credentials_
  - _Expected_Behavior: All secrets are new, unique values not present in version control history_
  - _Preservation: Application functionality unchanged with new secrets_
  - _Requirements: 2.2_

- [ ] 3.3 Verify bug condition exploration test now passes
  - **Property 1: Expected Behavior** - No Hardcoded Secrets
  - **IMPORTANT**: Re-run the SAME test from task 1.1 - do NOT write a new test
  - The test from task 1.1 encodes the expected behavior
  - When this test passes, it confirms no secrets are exposed in source code
  - Run bug condition exploration test from step 1.1
  - **EXPECTED OUTCOME**: Test PASSES (confirms secrets are cleaned up)
  - _Requirements: 2.1, 2.2, 2.3_

### 4. Fix Vulnerability #2: Public Environment Diagnostic Pages

- [ ] 4.1 Verify and enhance diagnostic endpoint protection
  - Review `src/app/api/check-env/route.js` to verify admin authentication cannot be bypassed
  - Test with no token, invalid token, valid non-admin token, valid admin token
  - Add comprehensive error handling for all authentication failure cases
  - Add audit logging for all access attempts to diagnostic endpoints
  - Search codebase for routes containing "debug", "health", "diagnostic", "status"
  - Either remove found diagnostic routes or add same admin authentication as `/api/check-env`
  - _Bug_Condition: isUnauthenticatedDiagnosticAccess(input) where input.auth_token IS NULL OR input.user_role != 'super_admin'_
  - _Expected_Behavior: Diagnostic endpoints return 401 for missing auth, 403 for non-admin users_
  - _Preservation: Admin users continue to access diagnostic endpoints successfully_
  - _Requirements: 2.4, 2.5, 2.6_

- [ ] 4.2 Verify bug condition exploration test now passes
  - **Property 1: Expected Behavior** - Authenticated Diagnostic Access
  - **IMPORTANT**: Re-run the SAME test from task 1.2 - do NOT write a new test
  - The test from task 1.2 encodes the expected behavior
  - When this test passes, it confirms diagnostic endpoints are protected
  - Run bug condition exploration test from step 1.2
  - **EXPECTED OUTCOME**: Test PASSES (confirms endpoints require admin auth)
  - _Requirements: 2.4, 2.5, 2.6_

### 5. Fix Vulnerability #3: Demo/Local Auth in Production

- [ ] 5.1 Remove demo password display from setup scripts
  - Update `scripts/setup-secure-auth.js` to generate random passwords instead of using 'Vimanasa@2026'
  - Update `scripts/quick-setup-users.js` to remove hardcoded demo passwords from console output
  - Update `AUTH_MIGRATION_GUIDE.md` and `USER_MANAGEMENT_GUIDE.md` to remove demo credential references
  - Replace demo credential references with instructions to create secure credentials
  - Verify JWT_SECRET validation fails fast in production when not configured (already implemented in `src/lib/auth.js`)
  - Query database to check if demo users exist with is_active=true in production; if so, set to false
  - _Bug_Condition: isDemoAuthInProduction(input) where input.displays_demo_passwords_in_setup OR input.has_demo_credentials_in_code_
  - _Expected_Behavior: No demo credentials displayed or accepted in production; JWT_SECRET required_
  - _Preservation: Database-backed authentication with PBKDF2-SHA256 hashing continues to work_
  - _Requirements: 2.7, 2.8, 2.9, 2.10, 2.11_

- [ ] 5.2 Verify bug condition exploration test now passes
  - **Property 1: Expected Behavior** - No Demo Credentials in Production
  - **IMPORTANT**: Re-run the SAME test from task 1.3 - do NOT write a new test
  - The test from task 1.3 encodes the expected behavior
  - When this test passes, it confirms demo credentials are removed from codebase
  - Run bug condition exploration test from step 1.3
  - **EXPECTED OUTCOME**: Test PASSES (confirms no demo credentials in setup scripts)
  - _Requirements: 2.7, 2.8, 2.9, 2.10, 2.11_

### 6. Fix Vulnerability #4: Unlocked Database API

- [ ] 6.1 Enhance RBAC with comprehensive permissions
  - Review `src/app/api/database/route.js` to verify `resolveTable()` returns `undefined` for unmapped tables
  - Ensure all code paths check `dbTable === undefined` and return 400 error with message "Unsupported or missing table"
  - Audit `tablePermissions` object to ensure all roles have explicit permissions:
    - super_admin: '*' (all access)
    - admin: '*' (all access)
    - hr_manager: read=['dashboard', 'workforce', 'employees', 'clients', 'partners', 'attendance', 'leave', 'leave_requests', 'candidates', 'job_openings'], write=['workforce', 'employees', 'attendance', 'leave', 'leave_requests', 'candidates', 'job_openings']
    - finance_manager: read=['dashboard', 'workforce', 'employees', 'clients', 'payroll', 'finance', 'expenses', 'expense_claims', 'invoices', 'client_invoices'], write=['payroll', 'finance', 'expenses', 'expense_claims', 'invoices', 'client_invoices']
    - compliance_officer: read=['dashboard', 'workforce', 'employees', 'compliance'], write=['compliance']
    - employee: read=[], write=[] (default deny)
  - Add audit logging for all 403 Forbidden responses with user ID, table, and action to `audit_logs` table
  - Create integration tests for each role attempting to access each table with each method
  - _Bug_Condition: isArbitraryTableAccess(input) where input.table NOT IN tableMapping.keys() OR NOT hasGranularPermission(input.user_role, input.table, input.method)_
  - _Expected_Behavior: Unmapped tables return 400; unauthorized access returns 403 with audit log_
  - _Preservation: Authorized users continue to access permitted tables successfully_
  - _Requirements: 2.12, 2.13, 2.14, 2.15_

- [ ] 6.2 Verify bug condition exploration test now passes
  - **Property 1: Expected Behavior** - Explicit Table Access Control
  - **IMPORTANT**: Re-run the SAME test from task 1.4 - do NOT write a new test
  - The test from task 1.4 encodes the expected behavior
  - When this test passes, it confirms table access control is enforced
  - Run bug condition exploration test from step 1.4
  - **EXPECTED OUTCOME**: Test PASSES (confirms unmapped tables rejected, permissions enforced)
  - _Requirements: 2.12, 2.13, 2.14, 2.15_

### 7. Fix Vulnerability #5: Unvalidated Public Applications

- [ ] 7.1 Implement Cloudflare Turnstile CAPTCHA
  - Create `src/lib/captcha.js` with `verifyCaptcha(token, ip)` function
  - Implement Turnstile verification using `https://challenges.cloudflare.com/turnstile/v0/siteverify`
  - Add `TURNSTILE_SECRET_KEY` to environment variables
  - Update candidate submission handler in `src/app/api/database/route.js` to require CAPTCHA token
  - Add frontend Turnstile widget to candidate application form
  - Test CAPTCHA verification with valid and invalid tokens
  - _Bug_Condition: isUnvalidatedPublicSubmission(input) where input.lacks_captcha_verification_
  - _Expected_Behavior: All public submissions require valid CAPTCHA token_
  - _Preservation: Legitimate submissions with CAPTCHA continue to be accepted_
  - _Requirements: 2.17_

- [ ] 7.2 Implement duplicate detection
  - Add duplicate check in POST handler for candidates table
  - Query Supabase for existing candidates with same email OR phone
  - Return 400 error with message "Duplicate Submission: An application with this email or phone already exists"
  - Test duplicate detection with same email, same phone, and different email/phone
  - _Bug_Condition: isUnvalidatedPublicSubmission(input) where input.lacks_duplicate_check_
  - _Expected_Behavior: Duplicate submissions by email or phone are rejected_
  - _Preservation: First submission from unique email/phone continues to be accepted_
  - _Requirements: 2.18_

- [ ] 7.3 Implement file validation
  - Create `src/lib/fileValidation.js` with `validateFile(file)` function
  - Define ALLOWED_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  - Define MAX_FILE_SIZE: 5 * 1024 * 1024 (5MB)
  - Validate file type and size before accepting upload
  - Return 400 error for invalid file types or oversized files
  - Test file validation with PDF, DOCX, .exe, and oversized files
  - _Bug_Condition: isUnvalidatedPublicSubmission(input) where input.lacks_file_validation_
  - _Expected_Behavior: Only PDF/DOCX files under 5MB are accepted_
  - _Preservation: Valid PDF/DOCX files continue to be uploaded successfully_
  - _Requirements: 2.19_

- [ ] 7.4 Enhance rate limiting for public submissions
  - Update rate limiting in `src/app/api/database/route.js` for candidates table
  - Implement stricter rate limit: 5 submissions per IP per hour (3600000ms)
  - Use `checkRateLimit(request, 'candidate-submission', 5, 3600000)`
  - Return 429 error with message "Too many applications submitted. Please try again later."
  - Test rate limiting by submitting 6 applications from same IP within 1 hour
  - _Bug_Condition: isUnvalidatedPublicSubmission(input) where input.rate_limit_too_permissive_
  - _Expected_Behavior: Maximum 5 submissions per IP per hour enforced_
  - _Preservation: Legitimate submissions within rate limit continue to be accepted_
  - _Requirements: 2.16_

- [ ] 7.5 Implement input sanitization
  - Create `sanitizeInput(data)` function to prevent XSS attacks
  - Sanitize all string fields by replacing: < > " ' with HTML entities
  - Apply sanitization to all candidate submission fields before database insert
  - Test sanitization with XSS payloads in various fields
  - _Bug_Condition: isUnvalidatedPublicSubmission(input) where input.contains_xss_payload_
  - _Expected_Behavior: All input is sanitized to prevent XSS and SQL injection_
  - _Preservation: Legitimate text input continues to be stored correctly_
  - _Requirements: 2.21_

- [ ] 7.6 Enhance candidate schema validation
  - Update candidateSchema in `src/app/api/database/route.js`
  - Add regex validation for Full Name: `/^[a-zA-Z\s.'-]+$/`
  - Add E.164 phone format validation: `/^\+?[1-9]\d{7,14}$/`
  - Add PAN format validation: `/^[A-Z]{5}[0-9]{4}[A-Z]$/`
  - Add Aadhar format validation: `/^\d{12}$/`
  - Add required captchaToken field to schema
  - Test schema validation with valid and invalid inputs
  - _Bug_Condition: isUnvalidatedPublicSubmission(input) where input.lacks_comprehensive_validation_
  - _Expected_Behavior: All fields validated with comprehensive business rules_
  - _Preservation: Valid submissions continue to pass validation_
  - _Requirements: 2.20_

- [ ] 7.7 Verify bug condition exploration test now passes
  - **Property 1: Expected Behavior** - Comprehensive Public Validation
  - **IMPORTANT**: Re-run the SAME test from task 1.5 - do NOT write a new test
  - The test from task 1.5 encodes the expected behavior
  - When this test passes, it confirms all public submission validations are enforced
  - Run bug condition exploration test from step 1.5
  - **EXPECTED OUTCOME**: Test PASSES (confirms CAPTCHA, duplicates, files, rate limiting all enforced)
  - _Requirements: 2.16, 2.17, 2.18, 2.19, 2.20, 2.21_

---

## Phase 4: Final Validation

### 8. Verify all preservation tests still pass

- [ ] 8.1 Re-run all preservation property tests
  - **Property 2: Preservation** - All Existing Functionality Maintained
  - **IMPORTANT**: Re-run the SAME tests from tasks 2.1-2.9 - do NOT write new tests
  - Run preservation tests for:
    - Admin access (task 2.1)
    - HR manager permissions (task 2.2)
    - Finance manager permissions (task 2.3)
    - JWT authentication (task 2.4)
    - Database API operations (task 2.5)
    - Public job viewing (task 2.6)
    - Legitimate candidate submissions (task 2.7)
    - CORS and headers (task 2.8)
    - Error handling (task 2.9)
  - **EXPECTED OUTCOME**: All tests PASS (confirms no regressions)
  - Document any test failures and investigate root cause
  - _Requirements: 3.1-3.16_

### 9. Checkpoint - Ensure all tests pass

- [ ] 9.1 Run complete test suite
  - Run all bug condition exploration tests (tasks 1.1-1.5) - should all PASS
  - Run all preservation property tests (tasks 2.1-2.9) - should all PASS
  - Run unit tests for new functions (verifyCaptcha, validateFile, sanitizeInput)
  - Run integration tests for full workflows (auth, RBAC, candidate submission)
  - Verify no console errors or warnings in browser
  - Verify no server errors in logs
  - If any tests fail, investigate and fix before marking complete
  - _Requirements: All requirements 2.1-2.21, 3.1-3.16_

- [ ] 9.2 Security audit and final review
  - Perform final scan of codebase for any remaining hardcoded credentials
  - Verify all environment variables are properly configured in Vercel
  - Review audit_logs table to ensure all security events are being logged
  - Test all five vulnerabilities manually to confirm fixes are effective
  - Document any remaining security considerations or future improvements
  - Ask user if any questions arise or if additional testing is needed
  - _Requirements: All requirements 2.1-2.21, 3.1-3.16_

---

## Summary

This implementation plan addresses five critical security vulnerabilities:

1. **Exposed Secrets**: Clean up secret logging in test/setup scripts and rotate exposed credentials
2. **Diagnostic Endpoints**: Verify and enhance admin-only authentication on sensitive endpoints
3. **Demo Credentials**: Remove demo password display from setup scripts (auth system already migrated)
4. **Database API Security**: Enhance RBAC with comprehensive per-table per-action permissions
5. **Public Endpoint Protection**: Implement CAPTCHA, duplicate checking, file validation, rate limiting, and input sanitization

**Key Testing Approach**:
- **Phase 1**: Write exploration tests BEFORE fixes to surface counterexamples (tests will FAIL on unfixed code)
- **Phase 2**: Write preservation tests BEFORE fixes to capture baseline behavior (tests will PASS on unfixed code)
- **Phase 3**: Implement fixes for all five vulnerabilities
- **Phase 4**: Re-run all tests to verify fixes work and no regressions introduced

**Significant Work Already Completed**:
- Database-backed authentication with Supabase
- PBKDF2-SHA256 password hashing (100,000 iterations)
- User management API and dashboard UI
- JWT_SECRET validation
- Account lockout and audit logging
- Table allowlist via resolveTable()
- Basic rate limiting and Zod validation

**Remaining Work**:
- Clean up secret logging in test/setup scripts
- Verify diagnostic endpoint protection
- Remove demo password display from setup scripts
- Enhance RBAC with comprehensive permissions
- Implement CAPTCHA, duplicate checking, file validation
