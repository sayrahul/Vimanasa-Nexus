# Bugfix Requirements Document: Security Vulnerabilities Fix

## Introduction

This document outlines the requirements for fixing critical security vulnerabilities in the Vimanasa Nexus application. The application currently exposes sensitive data, allows unauthorized access, and lacks proper security controls for a payroll/HR system handling sensitive employee and financial information.

The vulnerabilities span five major areas:
1. **Exposed Secrets in Repository** - Hardcoded credentials visible in version control
2. **Public Environment Diagnostic Pages** - System information exposed to unauthenticated users
3. **Demo/Local Auth in Production** - Hardcoded demo users and fallback secrets in production
4. **Unlocked Database API** - Potential for unauthorized table access
5. **Unvalidated Public Applications** - Public endpoints vulnerable to spam and abuse

These vulnerabilities pose critical risks including unauthorized database access, data breaches of payroll/HR data, compliance violations, and abuse of public endpoints.

---

## Bug Analysis

### Current Behavior (Defect)

#### 1. Exposed Secrets in Repository

**1.1** WHEN the repository is accessed THEN hardcoded credentials (Supabase service role key, admin password, Gemini API key) are visible in source code files (auth.js, rbac.js, setup scripts)

**1.2** WHEN an attacker obtains these credentials THEN they can gain full administrative access to the database and external services

#### 2. Public Environment Diagnostic Pages

**2.1** WHEN an unauthenticated user accesses `/api/check-env` THEN the system returns environment configuration status without requiring authentication (current implementation has admin check but may be bypassed)

**2.2** WHEN an unauthenticated user accesses `/debug`, `/recruitment-debug`, or `/health-check` routes THEN the system exposes system information and diagnostic data

#### 3. Demo/Local Auth in Production

**3.1** WHEN the application runs in production THEN hardcoded demo users with plaintext password mappings ('Vimanasa@2026', 'hr123', 'finance123') remain active in auth.js

**3.2** WHEN JWT_SECRET is not configured THEN the system falls back to a test-only secret or null, allowing token forgery or authentication bypass

**3.3** WHEN users view setup scripts or test files THEN demo credentials are displayed in console output and documentation

**3.4** WHEN authentication is attempted THEN the system uses a hardcoded USERS array instead of a proper database with hashed passwords

#### 4. Unlocked Database API

**4.1** WHEN an authenticated user sends a request with an unmapped table name THEN the database API falls back to `tableMapping[table] || table` allowing arbitrary table access (Note: Current code uses `resolveTable()` which returns `undefined` for unmapped tables, but the vulnerability exists if this logic is modified)

**4.2** WHEN role-based permissions are checked THEN the system lacks granular per-table, per-action permissions for all roles

**4.3** WHEN a user with limited permissions attempts to access data THEN the system may allow access to tables not explicitly restricted

#### 5. Unvalidated Public Applications

**5.1** WHEN a public user submits a candidate application via POST `/api/database?table=candidates` THEN the system accepts submissions without rate limiting beyond basic 30 req/min

**5.2** WHEN a public user submits a candidate application THEN the system lacks CAPTCHA verification to prevent automated spam

**5.3** WHEN a public user submits duplicate applications THEN the system does not check for existing submissions based on email/phone

**5.4** WHEN a public user uploads files in a candidate application THEN the system lacks file type validation, size limits, and malware scanning

**5.5** WHEN a public user submits a candidate application THEN the system uses basic Zod validation but lacks comprehensive business rule validation

---

### Expected Behavior (Correct)

#### 1. Exposed Secrets in Repository

**2.1** WHEN the application needs credentials THEN the system SHALL retrieve all secrets exclusively from Vercel Environment Variables (never from source code)

**2.2** WHEN credentials are rotated THEN the system SHALL use new, unique secrets for Supabase service role key, JWT_SECRET, and Gemini API key

**2.3** WHEN source code is committed THEN the system SHALL contain no hardcoded credentials, API keys, or sensitive configuration values

#### 2. Public Environment Diagnostic Pages

**2.4** WHEN an unauthenticated user attempts to access `/api/check-env` THEN the system SHALL return 401 Unauthorized

**2.5** WHEN a non-admin authenticated user attempts to access `/api/check-env` THEN the system SHALL return 403 Forbidden

**2.6** WHEN diagnostic routes (`/debug`, `/recruitment-debug`, `/health-check`) are accessed THEN the system SHALL either remove these routes or protect them with admin-only authentication

#### 3. Demo/Local Auth in Production

**2.7** WHEN the application runs in any environment THEN the system SHALL use Supabase Auth or a proper users table with bcrypt-hashed passwords

**2.8** WHEN JWT_SECRET is not configured THEN the system SHALL fail to start with a clear error message (no fallback to test secrets)

**2.9** WHEN users are authenticated THEN the system SHALL validate credentials against a secure database with properly hashed passwords

