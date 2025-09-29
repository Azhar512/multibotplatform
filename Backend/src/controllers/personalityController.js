import PersonalityConfig from '../models/PersonalityConfig.js';
import aiService from '../services/ai/aiService.js';
import { serviceLogger as logger } from '../config/logger.js';

export const getPersonalityConfig = async (req, res) => {
  try {
    const config = await PersonalityConfig.findOne({ userId: req.user.id });
    logger.info(`Personality config fetched for user: ${req.user.id}`);
    res.json(config);
  } catch (error) {
    logger.error('Failed to fetch personality configuration:', error);
    res.status(500).json({ error: 'Failed to fetch personality configuration' });
  }
};

export const updatePersonalityConfig = async (req, res) => {
  try {
    const config = await PersonalityConfig.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true, upsert: true }
    );
    
    // Update AI behavior in real-time
    await aiService.updateBehavior(req.user.id, config);
    
    logger.info(`Personality config updated for user: ${req.user.id}`);
    res.json(config);
  } catch (error) {
    logger.error('Failed to update personality configuration:', error);
    res.status(500).json({ error: 'Failed to update personality configuration' });
  }
};

export default {
  getPersonalityConfig,
  updatePersonalityConfig
};
