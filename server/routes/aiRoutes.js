import express from 'express';
import { generateVerificationQuestions } from '../services/aiService.js';

const router = express.Router();

// POST /api/ai/generate-questions
router.post('/generate-questions', async (req, res) => {
  try {
    const { title, category, description, location, type } = req.body;

    const questions = await generateVerificationQuestions({
      title: title || '',
      category: category || '',
      description: description || '',
      location: location || '',
      type: type || 'found'
    });

    return res.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error('Error generating AI questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI questions',
      error: error.message
    });
  }
});

export default router;
