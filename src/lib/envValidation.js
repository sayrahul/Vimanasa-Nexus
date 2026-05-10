/**
 * Environment Variable Validation
 * 
 * Validates required environment variables on application startup
 * Fails fast if critical configuration is missing
 */

const REQUIRED_ENV_VARS = {
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: {
    required: true,
    description: 'Supabase project URL',
    example: 'https://xxxxx.supabase.co',
    validate: (value) => value?.startsWith('https://') && value.includes('.supabase.co'),
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    required: true,
    description: 'Supabase anonymous/public key',
    example: 'eyJhbGc...',
    validate: (value) => value?.startsWith('eyJ') && value.length > 100,
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    required: true,
    description: 'Supabase service role key (admin access)',
    example: 'eyJhbGc...',
    validate: (value) => value?.startsWith('eyJ') && value.length > 100,
    sensitive: true,
  },
  
  // Authentication
  JWT_SECRET: {
    required: true,
    description: 'Secret key for JWT token signing',
    example: 'your-super-secret-jwt-key-min-32-chars',
    validate: (value) => value && value.length >= 32,
    sensitive: true,
  },
  
  // Optional but recommended
  NEXT_PUBLIC_GEMINI_API_KEY: {
    required: false,
    description: 'Google Gemini AI API key (optional)',
    example: 'AIzaSy...',
    validate: (value) => !value || value.startsWith('AIzaSy'),
    sensitive: true,
  },
};

/**
 * Validate all required environment variables
 * @param {Object} options - Validation options
 * @param {boolean} options.throwOnError - Throw error if validation fails (default: true)
 * @param {boolean} options.logResults - Log validation results (default: true)
 * @returns {Object} Validation result
 */
export function validateEnvironment(options = {}) {
  const {
    throwOnError = true,
    logResults = true,
  } = options;

  const results = {
    valid: true,
    missing: [],
    invalid: [],
    warnings: [],
    checked: [],
  };

  // Check each required variable
  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[key];
    const exists = value !== undefined && value !== null && value !== '';

    results.checked.push(key);

    // Check if required variable is missing
    if (config.required && !exists) {
      results.valid = false;
      results.missing.push({
        key,
        description: config.description,
        example: config.example,
      });
      continue;
    }

    // Skip validation if optional and not provided
    if (!config.required && !exists) {
      results.warnings.push({
        key,
        message: `Optional variable not set: ${config.description}`,
      });
      continue;
    }

    // Validate value format if provided
    if (exists && config.validate && !config.validate(value)) {
      results.valid = false;
      results.invalid.push({
        key,
        description: config.description,
        example: config.example,
        reason: 'Invalid format or value',
      });
    }
  }

  // Log results if requested
  if (logResults) {
    logValidationResults(results);
  }

  // Throw error if validation failed and throwOnError is true
  if (!results.valid && throwOnError) {
    const errorMessage = formatErrorMessage(results);
    throw new Error(errorMessage);
  }

  return results;
}

/**
 * Log validation results to console
 * @param {Object} results
 */
function logValidationResults(results) {
  if (results.valid && results.warnings.length === 0) {
    console.log('✅ Environment validation passed');
    return;
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔍 Environment Variable Validation Results');
  console.log('='.repeat(60));

  if (results.missing.length > 0) {
    console.log('\n❌ Missing Required Variables:');
    results.missing.forEach(({ key, description, example }) => {
      console.log(`\n   ${key}`);
      console.log(`   Description: ${description}`);
      console.log(`   Example: ${example}`);
    });
  }

  if (results.invalid.length > 0) {
    console.log('\n❌ Invalid Variables:');
    results.invalid.forEach(({ key, description, reason, example }) => {
      console.log(`\n   ${key}`);
      console.log(`   Description: ${description}`);
      console.log(`   Reason: ${reason}`);
      console.log(`   Example: ${example}`);
    });
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(({ key, message }) => {
      console.log(`   - ${key}: ${message}`);
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Format error message for throwing
 * @param {Object} results
 * @returns {string}
 */
function formatErrorMessage(results) {
  const lines = ['Environment validation failed:'];

  if (results.missing.length > 0) {
    lines.push('\nMissing required variables:');
    results.missing.forEach(({ key, description }) => {
      lines.push(`  - ${key}: ${description}`);
    });
  }

  if (results.invalid.length > 0) {
    lines.push('\nInvalid variables:');
    results.invalid.forEach(({ key, reason }) => {
      lines.push(`  - ${key}: ${reason}`);
    });
  }

  lines.push('\nPlease check your .env.local file or environment configuration.');

  return lines.join('\n');
}

/**
 * Get safe environment info (without sensitive values)
 * @returns {Object}
 */
export function getSafeEnvironmentInfo() {
  const info = {};

  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[key];
    const exists = value !== undefined && value !== null && value !== '';

    if (config.sensitive) {
      info[key] = exists ? '***SET***' : 'NOT SET';
    } else {
      info[key] = exists ? value : 'NOT SET';
    }
  }

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    variables: info,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check if running in production
 * @returns {boolean}
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 * @returns {boolean}
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
}

/**
 * Check if running in test environment
 * @returns {boolean}
 */
export function isTest() {
  return process.env.NODE_ENV === 'test';
}

/**
 * Validate environment on module load (only in production)
 */
if (isProduction() && typeof window === 'undefined') {
  // Only validate on server-side in production
  try {
    validateEnvironment({
      throwOnError: true,
      logResults: true,
    });
  } catch (error) {
    console.error('\n🚨 FATAL: Environment validation failed in production\n');
    console.error(error.message);
    console.error('\nApplication cannot start without proper configuration.\n');
    process.exit(1);
  }
}

// Export for testing
export const REQUIRED_VARS = REQUIRED_ENV_VARS;
