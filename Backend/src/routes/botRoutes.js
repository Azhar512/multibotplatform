const express = require('express');
const multer = require('multer');
const botController = require('../controllers/botController');

const router = express.Router();
const upload = multer();

router.post('/bot/response', botController.getBotResponse);
router.post('/speech-to-text', upload.single('audio'), botController.speechToText);

module.exports = router;
