//this is for personality settings


const { validationResult, check } = require('express-validator');

exports.personalityConfig = [
  check('behaviorSliders.*').isInt({ min: 0, max: 100 }),
  check('tone').isIn(['friendly', 'professional', 'casual', 'humorous', 'formal']),
  check('features.*').isBoolean(),
  check('responseLength').isIn(['short', 'medium', 'long']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];