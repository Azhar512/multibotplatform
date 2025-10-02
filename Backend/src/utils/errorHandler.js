// Professional error handling utilities

import { serviceLogger as logger } from '../config/logger.js';

// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503);
    this.name = 'ServiceUnavailableError';
  }
}

// Error response formatter
export const formatErrorResponse = (error, req) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const baseResponse = {
    success: false,
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };
  
  // Add stack trace in development
  if (isDevelopment && error.stack) {
    baseResponse.stack = error.stack;
  }
  
  // Add additional details for specific error types
  if (error.name === 'ValidationError' && error.details) {
    baseResponse.details = error.details;
  }
  
  if (error.name === 'RateLimitError') {
    baseResponse.retryAfter = error.retryAfter || '15 minutes';
  }
  
  return baseResponse;
};

// Global error handler
export const globalErrorHandler = (error, req, res, next) => {
  // Log error
  logger.error('Global error handler', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId
  });
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json(formatErrorResponse(error, req));
  }
  
  if (error.name === 'AuthenticationError') {
    return res.status(401).json(formatErrorResponse(error, req));
  }
  
  if (error.name === 'AuthorizationError') {
    return res.status(403).json(formatErrorResponse(error, req));
  }
  
  if (error.name === 'NotFoundError') {
    return res.status(404).json(formatErrorResponse(error, req));
  }
  
  if (error.name === 'ConflictError') {
    return res.status(409).json(formatErrorResponse(error, req));
  }
  
  if (error.name === 'RateLimitError') {
    return res.status(429).json(formatErrorResponse(error, req));
  }
  
  if (error.name === 'ServiceUnavailableError') {
    return res.status(503).json(formatErrorResponse(error, req));
  }
  
  // Handle Mongoose validation errors
  if (error.name === 'ValidationError' && error.errors) {
    const details = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      ...formatErrorResponse(error, req),
      details
    });
  }
  
  // Handle Mongoose duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const message = `${field} already exists`;
    return res.status(409).json(formatErrorResponse(new ConflictError(message), req));
  }
  
  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json(formatErrorResponse(new AuthenticationError('Invalid token'), req));
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json(formatErrorResponse(new AuthenticationError('Token expired'), req));
  }
  
  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json(formatErrorResponse(error, req));
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error boundary for unhandled promise rejections
export const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', {
      reason: reason.message || reason,
      stack: reason.stack,
      promise: promise.toString()
    });
    
    // Gracefully close the server
    process.exit(1);
  });
};

// Error boundary for uncaught exceptions
export const handleUncaughtException = () => {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack
    });
    
    // Gracefully close the server
    process.exit(1);
  });
};

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServiceUnavailableError,
  formatErrorResponse,
  globalErrorHandler,
  asyncHandler,
  handleUnhandledRejection,
  handleUncaughtException
};
