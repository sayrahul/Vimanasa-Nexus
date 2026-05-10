/**
 * File Upload Validation
 * 
 * Validates file types and sizes for secure file uploads
 */

// Allowed MIME types for file uploads
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validate uploaded file
 * @param {File|Object} file - File object with type, size, and name properties
 * @returns {{valid: boolean, error?: string}}
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    return { 
      valid: false, 
      error: `File size (${sizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  // Check file type (MIME type)
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Only PDF and DOCX files are allowed',
    };
  }

  // Check file extension
  const fileName = file.name || '';
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return { 
      valid: false, 
      error: `Invalid file extension "${extension}". Only PDF and DOCX files are allowed`,
    };
  }

  // Additional security check: file name length
  if (fileName.length > 255) {
    return { 
      valid: false, 
      error: 'File name is too long (maximum 255 characters)',
    };
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /[<>:"|?*]/,  // Invalid characters
    /^\./, // Hidden files
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fileName)) {
      return { 
        valid: false, 
        error: 'File name contains invalid characters',
      };
    }
  }

  return { valid: true };
}

/**
 * Validate multiple files
 * @param {File[]|Object[]} files - Array of file objects
 * @returns {{valid: boolean, errors?: string[]}}
 */
export function validateFiles(files) {
  if (!Array.isArray(files) || files.length === 0) {
    return { valid: false, errors: ['No files provided'] };
  }

  const errors = [];

  for (let i = 0; i < files.length; i++) {
    const result = validateFile(files[i]);
    if (!result.valid) {
      errors.push(`File ${i + 1}: ${result.error}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Get allowed file types for display
 * @returns {string}
 */
export function getAllowedFileTypes() {
  return 'PDF, DOC, DOCX';
}

/**
 * Get maximum file size for display
 * @returns {string}
 */
export function getMaxFileSize() {
  return `${MAX_FILE_SIZE / (1024 * 1024)}MB`;
}

/**
 * Get file validation configuration
 * @returns {Object}
 */
export function getFileValidationConfig() {
  return {
    allowedTypes: ALLOWED_TYPES,
    allowedExtensions: ALLOWED_EXTENSIONS,
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeMB: MAX_FILE_SIZE / (1024 * 1024),
  };
}
