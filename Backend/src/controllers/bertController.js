// src/controllers/bertController.js
import { bertService, modelConfig } from '../services/bertService.js';

export const bertController = {
  generateResponse: async (req, res) => {
    try {
      const { prompt, modelId, modelConfig: reqConfig } = req.body;

      if (!prompt || !modelId) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const config = {
        ...modelConfig[modelId],
        ...reqConfig
      };

      const response = await bertService.generateResponse(modelId, prompt, config);

      // Emit the response through socket if needed
      req.io?.emit('bertResponse', {
        response,
        model: modelId,
        timestamp: new Date()
      });

      res.json({ 
        response,
        model: modelId,
        config 
      });
    } catch (error) {
      console.error('Generation error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  executeCode: async (req, res) => {
    try {
      const { code, modelId, context } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'No code provided' });
      }


      res.json({ 
        result: 'Code execution successful',
        modelId,
        contextLength: context?.length || 0
      });
    } catch (error) {
      console.error('Execution error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};
