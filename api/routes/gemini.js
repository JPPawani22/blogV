import express from 'express';
import { generateContent, testModels } from '../controllers/geminiController.js';

const router = express.Router();

router.post('/generate', generateContent);
router.get('/test-models', testModels);

export default router;