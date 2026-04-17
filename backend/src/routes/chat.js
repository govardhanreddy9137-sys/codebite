import { Router } from 'express';
import { generateAIResponse } from '../utils/ai_helper.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { history, messages } = req.body;
    const chatHistory = history || messages;

    if (!chatHistory || !Array.isArray(chatHistory) || chatHistory.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty chat history' });
    }

    const responseText = await generateAIResponse(chatHistory);
    res.json({ response: responseText });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ response: "My digital brain is a bit foggy. Can you repeat that?" });
  }
});

export default router;
