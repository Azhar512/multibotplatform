// Authentication middleware

import jwt from 'jsonwebtoken';
import { serviceLogger as logger } from '../config/logger.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.warn('Authentication failed: No authorization header', { ip: req.ip });
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      logger.warn('Authentication failed: No token provided', { ip: req.ip });
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      logger.warn('Authentication failed: Invalid token', { ip: req.ip });
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = decoded;
    logger.info('User authenticated successfully', { userId: decoded.userId, ip: req.ip });
    next();
  } catch (error) {
    logger.error('Authentication error:', { error: error.message, ip: req.ip });
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export default authMiddleware;
