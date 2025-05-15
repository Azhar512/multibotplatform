// src/routes/aiCallRoutes.js
import express from 'express';
import AICallController from '../controllers/aiCallController.js';
import  authenticateToken  from '../middleware/auth.js';

const aiCallRoutes = (config) => {
  const router = express.Router();
  const aiCallController = new AICallController(config);

  // Incoming call routing
  router.post('/route', 
    authenticateToken,
    aiCallController.handleIncomingCall.bind(aiCallController)
  );

  // Speech transcription and processing
  router.post('/transcribe', 
    authenticateToken,
    aiCallController.transcribeAndProcessSpeech.bind(aiCallController)
  );

  // Call summary generation
  router.post('/summarize', 
    authenticateToken,
    aiCallController.generateCallSummary.bind(aiCallController)
  );

  return router;
};

export default aiCallRoutes;