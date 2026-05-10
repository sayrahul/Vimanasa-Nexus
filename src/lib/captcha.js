/**
 * Cloudflare Turnstile CAPTCHA Verification
 * 
 * Verifies CAPTCHA tokens to prevent automated bot submissions
 */

/**
 * Verify Cloudflare Turnstile CAPTCHA token
 * @param {string} token - The CAPTCHA token from the client
 * @param {string} remoteIp - The client's IP address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function verifyCaptcha(token, remoteIp) {
  // Skip CAPTCHA in development if not configured
  if (process.env.NODE_ENV === 'development' && !process.env.TURNSTILE_SECRET_KEY) {
    console.warn('⚠️  CAPTCHA verification skipped in development (TURNSTILE_SECRET_KEY not set)');
    return { success: true };
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('❌ TURNSTILE_SECRET_KEY not configured');
    return { success: false, error: 'CAPTCHA not configured' };
  }

  if (!token) {
    return { success: false, error: 'CAPTCHA token missing' };
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: remoteIp,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('CAPTCHA verification request failed:', response.status);
      return { success: false, error: 'CAPTCHA verification failed' };
    }

    if (!data.success) {
      console.warn('CAPTCHA verification failed:', data['error-codes']);
      return { 
        success: false, 
        error: 'CAPTCHA verification failed',
        errorCodes: data['error-codes'],
      };
    }

    return { success: true };
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return { success: false, error: 'CAPTCHA verification error' };
  }
}

/**
 * Check if CAPTCHA is configured
 * @returns {boolean}
 */
export function isCaptchaConfigured() {
  return !!process.env.TURNSTILE_SECRET_KEY;
}

/**
 * Get CAPTCHA configuration status
 * @returns {Object}
 */
export function getCaptchaStatus() {
  return {
    configured: isCaptchaConfigured(),
    environment: process.env.NODE_ENV || 'development',
    required: process.env.NODE_ENV === 'production',
  };
}
