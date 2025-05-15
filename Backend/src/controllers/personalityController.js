const PersonalityConfig = require('../models/PersonalityConfig');
const aiService = require('../services/aiService');

exports.getPersonalityConfig = async (req, res) => {
  try {
    const config = await PersonalityConfig.findOne({ userId: req.user.id });
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch personality configuration' });
  }
};

exports.updatePersonalityConfig = async (req, res) => {
  try {
    const config = await PersonalityConfig.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true, upsert: true }
    );
    
    // Update AI behavior in real-time
    await aiService.updateBehavior(req.user.id, config);
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update personality configuration' });
  }
};