**2.10** WHEN user roles are assigned THEN the system SHALL implement role-based access control with audit logging

**2.11** WHEN demo credentials are needed for development THEN the system SHALL only allow them in local development environments (NODE_ENV === 'development')

#### 4. Unlocked Database API

**2.12** WHEN a table name is provided to the database API THEN the system SHALL use an explicit allowlist and reject any unmapped table names

**2.13** WHEN role-based permissions are evaluated THEN the system SHALL enforce granular per-table, per-action permissions for each role

**2.14** WHEN a user attempts to access a table THEN the system SHALL verify both table access permission and action permission (read/write/delete) for that specific role

**2.15** WHEN permission checks fail THEN the system SHALL log the unauthorized access attempt with user ID, table, and action

#### 5. Unvalidated Public Applications

**2.16** WHEN a public user submits a candidate application THEN the system SHALL enforce strict rate limiting (e.g., 5 submissions per IP per hour)

**2.17** WHEN a public user submits a candidate application THEN the system SHALL require Cloudflare Turnstile CAPTCHA verification

**2.18** WHEN a public user submits a candidate application THEN the system SHALL check for duplicate submissions based on email and phone number

**2.19** WHEN a public user uploads files THEN the system SHALL validate file types (PDF, DOCX only), enforce size limits (5MB max), and scan for malware

**2.20** WHEN a public user submits a candidate application THEN the system SHALL validate all fields with comprehensive business rules (phone format, PAN format, Aadhar format)

**2.21** WHEN a candidate application is submitted THEN the system SHALL sanitize all input to prevent XSS and SQL injection attacks

---

### Unchanged Behavior (Regression Prevention)

#### Authentication & Authorization

**3.1** WHEN a valid admin user authenticates with correct credentials THEN the system SHALL CONTINUE TO grant full access to all resources

**3.2** WHEN an HR manager authenticates THEN the system SHALL CONTINUE TO have read access to workforce, attendance, and leave data

**3.3** WHEN a finance manager authenticates THEN the system SHALL CONTINUE TO have read/write access to payroll, finance, and invoice data

**3.4** WHEN a user's JWT token is valid and not expired THEN the system SHALL CONTINUE TO authenticate the request successfully

#### Database API Functionality

**3.5** WHEN an authorized user requests data from a permitted table THEN the system SHALL CONTINUE TO return the data successfully

**3.6** WHEN an authorized user creates, updates, or deletes records in permitted tables THEN the system SHALL CONTINUE TO perform the operation successfully

**3.7** WHEN the database API receives valid requests THEN the system SHALL CONTINUE TO use the existing tableMapping for legitimate table name resolution

**3.8** WHEN data is transformed between frontend and database formats THEN the system SHALL CONTINUE TO use toDB() and toFrontend() mappers correctly

#### Public Endpoints

**3.9** WHEN a public user views open job postings via GET `/api/database?table=job_openings` THEN the system SHALL CONTINUE TO return only jobs with status='open' without authentication

**3.10** WHEN a legitimate candidate submits a valid application THEN the system SHALL CONTINUE TO accept and store the application successfully

**3.11** WHEN public endpoints are accessed with valid data THEN the system SHALL CONTINUE TO respond with appropriate success messages

#### CORS & Headers

**3.12** WHEN requests are made from allowed origins (nexus.vimanasa.com, localhost:3000) THEN the system SHALL CONTINUE TO include proper CORS headers

**3.13** WHEN API responses are returned THEN the system SHALL CONTINUE TO include Cache-Control: no-store headers

#### Error Handling

**3.14** WHEN database tables do not exist THEN the system SHALL CONTINUE TO return empty arrays gracefully instead of 500 errors

**3.15** WHEN validation fails on user input THEN the system SHALL CONTINUE TO return 400 Bad Request with descriptive error messages

**3.16** WHEN rate limits are exceeded THEN the system SHALL CONTINUE TO return 429 Too Many Requests

---

## Bug Condition Derivation

### Bug Condition Functions

#### C1: Exposed Secrets Condition
```pascal
FUNCTION isExposedSecretsCondition(X)
  INPUT: X of type SourceCodeFile
  OUTPUT: boolean
  
  // Returns true when secrets are hardcoded in source code
  RETURN (X.contains_hardcoded_credentials OR 
          X.contains_api_keys OR 
          X.contains_jwt_secret OR
          X.contains_database_credentials)
END FUNCTION
```

#### C2: Unauthenticated Diagnostic Access Condition
```pascal
FUNCTION isUnauthenticatedDiagnosticAccess(X)
  INPUT: X of type HTTPRequest
  OUTPUT: boolean
  
  // Returns true when diagnostic endpoints are accessed without proper auth
  RETURN (X.path IN ['/api/check-env', '/debug', '/recruitment-debug', '/health-check'] AND
          (X.auth_token IS NULL OR X.user_role != 'super_admin'))
END FUNCTION
```

