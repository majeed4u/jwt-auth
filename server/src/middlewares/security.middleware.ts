import type { Request, Response, NextFunction } from 'express';
import { securityHeaders } from '../utils/security';

export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Add security headers
    Object.entries(securityHeaders).forEach(([header, value]) => {
        res.setHeader(header, value);
    });

    // Add HSTS header in production
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');

    next();
};
