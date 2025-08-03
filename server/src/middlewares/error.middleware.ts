import type { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
    statusCode?: number;
    code?: string;
    details?: any;
}

export const errorMiddleware = (
    err: ErrorWithStatus,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error(`[ERROR] ${err.name}: ${err.message}`);

    const status = err.statusCode || 500;
    const response = {
        error: {
            name: err.name || 'Error',
            message:
                status === 500 ? 'Internal Server Error' : err.message || 'Something went wrong',
            ...(process.env.NODE_ENV === 'development' && {
                stack: err.stack,
                details: err.details,
            }),
        },
    };

    res.status(status).json(response);
};