#### C3: Demo Auth in Production Condition
```pascal
FUNCTION isDemoAuthInProduction(X)
  INPUT: X of type AuthenticationAttempt
  OUTPUT: boolean
  
  // Returns true when demo credentials work in production
  RETURN (X.environment = 'production' AND
          (X.uses_hardcoded_users OR 
           X.uses_fallback_jwt_secret OR
           X.password IN ['Vimanasa@2026', 'hr123', 'finance123']))
END FUNCTION
```

#### C4: Arbitrary Table Access Condition
```pascal
FUNCTION isArbitraryTableAccess(X)
  INPUT: X of type DatabaseAPIRequest
  OUTPUT: boolean
  
  // Returns true when unmapped table names could be accessed
  RETURN (X.table NOT IN tableMapping.keys() AND
          X.is_authenticated = true)
END FUNCTION
```

#### C5: Unvalidated Public Submission Condition
```pascal
FUNCTION isUnvalidatedPublicSubmission(X)
  INPUT: X of type CandidateSubmission
  OUTPUT: boolean
  
  // Returns true when public submissions lack proper validation
  RETURN (X.is_public = true AND
          (X.lacks_captcha OR 
           X.lacks_duplicate_check OR
           X.lacks_file_validation OR
           X.exceeds_rate_limit = false))
END FUNCTION
```

### Property Specifications

#### Property P1: Secrets Protection
```pascal
// Property: Fix Checking - No Hardcoded Secrets
FOR ALL X WHERE isExposedSecretsCondition(X) DO
  result ← scanSourceCode'(X)
  ASSERT result.contains_hardcoded_credentials = false AND
         result.uses_environment_variables = true AND
         all_secrets_rotated = true
END FOR
```

#### Property P2: Diagnostic Endpoint Protection
```pascal
// Property: Fix Checking - Authenticated Diagnostic Access
FOR ALL X WHERE isUnauthenticatedDiagnosticAccess(X) DO
  result ← handleDiagnosticRequest'(X)
  ASSERT (result.status = 401 OR result.status = 403) AND
         result.exposes_no_system_info = true
END FOR
```

#### Property P3: Production Auth Security
```pascal
// Property: Fix Checking - Secure Production Authentication
FOR ALL X WHERE isDemoAuthInProduction(X) DO
  result ← authenticate'(X)
  ASSERT result.uses_database_auth = true AND
         result.uses_hashed_passwords = true AND
         result.requires_jwt_secret = true AND
         result.demo_credentials_disabled = true
END FOR
```

#### Property P4: Table Access Control
```pascal
// Property: Fix Checking - Explicit Table Allowlist
FOR ALL X WHERE isArbitraryTableAccess(X) DO
  result ← resolveTable'(X.table)
  ASSERT result = undefined AND
         response.status = 400 AND
         response.message = 'Unsupported or missing table'
END FOR
```

#### Property P5: Public Submission Validation
```pascal
// Property: Fix Checking - Comprehensive Public Validation
FOR ALL X WHERE isUnvalidatedPublicSubmission(X) DO
  result ← submitCandidateApplication'(X)
  ASSERT result.captcha_verified = true AND
         result.duplicate_checked = true AND
         result.rate_limit_enforced = true AND
         result.files_validated = true AND
         result.input_sanitized = true
END FOR
```

### Preservation Goal

```pascal
// Property: Preservation Checking - Maintain Existing Functionality
FOR ALL X WHERE NOT (isExposedSecretsCondition(X) OR 
                     isUnauthenticatedDiagnosticAccess(X) OR
                     isDemoAuthInProduction(X) OR
                     isArbitraryTableAccess(X) OR
                     isUnvalidatedPublicSubmission(X)) DO
  ASSERT F(X) = F'(X)
END FOR
```

This ensures that for all non-buggy inputs (legitimate authenticated requests, valid operations, proper usage), the fixed code behaves identically to the original code.

---

## Summary

This bugfix addresses five critical security vulnerabilities:

1. **Secrets Management**: Move all credentials to environment variables and rotate exposed secrets
2. **Diagnostic Endpoints**: Protect or remove public diagnostic routes
3. **Authentication System**: Replace demo auth with proper database-backed authentication using hashed passwords
4. **Database API Security**: Enforce strict table allowlists and granular role-based permissions
5. **Public Endpoint Protection**: Add CAPTCHA, rate limiting, duplicate checks, and file validation

The fix ensures that:
- **No secrets are exposed** in source code or version control
- **Diagnostic endpoints require admin authentication** or are removed
- **Production uses secure authentication** with no demo credentials or fallback secrets
- **Database API enforces strict access control** with explicit allowlists
- **Public endpoints are protected** against spam, abuse, and malicious uploads

All existing legitimate functionality for authenticated users, authorized operations, and public job viewing will continue to work as expected.
