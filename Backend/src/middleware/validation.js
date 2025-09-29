// Input validation middleware

import { body, param, query, validationResult } from 'express-validator';
import { serviceLogger as logger } from '../config/logger.js';

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors', { 
      errors: errors.array(), 
      ip: req.ip,
      path: req.path 
    });
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User registration validation
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Bot interaction validation
export const validateBotInteraction = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
    .escape(),
  
  body('personalitySettings')
    .optional()
    .isObject()
    .withMessage('Personality settings must be an object'),
  
  body('personalitySettings.Empathy')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Empathy must be between 0 and 100'),
  
  body('personalitySettings.Assertiveness')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Assertiveness must be between 0 and 100'),
  
  body('personalitySettings.Humour')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Humour must be between 0 and 100'),
  
  body('personalitySettings.Patience')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Patience must be between 0 and 100'),
  
  body('personalitySettings.Confidence')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Confidence must be between 0 and 100'),
  
  handleValidationErrors
];

// Phone number validation
export const validatePhoneNumber = [
  body('phoneNumber')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please provide a valid phone number with country code'),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
export const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID format`),
  
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// Date range validation
export const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be in ISO 8601 format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be in ISO 8601 format'),
  
  handleValidationErrors
];

// File upload validation
export const validateFileUpload = [
  body('file')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('File is required');
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'audio/wav', 'audio/mp3'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error('Invalid file type. Only images and audio files are allowed');
      }
      
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (req.file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 10MB');
      }
      
      return true;
    }),
  
  handleValidationErrors
];

// Sanitize input middleware
export const sanitizeInput = (req, res, next) => {
  // Sanitize string inputs
  const sanitizeString = (str) => {
    if (typeof str === 'string') {
      return str.trim().replace(/[<>]/g, '');
    }
    return str;
  };
  
  // Recursively sanitize object
  const sanitizeObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    } else {
      return sanitizeString(obj);
    }
  };
  
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

export default {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateBotInteraction,
  validatePhoneNumber,
  validateObjectId,
  validatePagination,
  validateDateRange,
  validateFileUpload,
  sanitizeInput
};