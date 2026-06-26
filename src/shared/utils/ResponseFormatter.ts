interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T | null;
    error?: unknown;
    timestamp: string;
    statusCode?: number;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

class ResponseFormatter {
    static success<T>(
        data: T | null = null,
        message?: string,
        statusCode:200,
    ): ApiResponse<T> {
        return {
            success: true,
            message,
            data,
            statusCode,
            timestamp: new Date().toISOString(),
        };
    }
    static error(message="Internal Server Error", statusCode = 500, error: unknown = null): ApiResponse {
        return {
            success: false,
            message,
            error,
            statusCode,
            timestamp: new Date().toISOString(),
        };
    }
    
}