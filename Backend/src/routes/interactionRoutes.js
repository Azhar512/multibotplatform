const express = require('express');
const router = express.Router();
const InteractionLogController = require('../controllers/interactionLogController');
const auth = require('../middleware/auth');
const validator = require('../middleware/validator');

router.get(
  '/interactions',
  auth.verifyToken,
  validator.validateQueryParams,
  InteractionLogController.getInteractions
);

router.put(
  '/interactions/:id/status',
  auth.verifyToken,
  validator.validateStatusUpdate,
  InteractionLogController.updateInteractionStatus
);

router.get(
  '/interactions/export',
  auth.verifyToken,
  InteractionLogController.exportInteractions
);
