import { NextResponse } from 'next/server';

export class APIError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class ValidationError extends APIError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends APIError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class DatabaseError extends APIError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode: number;
    timestamp: string;
  };
}

export function createErrorResponse(
  error: APIError | Error,
  statusCode?: number
): NextResponse<ErrorResponse> {
  const isAPIError = error instanceof APIError;
  const status = isAPIError ? error.statusCode : (statusCode || 500);
  const code = isAPIError ? error.code : 'INTERNAL_SERVER_ERROR';

  const errorResponse: ErrorResponse = {
    error: {
      message: error.message,
      code,
      statusCode: status,
      timestamp: new Date().toISOString()
    }
  };

  // Log the error for debugging
  console.error(`[API Error ${status}]`, {
    message: error.message,
    code,
    stack: error.stack,
    timestamp: errorResponse.error.timestamp
  });

  return NextResponse.json(errorResponse, { status });
}

export function handleAsyncRoute(
  handler: (request: any, context?: any) => Promise<NextResponse>
) {
  return async (request: any, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof APIError) {
        return createErrorResponse(error);
      }
      
      // Handle MongoDB/Mongoose errors
      if (error instanceof Error) {
        if (error.name === 'ValidationError') {
          return createErrorResponse(new ValidationError(error.message));
        }
        
        if (error.name === 'CastError') {
          return createErrorResponse(new ValidationError('Invalid ID format'));
        }
        
        if (error.name === 'MongoError' || error.name === 'MongoServerError') {
          // Handle duplicate key error
          if ('code' in error && error.code === 11000) {
            return createErrorResponse(new ConflictError('Resource already exists'));
          }
          return createErrorResponse(new DatabaseError());
        }
      }
      
      // Handle unknown errors
      return createErrorResponse(new APIError('Internal server error'));
    }
  };
}

export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200,
  message?: string
): NextResponse {
  const response = {
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(response, { status: statusCode });
}