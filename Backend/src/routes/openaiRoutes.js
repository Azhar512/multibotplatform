import express from 'express';
import openaiService from '../services/openaiService.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

router.use(apiLimiter);

// Validation middleware
const validateRequest = (req, res, next) => {
  const { message, personality, config } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: 'Message is required and must be a string',
      timestamp: new Date().toISOString(),
    });
  }

  if (message.trim().length === 0) {
    return res.status(400).json({
      error: 'Message cannot be empty',
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// OpenAI response endpoint
router.post('/response', validateRequest, async (req, res) => {
  console.log('Processing request to /openai/response');
  const { message, personality, config } = req.body;

  try {
    console.log('Generating OpenAI response for message:', message);
    const response = await openaiService.generateResponse(message, personality, 'gpt-4-turbo');

    const result = {
      success: true,
      botResponse: response.text || response.content || "I apologize, but I encountered an issue generating a response.",
      originalResponse: response.original || response.text || response.content,
      confidence: response.confidence || 0.8,
      sentiment: response.sentiment || null,
      model: 'gpt-4-turbo',
      modelType: 'openai',
      status: 'success',
      timestamp: new Date().toISOString(),
    };

    console.log('Sending successful OpenAI response');
    return res.json(result);
  } catch (error) {
    console.error('Error in OpenAI route handler:', {
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
    });

    return res.status(500).json({
      error: 'Failed to process request',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        type: error.name,
      } : undefined,
      timestamp: new Date().toISOString(),
    });
  }
});

// Speech to text endpoint
router.post('/speech-to-text', async (req, res) => {
  try {
    const { audioBlob } = req.body;
    
    if (!audioBlob) {
      return res.status(400).json({
        error: 'Audio blob is required',
        timestamp: new Date().toISOString(),
      });
    }

    const transcription = await openaiService.speechToText(audioBlob);
    
    res.json({
      success: true,
      text: transcription,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Speech to text error:', error);
    res.status(500).json({
      error: 'Speech to text conversion failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString(),
    });
  }
});

// Text to speech endpoint
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, voiceType = 'nova' } = req.body;
    
    if (!text) {
      return res.status(400).json({
        error: 'Text is required',
        timestamp: new Date().toISOString(),
      });
    }

    const audioUrl = await openaiService.textToSpeech(text, voiceType);
    
    res.json({
      success: true,
      audioUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Text to speech error:', error);
    res.status(500).json({
      error: 'Text to speech conversion failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'OpenAI API',
    timestamp: new Date().toISOString(),
  });
});

export default router;
