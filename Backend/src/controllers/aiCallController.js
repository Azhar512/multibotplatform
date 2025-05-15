// src/controllers/aiCallController.js
import AICallService from '../services/aiCallService.js';
import CRMService from '../services/crmService.js';
import  validateToken from '../middleware/auth.js';

export default class AICallController {
  constructor(config) {
    this.aiCallService = new AICallService(config);
    this.crmService = new CRMService(config);
  }

  async handleIncomingCall(req, res) {
    try {
      validateToken(req);
      
      const { 
        phoneNumber, 
        personalitySettings, 
        crmSystem, 
        callDirection 
      } = req.body;

      // Route call based on AI analysis
      const routingDecision = await this.aiCallService.routeCall({
        phoneNumber,
        personalitySettings,
        industry: req.user.industry
      });

      // Fetch customer data if CRM is enabled
      let customerData = null;
      if (crmSystem && crmSystem !== 'none') {
        customerData = await this.crmService.fetchCustomerData(
          phoneNumber, 
          crmSystem
        );
      }

      res.json({
        routing: routingDecision,
        customerData,
        success: true
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
        success: false
      });
    }
  }

  async transcribeAndProcessSpeech(req, res) {
    try {
      validateToken(req);
      
      const { 
        audioBlob, 
        personalitySettings, 
        callContext 
      } = req.body;

      // Transcribe speech
      const transcript = await this.aiCallService.transcribeSpeech(audioBlob);

      // Generate AI response
      const aiResponse = await this.aiCallService.generateAIResponse(
        transcript, 
        personalitySettings
      );

      // Convert response to speech
      const speechResponse = await this.aiCallService.textToSpeech(
        aiResponse.text, 
        callContext.voiceOption
      );

      res.json({
        transcript,
        aiResponse,
        speechResponse,
        success: true
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
        success: false
      });
    }
  }

  async generateCallSummary(req, res) {
    try {
      validateToken(req);
      
      const { 
        callData, 
        crmSystem 
      } = req.body;

      // Generate AI-powered call summary
      const summary = await this.aiCallService.generateCallSummary(callData);

      // Log to CRM if enabled
      if (crmSystem && crmSystem !== 'none') {
        await this.crmService.logCall(callData, summary, crmSystem);
      }

      res.json({
        summary,
        success: true
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
        success: false
      });
    }
  }
}
