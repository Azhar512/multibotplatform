// Security middleware for enhanced protection

import helmet from 'helmet';

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiting for sensitive endpoints
export const sensitiveEndpointLimiter = (req, res, next) => {
  // Additional rate limiting for sensitive operations
  const sensitiveEndpoints = ['/api/auth', '/api/admin', '/api/payment'];
  const isSensitive = sensitiveEndpoints.some(endpoint => req.path.startsWith(endpoint));
  
  if (isSensitive) {
    // Apply stricter rate limiting
    req.rateLimit = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5 // 5 requests per window
    };
  }
  
  next();
};

// Request size limiter
export const requestSizeLimiter = (req, res, next) => {
  const contentLength = parseInt(req.get('content-length') || '0', 10);
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request entity too large',
      maxSize: '10MB'
    });
  }
  
  next();
};

// IP whitelist for admin endpoints
export const adminIPWhitelist = (req, res, next) => {
  const adminEndpoints = ['/api/admin'];
  const isAdminEndpoint = adminEndpoints.some(endpoint => req.path.startsWith(endpoint));
  
  if (isAdminEndpoint) {
    const allowedIPs = process.env.ADMIN_IP_WHITELIST?.split(',') || ['127.0.0.1', '::1'];
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Admin endpoint access restricted'
      });
    }
  }
  
  next();
};

// Security event logging
export const securityEventLogger = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log security events
    if (res.statusCode >= 400) {
      console.warn('Security event', {
        status: res.statusCode,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

export default {
  securityHeaders,
  sensitiveEndpointLimiter,
  requestSizeLimiter,
  adminIPWhitelist,
  securityEventLogger
};
