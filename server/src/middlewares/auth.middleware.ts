import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import db from '../database';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string | null;
                name: string | null;
                image: string | null;
                createdAt: Date;
            };
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {


        // 1. Get the token from the cookies or authorization header
        const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

        if (process.env.NODE_ENV === 'development') {
            console.log('Token found:', token ? 'YES' : 'NO');
        }

        if (!token) {
            return res.status(401).json({ error: 'Access token missing.' });
        }

        // 2. Verify the token with enhanced verification
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
            issuer: 'jwt-auth-server',
            audience: 'jwt-auth-frontend'
        }) as { userId: string; type: string; email: string };

        // 3. Verify token type
        if (decoded.type !== 'access') {
            return res.status(401).json({ error: 'Invalid token type.' });
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('Token decoded successfully. User ID:', decoded.userId);
        }

        // 4. Attach user info to the request object
        const user = await db.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true, image: true, createdAt: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // 5. Optional: Check if user's email matches token (prevents token reuse after email change)
        if (user.email !== decoded.email) {
            return res.status(401).json({ error: 'Token invalid for current user.' });
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('✅ User found:', { id: user.id, email: user.email, name: user.name });
        }

        // 6. Attach the user object to the request for the next middleware
        req.user = user;

        // 7. Proceed to the next middleware/route handler
        next();

    } catch (error) {
        console.error('❌ Authorization error:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid access token.' });
        }
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Access token expired.' });
        }
        return res.status(401).json({ error: 'Invalid or expired access token.' });
    }
};