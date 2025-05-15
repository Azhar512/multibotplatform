// this is for personality settings


const express = require('express');
const router = express.Router();
const personalityController = require('../../controllers/personalityController');
const auth = require('../../middleware/auth');
const validate = require('../../middleware/validation');

router.get(
  '/config',
  auth,
  personalityController.getPersonalityConfig
);

router.put(
  '/config',
  auth,
  validate.personalityConfig,
  personalityController.updatePersonalityConfig
);

router.post(
  '/training',
  auth,
  validate.trainingData,
  personalityController.uploadTrainingData
);