import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import auth from '../middleware/auth.js';
import { updateStats } from '../utils/scheduledTasks.js';

const router = express.Router();

router.get('/stats', auth, dashboardController.getDashboardStats);
router.get('/trends', auth, dashboardController.getInteractionTrends);
router.get('/personality', auth, dashboardController.getPersonalityEffectiveness);

router.post('/update-stats', auth, async (req, res) => {
  try {
    await updateStats();
    res.json({ message: 'Stats updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
