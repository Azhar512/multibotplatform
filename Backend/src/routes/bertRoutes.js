import express from 'express';
import cors from 'cors';
import BertService from '../services/bertService.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const REQUEST_TIMEOUT = 30000; // 30 seconds

router.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

router.use(apiLimiter);

const validateRequest = (req, res, next) => {
  const { message, personality, model } = req.body;

  try {
    // Message validation
    if (!message?.trim()) {
      return res.status(400).json({
        error: 'Message is required',
        timestamp: new Date().toISOString()
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        error: 'Message exceeds maximum length of 1000 characters',
        timestamp: new Date().toISOString()
      });
    }

    // Model validation
    if (!model?.trim()) {
      return res.status(400).json({
        error: 'Model name is required',
        timestamp: new Date().toISOString()
      });
    }

    // Personality validation
    if (!personality || typeof personality !== 'object') {
      return res.status(400).json({
        error: 'Valid personality configuration is required',
        timestamp: new Date().toISOString()
      });
    }

    const requiredTraits = ['Empathy', 'Assertiveness', 'Humour', 'Patience', 'Confidence'];
    for (const trait of requiredTraits) {
      const value = personality[trait];
      if (typeof value !== 'number' || value < 0 || value > 100) {
        return res.status(400).json({
          error: `Invalid ${trait} value. Must be a number between 0 and 100`,
          timestamp: new Date().toISOString()
        });
      }
    }

    next();
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(400).json({
      error: 'Invalid request format',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
};

router.get('/models', async (req, res) => {
  try {
    const models = BertService.getAvailableModels();
    res.json({
      models,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      error: 'Failed to fetch available models',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/response', validateRequest, async (req, res) => {
  const { message, personality, model } = req.body;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await BertService.generateResponse(
      message,
      model,
      personality,
      { signal: controller.signal }
    );

    clearTimeout(timeout);
    res.json({
      ...response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    clearTimeout(timeout);
    console.error('Error generating response:', error);

    let statusCode = 500;
    let errorMessage = 'Failed to generate response';

    if (error.message === 'Request timeout') {
      statusCode = 504;
      errorMessage = 'Request timed out';
    } else if (error.message.includes('not configured')) {
      statusCode = 503;
      errorMessage = 'Service configuration error';
    } else if (error.message.includes('not found')) {
      statusCode = 404;
      errorMessage = 'Model not found';
    }

    res.status(statusCode).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/health', async (req, res) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    await BertService.initialize();
    clearTimeout(timeout);
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    clearTimeout(timeout);
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;