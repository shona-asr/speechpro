import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import multer from "multer";
import { storage } from "./storage";
import { authenticate } from "./middleware/auth";
import { configureMulter } from "./middleware/upload";
import { 
  transcribeAudio, 
  translateText, 
  textToSpeech, 
  speechToSpeech 
} from "./services/speechServices";
import {
  transcribeWithCustomService,
  transcribeStreamWithCustomService
} from "./services/customTranscriptionService";
import { 
  users, 
  transcriptions, 
  translations, 
  textToSpeeches, 
  speechToSpeeches, 
  activities, 
  userStats, 
  insertUserSchema, 
  insertTranscriptionSchema, 
  insertTranslationSchema, 
  insertTextToSpeechSchema, 
  insertSpeechToSpeechSchema 
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const upload = configureMulter();
  
  // Set up WebSocket server for realtime speech processing
  const wss = new WebSocketServer({ server: httpServer, path: "/api/realtime" });
  
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Process incoming audio chunks for realtime transcription
        // This is a simplified implementation
        if (data.audio && data.language) {
          // In a real implementation, we would process the audio chunk
          // and send back the transcription
          setTimeout(() => {
            ws.send(JSON.stringify({
              transcription: "This is a realtime transcription."
            }));
          }, 500);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        ws.send(JSON.stringify({ error: "Failed to process audio" }));
      }
    });
    
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });
  
  // Custom transcription routes for external APIs
  app.post("/transcribe", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const language = req.body.language || "en-US";
      
      console.log(`Processing audio transcription with custom service: ${req.file.originalname} (${language})`);
      
      // Use the custom transcription service
      const result = await transcribeWithCustomService(req.file.path, language);
      
      res.json({
        transcription: result.text
      });
    } catch (error: any) {
      console.error("Error in custom transcription:", error);
      res.status(500).json({ error: error.message || "Failed to transcribe audio" });
    }
  });
  
  app.post("/transcribe_stream", upload.single("audio_chunk"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio chunk provided" });
      }

      const language = req.body.language || "en-US";
      
      console.log(`Processing streaming audio chunk with custom service: ${req.file.originalname} (${language})`);
      
      // Use the custom streaming transcription service
      const result = await transcribeStreamWithCustomService(req.file.path, language);
      
      res.json({
        transcription: result.text
      });
    } catch (error: any) {
      console.error("Error in custom streaming transcription:", error);
      res.status(500).json({ error: error.message || "Failed to transcribe audio chunk" });
    }
  });

  // === API Routes ===

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Initialize user stats
      await storage.createUserStats({
        userId: user.id,
        minutesTranscribed: 0,
        wordsTranslated: 0,
        speechGenerated: 0,
        activeProjects: 0,
        usageCost: 0
      });
      
      res.status(201).json({ id: user.id });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  app.get("/api/user/profile", authenticate, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return only necessary user information
      res.json({
        id: user.id,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User'
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user profile" });
    }
  });

  app.put("/api/user/profile", authenticate, async (req, res) => {
    try {
      const { displayName } = req.body;
      
      if (typeof displayName !== 'string' || !displayName.trim()) {
        return res.status(400).json({ message: "Display name is required" });
      }
      
      await storage.updateUser(req.user!.id, { displayName });
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.delete("/api/user", authenticate, async (req, res) => {
    try {
      await storage.deleteUser(req.user!.id);
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Statistics routes
  app.get("/api/user-stats", authenticate, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.user!.id);
      if (!stats) {
        return res.status(404).json({ message: "Stats not found" });
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user statistics" });
    }
  });

  // Activity routes
  app.get("/api/recent-activities", authenticate, async (req, res) => {
    try {
      const activities = await storage.getUserActivities(req.user!.id, 10);
      res.json(activities.map(activity => ({
        id: activity.id,
        type: activity.activityType,
        title: getActivityTitle(activity.activityType),
        description: activity.details ? JSON.parse(activity.details as string).description : '',
        timestamp: activity.createdAt
      })));
    } catch (error) {
      res.status(500).json({ message: "Failed to get recent activities" });
    }
  });

  // Transcription routes
  app.post("/api/transcribe", authenticate, upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      const language = req.body.language || "en-US";
      const options = req.body.options ? JSON.parse(req.body.options) : {};
      
      // Transcribe the audio file
      const transcriptionResult = await transcribeAudio(req.file.path, language, options);
      
      // Save the transcription to the database
      const transcriptionData = {
        userId: req.user!.id,
        fileName: req.file.originalname,
        originalLanguage: language,
        durationSeconds: transcriptionResult.durationSeconds || 0,
        content: transcriptionResult.text
      };
      
      const transcription = await storage.createTranscription(transcriptionData);
      
      // Update user stats
      await storage.updateUserStats(req.user!.id, {
        minutesTranscribed: Math.ceil(transcriptionResult.durationSeconds / 60)
      });
      
      // Record activity
      await storage.createActivity({
        userId: req.user!.id,
        activityType: "transcription",
        activityId: transcription.id,
        details: JSON.stringify({
          description: `Successfully transcribed "${req.file.originalname}" (${formatDuration(transcriptionResult.durationSeconds)})`
        })
      });
      
      res.json({
        id: transcription.id,
        text: transcriptionResult.text,
        durationSeconds: transcriptionResult.durationSeconds
      });
    } catch (error) {
      console.error("Transcription error:", error);
      res.status(500).json({ message: "Failed to transcribe audio" });
    }
  });

  // Translation routes
  app.post("/api/translate", authenticate, async (req, res) => {
    try {
      const { text, sourceLanguage, targetLanguage } = req.body;
      
      if (!text || !sourceLanguage || !targetLanguage) {
        return res.status(400).json({ message: "Text, source language, and target language are required" });
      }
      
      // Translate the text
      const translationResult = await translateText(text, sourceLanguage, targetLanguage);
      
      // Calculate word count
      const wordCount = text.split(/\s+/).length;
      
      // Save the translation to the database
      const translationData = {
        userId: req.user!.id,
        sourceText: text,
        sourceLanguage,
        targetLanguage,
        translatedText: translationResult.translatedText,
        wordCount
      };
      
      const translation = await storage.createTranslation(translationData);
      
      // Update user stats
      await storage.updateUserStats(req.user!.id, {
        wordsTranslated: wordCount
      });
      
      // Record activity
      await storage.createActivity({
        userId: req.user!.id,
        activityType: "translation",
        activityId: translation.id,
        details: JSON.stringify({
          description: `Translated text from ${sourceLanguage} to ${targetLanguage} (${wordCount} words)`
        })
      });
      
      res.json({
        id: translation.id,
        translatedText: translationResult.translatedText,
        wordCount
      });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ message: "Failed to translate text" });
    }
  });

  // Text-to-Speech routes
  app.post("/api/text-to-speech", authenticate, async (req, res) => {
    try {
      const { text, language, voice } = req.body;
      
      if (!text || !language || !voice) {
        return res.status(400).json({ message: "Text, language, and voice are required" });
      }
      
      // Convert text to speech
      const ttsResult = await textToSpeech(text, language, voice);
      
      // Calculate word count
      const wordCount = text.split(/\s+/).length;
      
      // Save the text-to-speech to the database
      const ttsData = {
        userId: req.user!.id,
        text,
        language,
        voice,
        audioUrl: ttsResult.audioUrl,
        wordCount
      };
      
      const tts = await storage.createTextToSpeech(ttsData);
      
      // Update user stats
      await storage.updateUserStats(req.user!.id, {
        speechGenerated: ttsResult.durationSeconds || 0
      });
      
      // Record activity
      await storage.createActivity({
        userId: req.user!.id,
        activityType: "textToSpeech",
        activityId: tts.id,
        details: JSON.stringify({
          description: `Generated speech for "${truncateText(text, 30)}" (${wordCount} words)`
        })
      });
      
      res.json({
        id: tts.id,
        audioUrl: ttsResult.audioUrl,
        durationSeconds: ttsResult.durationSeconds
      });
    } catch (error) {
      console.error("Text-to-Speech error:", error);
      res.status(500).json({ message: "Failed to convert text to speech" });
    }
  });

  // Speech-to-Speech routes
  app.post("/api/speech-to-speech", authenticate, upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      const { sourceLanguage, targetLanguage } = req.body;
      
      if (!sourceLanguage || !targetLanguage) {
        return res.status(400).json({ message: "Source and target languages are required" });
      }
      
      console.log(`Processing speech-to-speech translation: ${req.file.originalname} from ${sourceLanguage} to ${targetLanguage}`);
      
      // Convert speech to speech
      const stsResult = await speechToSpeech(req.file.path, sourceLanguage, targetLanguage);
      
      // Save the speech-to-speech to the database
      const stsData = {
        userId: req.user!.id,
        fileName: req.file.originalname,
        sourceLanguage,
        targetLanguage,
        sourceText: stsResult.sourceText,
        translatedText: stsResult.translatedText,
        audioUrl: stsResult.audioUrl,
        durationSeconds: stsResult.durationSeconds || 0
      };
      
      const sts = await storage.createSpeechToSpeech(stsData);
      
      // Update user stats
      const minutes = Math.ceil(stsResult.durationSeconds / 60);
      const wordCount = stsResult.translatedText.split(/\s+/).length;
      
      await storage.updateUserStats(req.user!.id, {
        minutesTranscribed: minutes,
        wordsTranslated: wordCount,
        speechGenerated: stsResult.durationSeconds || 0
      });
      
      // Record activity
      await storage.createActivity({
        userId: req.user!.id,
        activityType: "speechToSpeech",
        activityId: sts.id,
        details: JSON.stringify({
          description: `Translated speech from ${sourceLanguage} to ${targetLanguage} (${formatDuration(stsResult.durationSeconds)})`,
          sourceText: truncateText(stsResult.sourceText, 50),
          translatedText: truncateText(stsResult.translatedText, 50)
        })
      });
      
      res.json({
        id: sts.id,
        sourceText: stsResult.sourceText,
        translatedText: stsResult.translatedText,
        audioUrl: stsResult.audioUrl,
        durationSeconds: stsResult.durationSeconds
      });
    } catch (error: any) {
      console.error("Speech-to-Speech error:", error);
      res.status(500).json({ message: `Failed to translate speech: ${error.message || 'Unknown error'}` });
    }
  });

  return httpServer;
}

// Helper functions
function getActivityTitle(activityType: string): string {
  switch (activityType) {
    case "transcription":
      return "Transcribed Audio";
    case "translation":
      return "Translated Content";
    case "textToSpeech":
      return "Generated Speech";
    case "speechToSpeech":
      return "Translated Speech";
    default:
      return "Activity";
  }
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
