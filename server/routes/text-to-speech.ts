import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { text, voice } = req.body;

    if (!text || !voice) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const [response] = await ttsClient.synthesizeSpeech({
      input: { text },
      voice: { languageCode: voice },
      audioConfig: { audioEncoding: 'MP3' },
    });

    if (!response.audioContent) {
      throw new Error('No audio content received');
    }

    // Convert the audio content to base64
    const audioBase64 = response.audioContent.toString('base64');

    res.json({ audio: audioBase64 });
  } catch (error) {
    console.error('Text-to-Speech error:', error);
    res.status(500).json({ error: 'Text-to-Speech conversion failed' });
  }
});

export default router;