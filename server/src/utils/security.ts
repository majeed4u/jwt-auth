import crypto from 'crypto';

/**
 * Generate a cryptographically secure random secret for JWT
 * @param length - Length of the secret (minimum 32 recommended)
 * @returns Base64 encoded secret
 */
export function generateJWTSecret(length: number = 64): string {
    return crypto.randomBytes(length).toString('base64');
}

/**
 * Hash a token using bcrypt-compatible method
 * @param token - Token to hash
 * @returns Hashed token
 */
export async function hashToken(token: string): Promise<string> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.hash(token, 12); // Use 12 rounds for better security
}

/**
 * Validate JWT token structure and basic security
 * @param secret - JWT secret to validate
 * @returns Validation result
 */
export function validateJWTSecret(secret: string): { isValid: boolean; message: string } {
    if (!secret) {
        return { isValid: false, message: 'JWT secret is required' };
    }

    if (secret.length < 32) {
        return { isValid: false, message: 'JWT secret should be at least 32 characters long' };
    }

    // Check for common weak secrets
    const weakSecrets = [
        'secret',
        'password',
        '123456',
        'your-secret-key',
        'jwt-secret',
        'development'
    ];

    if (weakSecrets.some(weak => secret.toLowerCase().includes(weak.toLowerCase()))) {
        return { isValid: false, message: 'JWT secret appears to be weak or common' };
    }

    return { isValid: true, message: 'JWT secret appears to be secure' };
}

/**
 * Security headers for production
 */
export const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;
