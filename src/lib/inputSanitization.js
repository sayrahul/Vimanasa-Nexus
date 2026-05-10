/**
 * Input Sanitization
 * 
 * Sanitizes user input to prevent XSS and injection attacks
 */

/**
 * Sanitize a single string value
 * @param {string} value - The string to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(value) {
  if (typeof value !== 'string') {
    return value;
  }

  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Sanitize an object's string properties
 * @param {Object} data - The object to sanitize
 * @returns {Object} Sanitized object
 */
export function sanitizeInput(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return data;
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      // Sanitize array elements
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : 
        typeof item === 'object' ? sanitizeInput(item) : 
        item
      );
    } else {
      // Keep non-string values as-is (numbers, booleans, null)
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitize HTML content (more aggressive)
 * @param {string} html - HTML content to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  if (typeof html !== 'string') {
    return html;
  }

  // Remove all HTML tags
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}

/**
 * Validate and sanitize email address
 * @param {string} email - Email address to validate
 * @returns {{valid: boolean, sanitized?: string, error?: string}}
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') {
    return { valid: false, error: 'Email must be a string' };
  }

  const trimmed = email.trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check for suspicious patterns
  if (trimmed.includes('..') || trimmed.startsWith('.') || trimmed.endsWith('.')) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Validate and sanitize phone number
 * @param {string} phone - Phone number to validate
 * @returns {{valid: boolean, sanitized?: string, error?: string}}
 */
export function sanitizePhone(phone) {
  if (typeof phone !== 'string') {
    return { valid: false, error: 'Phone must be a string' };
  }

  // Remove all non-digit characters except + at the start
  const cleaned = phone.trim().replace(/[^\d+]/g, '');

  // E.164 format validation (international phone numbers)
  const phoneRegex = /^\+?[1-9]\d{7,14}$/;

  if (!phoneRegex.test(cleaned)) {
    return { valid: false, error: 'Invalid phone number format' };
  }

  return { valid: true, sanitized: cleaned };
}

/**
 * Sanitize URL
 * @param {string} url - URL to sanitize
 * @returns {{valid: boolean, sanitized?: string, error?: string}}
 */
export function sanitizeUrl(url) {
  if (typeof url !== 'string') {
    return { valid: false, error: 'URL must be a string' };
  }

  const trimmed = url.trim();

  // Only allow http and https protocols
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return { valid: false, error: 'URL must start with http:// or https://' };
  }

  // Check for suspicious patterns
  if (trimmed.includes('javascript:') || trimmed.includes('data:') || trimmed.includes('vbscript:')) {
    return { valid: false, error: 'Invalid URL protocol' };
  }

  try {
    const urlObj = new URL(trimmed);
    return { valid: true, sanitized: urlObj.href };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Remove SQL injection patterns
 * @param {string} value - Value to check
 * @returns {string} Sanitized value
 */
export function sanitizeSql(value) {
  if (typeof value !== 'string') {
    return value;
  }

  // Remove common SQL injection patterns
  return value
    .replace(/['";]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/exec\s/gi, '')
    .replace(/execute\s/gi, '')
    .replace(/union\s/gi, '')
    .replace(/select\s/gi, '')
    .replace(/insert\s/gi, '')
    .replace(/update\s/gi, '')
    .replace(/delete\s/gi, '')
    .replace(/drop\s/gi, '')
    .trim();
}

/**
 * Sanitize candidate application data
 * @param {Object} data - Candidate data
 * @returns {Object} Sanitized data
 */
export function sanitizeCandidateData(data) {
  const sanitized = sanitizeInput(data);

  // Additional validation for specific fields
  if (sanitized.Email) {
    const emailResult = sanitizeEmail(sanitized.Email);
    if (emailResult.valid) {
      sanitized.Email = emailResult.sanitized;
    }
  }

  if (sanitized.Phone) {
    const phoneResult = sanitizePhone(sanitized.Phone);
    if (phoneResult.valid) {
      sanitized.Phone = phoneResult.sanitized;
    }
  }

  return sanitized;
}

/**
 * Check if string contains XSS patterns
 * @param {string} value - Value to check
 * @returns {boolean} True if XSS patterns detected
 */
export function containsXss(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i,
  ];

  return xssPatterns.some(pattern => pattern.test(value));
}

/**
 * Sanitize and validate all input
 * @param {Object} data - Data to sanitize
 * @param {Object} options - Validation options
 * @returns {{valid: boolean, sanitized?: Object, errors?: string[]}}
 */
export function validateAndSanitize(data, options = {}) {
  const {
    checkXss = true,
    checkSql = true,
    sanitizeHtmlContent = false,
  } = options;

  const errors = [];

  // Check for XSS patterns
  if (checkXss) {
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && containsXss(value)) {
        errors.push(`Field "${key}" contains potentially malicious content`);
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Sanitize the data
  let sanitized = sanitizeInput(data);

  // Additional SQL sanitization if requested
  if (checkSql) {
    const sqlSanitized = {};
    for (const [key, value] of Object.entries(sanitized)) {
      sqlSanitized[key] = typeof value === 'string' ? sanitizeSql(value) : value;
    }
    sanitized = sqlSanitized;
  }

  // HTML sanitization if requested
  if (sanitizeHtmlContent) {
    const htmlSanitized = {};
    for (const [key, value] of Object.entries(sanitized)) {
      htmlSanitized[key] = typeof value === 'string' ? sanitizeHtml(value) : value;
    }
    sanitized = htmlSanitized;
  }

  return { valid: true, sanitized };
}
