import type { Request, Response, NextFunction } from 'express';
import db from '../database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import env from '../config/env';

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }
        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.user.create({
            data: { name, email, password: hashedPassword }
        });
        res.status(201).json({ message: 'User created successfully.', user: newUser });

    } catch (error) {
        console.error('Error during sign up:', error);
        next(error);

    }
}

export const signIn = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password!);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const accessToken = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                type: 'access',
                iat: Math.floor(Date.now() / 1000)
            },
            env.JWT_SECRET,
            {
                expiresIn: "15m",
                issuer: 'jwt-auth-server',
                audience: 'jwt-auth-frontend'
            }
        );

        const refreshToken = jwt.sign(
            {
                userId: user.id,
                type: 'refresh',
                iat: Math.floor(Date.now() / 1000)
            },
            env.JWT_REFRESH_SECRET,
            {
                expiresIn: "7d",
                issuer: 'jwt-auth-server',
                audience: 'jwt-auth-frontend'
            }
        );

        // Hash the refresh token before storing
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        // Save hashed refresh token in DB
        await db.token.create({
            data: {
                userId: user.id,
                token: hashedRefreshToken,
            },
        });

        // Set cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            message: 'Sign in successful.',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                token: accessToken,
            },
        });
    } catch (error) {
        console.error('Error during sign in:', error);
        next(error);
    }
};




export const signOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({ error: 'No refresh token provided.' });
        }
        // Get user ID from refresh token and handle hashed tokens
        try {
            const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };

            // Get all stored tokens for this user
            const storedTokens = await db.token.findMany({
                where: { userId: payload.userId }
            });

            // Find and remove the matching token
            for (const storedToken of storedTokens) {
                const isMatch = await bcrypt.compare(refreshToken, storedToken.token);
                if (isMatch) {
                    await db.token.delete({ where: { id: storedToken.id } });
                    break;
                }
            }
        } catch (error) {
            // Token invalid or expired, still clear cookies
            console.error('Error verifying refresh token during sign out:', error);
        }

        // Clear cookies with same configuration as when they were set
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
        });

        res.status(200).json({ message: 'Sign out successful.' });
    } catch (error) {
        console.error('Error during sign out:', error);
        next(error);
    }
}
export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token provided.' });
    }
    try {
        const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET, {
            issuer: 'jwt-auth-server',
            audience: 'jwt-auth-frontend'
        }) as { userId: string; type: string };

        // Verify token type
        if (payload.type !== 'refresh') {
            return res.status(401).json({ error: 'Invalid token type.' });
        }

        // Get all stored tokens for this user
        const storedTokens = await db.token.findMany({
            where: { userId: payload.userId }
        });

        // Check if any stored token matches the provided refresh token
        let tokenFound = false;
        let tokenToDelete = null;

        for (const storedToken of storedTokens) {
            const isMatch = await bcrypt.compare(refreshToken, storedToken.token);
            if (isMatch) {
                tokenFound = true;
                tokenToDelete = storedToken;
                break;
            }
        }

        if (!tokenFound) {
            return res.status(401).json({ error: 'Invalid refresh token.' });
        }

        // Generate new access token with enhanced payload
        const newAccessToken = jwt.sign(
            {
                userId: payload.userId,
                type: 'access',
                iat: Math.floor(Date.now() / 1000)
            },
            env.JWT_SECRET,
            {
                expiresIn: "15m",
                issuer: 'jwt-auth-server',
                audience: 'jwt-auth-frontend'
            }
        );

        // Optionally rotate refresh token for enhanced security
        const newRefreshToken = jwt.sign(
            {
                userId: payload.userId,
                type: 'refresh',
                iat: Math.floor(Date.now() / 1000)
            },
            env.JWT_REFRESH_SECRET,
            {
                expiresIn: "7d",
                issuer: 'jwt-auth-server',
                audience: 'jwt-auth-frontend'
            }
        );

        const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);

        // Update the token in database
        if (tokenToDelete) {
            await db.token.update({
                where: { id: tokenToDelete.id },
                data: { token: hashedNewRefreshToken }
            });
        }

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({ accessToken: newAccessToken });

    } catch (error) {
        console.error('Error refreshing access token:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid refresh token.' });
        }
        next(error);

    }
}

export const currentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get the user object from req.user set by authMiddleware
        const user = req.user; // Now this is available

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Return the user data
        res.status(200).json({ user });

    } catch (error) {
        console.error('Error fetching current user:', error);
        next(error);
    }
};
