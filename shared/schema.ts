import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for authentication details
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email").notNull().unique(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  provider: text("provider"),
});

// Transcription table for storing transcription history
export const transcriptions = pgTable("transcriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  language: text("language").notNull(),
  duration: integer("duration"), // in seconds
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Translation table for storing translation history
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sourceLanguage: text("source_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  originalText: text("original_text").notNull(),
  translatedText: text("translated_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Text-to-Speech table for storing TTS history
export const textToSpeech = pgTable("text_to_speech", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  text: text("text").notNull(),
  language: text("language").notNull(),
  voice: text("voice"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Usage statistics table for tracking user usage
export const usageStats = pgTable("usage_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  minutesTranscribed: integer("minutes_transcribed").default(0).notNull(),
  charactersTranslated: integer("characters_translated").default(0).notNull(),
  textToSpeechRequests: integer("text_to_speech_requests").default(0).notNull(),
  realtimeModeMinutes: integer("realtime_mode_minutes").default(0).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertTranscriptionSchema = createInsertSchema(transcriptions).omit({
  id: true,
  createdAt: true,
});

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true,
  createdAt: true,
});

export const insertTextToSpeechSchema = createInsertSchema(textToSpeech).omit({
  id: true,
  createdAt: true,
});

export const insertUsageStatsSchema = createInsertSchema(usageStats).omit({
  id: true,
  lastUpdated: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTranscription = z.infer<typeof insertTranscriptionSchema>;
export type Transcription = typeof transcriptions.$inferSelect;

export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;

export type InsertTextToSpeech = z.infer<typeof insertTextToSpeechSchema>;
export type TextToSpeech = typeof textToSpeech.$inferSelect;

export type InsertUsageStats = z.infer<typeof insertUsageStatsSchema>;
export type UsageStats = typeof usageStats.$inferSelect;
