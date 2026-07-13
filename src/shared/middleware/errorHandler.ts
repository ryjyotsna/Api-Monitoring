import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

interface AppError extends Error {
    statusCode?: number;
    status?: number;
    error?: any;
    code?: number;
    }

    const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
        let statusCode = err.statusCode || err.status || 500;
        let message = err.message || 'Internal Server Error';
        let errors = err.error || null;

        logger.error("Error occurred", {
            message: err.message,
            statusCode,
            stack: err.stack,
            path: req.path,
            method: req.method,
        });
        if (err.name === "ValidationError") {
            statusCode = 400;
            message = "Validation Error";
            errors = Object.values(err.error).map((e: any) => e.message);
        }else if(err.name === "MongoServerError" && err.code === 11000){
            statusCode = 409;
            message = 'Duplicate Key Error';
        }else if(err.name === "JsonWebTokenError"){
            statusCode = 401;
            message = 'Invalid Token';
        }else if(err.name === "TokenExpiredError"){
            statusCode = 401;
            message = 'Token Expired';
        }
        res.status(statusCode)
        .json(ResponseFormatter.error(message, statusCode, errors));
    };

export default errorHandler;

