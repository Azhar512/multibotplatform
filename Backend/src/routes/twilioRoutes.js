import express from 'express';
import twilio from 'twilio';
import twilioService from '../services/twilioService.js';
import authMiddleware from '../middleware/auth.js';
import CallLog from '../models/Call.js';

const router = express.Router();

// Add debugging middleware
router.use((req, res, next) => {
  console.log(`Twilio API Request: ${req.method} ${req.url}`);
  next();
});

// Route to initiate a call
router.post('/initiate-call', authMiddleware, async (req, res) => {
  try {
    const { phoneNumber, personalitySettings, aiModel, voiceType } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    // Ensure Twilio service is initialized
    if (!twilioService.isInitialized) {
      await twilioService.initialize();
      if (!twilioService.isInitialized) {
        return res.status(500).json({ error: 'Twilio service not initialized' });
      }
    }
    
    const callResult = await twilioService.initiateCall(
      phoneNumber, 
      personalitySettings || {},
      aiModel || 'default',
      voiceType || 'default'
    );
    
    res.json(callResult);
  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({
      error: 'Failed to initiate call',
      message: error.message
    });
  }
});

// Token route with improved error handling
router.get('/token', async (req, res) => {
  try {
    // Log request details
    console.log('Token request received, headers:', req.headers);
    
    // Get identity - either from auth middleware or query param for testing
    let identity;
    
    if (req.user) {
      identity = req.user.userId || req.user.id || req.user.email;
      console.log('Using authenticated user for token identity:', identity);
    } else {
      // For testing, allow identity from query param
      identity = req.query.identity || 'guest-user';
      console.log('Using query parameter for token identity:', identity);
    }
    
    // Check if Twilio service is initialized
    if (!twilioService.isInitialized) {
      console.log('Twilio service not initialized, initializing now...');
      await twilioService.initialize();
      
      if (!twilioService.isInitialized) {
        throw new Error('Failed to initialize Twilio service');
      }
    }
    
    // Generate the token
    const token = twilioService.generateAccessToken(identity);
    
    // Validate token format
    if (!token || typeof token !== 'string') {
      console.error('Invalid token generated:', token);
      throw new Error(`Generated token is invalid: ${typeof token}`);
    }
    
    console.log('Token generated successfully, type:', typeof token);
    console.log('Token preview:', token.substring(0, 15) + '...');
    
    // Return token in expected format
    return res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    console.error('Error generating Twilio token:', error);
    return res.status(500).json({
      error: 'Failed to generate token',
      message: error.message
    });
  }
});

// TwiML handler for incoming/outgoing calls
router.get('/handle-call', async (req, res) => {
  try {
    console.log('Handle call request received:', req.query);
    
    // Get call SID from query parameters or request body
    const callSid = req.query.CallSid || (req.body && req.body.CallSid);
    
    // Find the call in our database to get personality settings
    let personalitySettings = {};
    
    if (callSid) {
      const callLog = await CallLog.findOne({ callSid });
      if (callLog) {
        personalitySettings = callLog.personalitySettings;
      }
    }
    
    // Generate TwiML response
    const twimlResponse = twilioService.generateTwiML(personalitySettings);
    
    // Set proper content type for TwiML
    res.set('Content-Type', 'text/xml');
    res.send(twimlResponse);
  } catch (error) {
    console.error('Error handling call:', error);
    
    // Even in error case, return valid TwiML
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    response.say('Sorry, there was an error processing your call.');
    response.hangup();
    
    res.set('Content-Type', 'text/xml');
    res.send(response.toString());
  }
});

// Call status callback handler
router.post('/call-status', async (req, res) => {
  try {
    const { CallSid, CallStatus } = req.body;
    console.log(`Call status update for ${CallSid}: ${CallStatus}`);
    
    // Update call status in database
    if (CallSid) {
      await CallLog.findOneAndUpdate(
        { callSid: CallSid },
        { status: CallStatus }
      );
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Error handling call status:', error);
    res.sendStatus(200); // Always return 200 to Twilio
  }
});

// User input collection handler
router.post('/collect-input', async (req, res) => {
  try {
    const { CallSid, SpeechResult } = req.body;
    console.log(`Received speech input from ${CallSid}: ${SpeechResult}`);
    
    // Create TwiML response
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    
    if (SpeechResult) {
      // Process the user's speech input here
      // For now, just echo it back
      response.say(`You said: ${SpeechResult}`);
      response.pause({ length: 1 });
      
      // Gather more input
      const gather = response.gather({
        input: 'speech',
        timeout: 3,
        action: `${process.env.BACKEND_URL}/api/twilio/collect-input`,
        method: 'POST'
      });
      
      gather.say('Please continue. What else would you like to discuss?');
    } else {
      response.say("I didn't catch that. Let's try again.");
      
      const gather = response.gather({
        input: 'speech',
        timeout: 3,
        action: `${process.env.BACKEND_URL}/api/twilio/collect-input`,
        method: 'POST'
      });
      
      gather.say('Please tell me how I can assist you.');
    }
    
    // Set proper content type for TwiML
    res.set('Content-Type', 'text/xml');
    res.send(response.toString());
  } catch (error) {
    console.error('Error collecting input:', error);
    
    // Return valid TwiML in case of error
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    response.say('Sorry, there was an error processing your input.');
    response.hangup();
    
    res.set('Content-Type', 'text/xml');
    res.send(response.toString());
  }
});

export default router;