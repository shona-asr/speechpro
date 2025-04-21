import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const [translation] = await translateClient.translate(text, {
      from: sourceLanguage || 'auto',
      to: targetLanguage,
    });

    res.json({ text: translation });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

export default router;