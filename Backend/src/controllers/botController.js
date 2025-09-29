// Bot interaction controller

import speechService from '../services/speechService.js';
import nlpService from '../services/nlpService.js';
import botService from '../services/botService.js';
import { serviceLogger as logger } from '../config/logger.js';

export const handleBotResponse = async (req, res) => {
  try {
    const { message, settings } = req.body;
    
    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Valid message is required' });
    }
    
    logger.info(`Processing bot response for message: ${message.substring(0, 50)}...`);
    
    // Process message with NLP
    const processedMessage = await nlpService.processText(message);
    
    // Generate bot response
    const botResponse = await botService.generateResponse(processedMessage, settings);
    
    // Convert to speech if needed
    let audioUrl = null;
    if (settings?.enableTextToSpeech) {
      audioUrl = await speechService.textToSpeech(botResponse);
    }
    
    logger.info('Bot response generated successfully');
    res.json({ botResponse, audioUrl });
  } catch (error) {
    logger.error('Error in handleBotResponse:', error);
    res.status(500).json({ error: error.message });
  }
};

export const handleSpeechToText = async (req, res) => {
  try {
    const audioBlob = req.body;
    
    if (!audioBlob) {
      return res.status(400).json({ error: 'Audio data is required' });
    }
    
    logger.info('Processing speech to text conversion');
    const text = await speechService.speechToText(audioBlob);
    
    logger.info('Speech to text conversion completed');
    res.json({ text });
  } catch (error) {
    logger.error('Error in handleSpeechToText:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  handleBotResponse,
  handleSpeechToText
};
