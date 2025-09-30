import express from 'express';
import multer from 'multer';
import { handleBotResponse, handleSpeechToText } from '../controllers/botController.js';

const router = express.Router();
const upload = multer();

// Bot response endpoint
router.post('/response', handleBotResponse);

// Speech to text endpoint
router.post('/speech-to-text', upload.single('audio'), handleSpeechToText);

export default router;
