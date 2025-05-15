const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/stats', auth, dashboardController.getDashboardStats);
router.get('/trends', auth, dashboardController.getInteractionTrends);
router.get('/personality', auth, dashboardController.getPersonalityEffectiveness);
router.post('/update-stats', auth, async (req, res) => {
    try {
      const { updateStats } = require('../utils/scheduledTasks');
      await updateStats();
      res.json({ message: 'Stats updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
module.exports = router;