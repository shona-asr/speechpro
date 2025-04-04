import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as googleCloud from "./services/googleCloud";
import { authMiddleware } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  app.use("/api/*", authMiddleware);

  // User routes
  app.get("/api/user", async (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Dashboard stats
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const stats = await storage.getUserStats(userId);
      res.json(stats || { 
        minutesTranscribed: 0, 
        charactersTranslated: 0,
        textToSpeechRequests: 0,
        realtimeModeMinutes: 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Recent activity
  app.get("/api/activity", async (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const transcriptions = await storage.getUserTranscriptions(userId, 5);
      const translations = await storage.getUserTranslations(userId, 5);
      const ttsRequests = await storage.getUserTextToSpeech(userId, 5);

      // Combine and sort by date
      const activities = [
        ...transcriptions.map(t => ({ ...t, type: 'transcription' })),
        ...translations.map(t => ({ ...t, type: 'translation' })),
        ...ttsRequests.map(t => ({ ...t, type: 'text-to-speech' }))
      ].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }).slice(0, 10);

      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Transcription endpoint
  app.post("/api/transcribe", async (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { audioData, language, fileName, fileSize, duration } = req.body;
      
      if (!audioData || !language) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Convert base64 to buffer
      const audioBuffer = Buffer.from(audioData.split(',')[1], 'base64');
      
      // Send to Google Cloud Speech-to-Text
      const transcription = await googleCloud.transcribeAudio(audioBuffer, language);
      
      // Store the transcription
      const newTranscription = await storage.createTranscription({
        userId,
        fileName,
        fileSize,
        language,
        duration,
        text: transcription
      });

      // Update usage stats
      if (duration) {
        await storage.updateTranscriptionStats(userId, Math.ceil(duration / 60));
      }

      res.json(newTranscription);
    } catch (error) {
      console.error("Error during transcription:", error);
      res.status(500).json({ message: "Transcription failed" });
    }
  });

  // Translation endpoint
  app.post("/api/translate", async (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { text, sourceLanguage, targetLanguage } = req.body;
      
      if (!text || !sourceLanguage || !targetLanguage) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Send to Google Cloud Translation
      const translatedText = await googleCloud.translateText(text, sourceLanguage, targetLanguage);
      
      // Store the translation
      const newTranslation = await storage.createTranslation({
        userId,
        sourceLanguage,
        targetLanguage,
        originalText: text,
        translatedText
      });

      // Update usage stats
      await storage.updateTranslationStats(userId, text.length);

      res.json(newTranslation);
    } catch (error) {
      console.error("Error during translation:", error);
      res.status(500).json({ message: "Translation failed" });
    }
  });

  // Text-to-Speech endpoint
  app.post("/api/text-to-speech", async (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { text, language, voice } = req.body;
      
      if (!text || !language) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Send to Google Cloud Text-to-Speech
      const audioContent = await googleCloud.textToSpeech(text, language, voice);
      
      // Store the text-to-speech request
      const newTtsRequest = await storage.createTextToSpeech({
        userId,
        text,
        language,
        voice
      });

      // Update usage stats
      await storage.updateTextToSpeechStats(userId);

      res.json({
        id: newTtsRequest.id,
        audioContent
      });
    } catch (error) {
      console.error("Error during text-to-speech:", error);
      res.status(500).json({ message: "Text-to-speech conversion failed" });
    }
  });

  // Speech-to-Speech endpoint
  app.post("/api/speech-to-speech", async (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { audioData, sourceLanguage, targetLanguage, voice } = req.body;
      
      if (!audioData || !sourceLanguage || !targetLanguage) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Convert base64 to buffer
      const audioBuffer = Buffer.from(audioData.split(',')[1], 'base64');
      
      // Step 1: Transcribe audio
      const transcription = await googleCloud.transcribeAudio(audioBuffer, sourceLanguage);
      
      // Step 2: Translate text
      const translatedText = await googleCloud.translateText(transcription, sourceLanguage, targetLanguage);
      
      // Step 3: Convert translated text to speech
      const audioContent = await googleCloud.textToSpeech(translatedText, targetLanguage, voice);
      
      // Update usage stats (both transcription and TTS)
      await storage.updateTranscriptionStats(userId, 1); // Assuming 1 minute for simplicity
      await storage.updateTextToSpeechStats(userId);

      res.json({
        originalText: transcription,
        translatedText,
        audioContent
      });
    } catch (error) {
      console.error("Error during speech-to-speech:", error);
      res.status(500).json({ message: "Speech-to-speech conversion failed" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
