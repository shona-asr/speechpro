import { pgTable, text, serial, integer, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"),
  displayName: text("display_name"),
  firebaseId: text("firebase_id").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Transcription schema
export const transcriptions = pgTable("transcriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fileName: text("file_name").notNull(),
  originalLanguage: text("original_language").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTranscriptionSchema = createInsertSchema(transcriptions).omit({
  id: true,
  createdAt: true,
});

// Translation schema
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sourceText: text("source_text").notNull(),
  sourceLanguage: text("source_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  translatedText: text("translated_text").notNull(),
  wordCount: integer("word_count").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true,
  createdAt: true,
});

// Text To Speech schema
export const textToSpeeches = pgTable("text_to_speeches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  text: text("text").notNull(),
  language: text("language").notNull(),
  voice: text("voice").notNull(),
  audioUrl: text("audio_url").notNull(),
  wordCount: integer("word_count").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTextToSpeechSchema = createInsertSchema(textToSpeeches).omit({
  id: true,
  createdAt: true,
});

// Speech To Speech schema
export const speechToSpeeches = pgTable("speech_to_speeches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fileName: text("file_name").notNull(),
  sourceLanguage: text("source_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  sourceText: text("source_text"),
  translatedText: text("translated_text"),
  audioUrl: text("audio_url"),
  durationSeconds: integer("duration_seconds").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSpeechToSpeechSchema = createInsertSchema(speechToSpeeches).omit({
  id: true,
  createdAt: true,
});

// User Activity schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityType: text("activity_type").notNull(), // "transcription", "translation", "textToSpeech", "speechToSpeech"
  activityId: integer("activity_id").notNull(), // ID of the related entity
  details: json("details"), // Additional details about the activity
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// User Statistics schema
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  minutesTranscribed: integer("minutes_transcribed").default(0),
  wordsTranslated: integer("words_translated").default(0),
  speechGenerated: integer("speech_generated").default(0), // in seconds
  activeProjects: integer("active_projects").default(0),
  usageCost: integer("usage_cost").default(0), // in cents
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  updatedAt: true,
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  stats: one(userStats, { fields: [users.id], references: [userStats.userId] }),
  transcriptions: many(transcriptions),
  translations: many(translations),
  textToSpeeches: many(textToSpeeches),
  speechToSpeeches: many(speechToSpeeches),
  activities: many(activities)
}));

export const transcriptionsRelations = relations(transcriptions, ({ one }) => ({
  user: one(users, { fields: [transcriptions.userId], references: [users.id] })
}));

export const translationsRelations = relations(translations, ({ one }) => ({
  user: one(users, { fields: [translations.userId], references: [users.id] })
}));

export const textToSpeechesRelations = relations(textToSpeeches, ({ one }) => ({
  user: one(users, { fields: [textToSpeeches.userId], references: [users.id] })
}));

export const speechToSpeechesRelations = relations(speechToSpeeches, ({ one }) => ({
  user: one(users, { fields: [speechToSpeeches.userId], references: [users.id] })
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, { fields: [activities.userId], references: [users.id] })
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, { fields: [userStats.userId], references: [users.id] })
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Transcription = typeof transcriptions.$inferSelect;
export type InsertTranscription = z.infer<typeof insertTranscriptionSchema>;

export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;

export type TextToSpeech = typeof textToSpeeches.$inferSelect;
export type InsertTextToSpeech = z.infer<typeof insertTextToSpeechSchema>;

export type SpeechToSpeech = typeof speechToSpeeches.$inferSelect;
export type InsertSpeechToSpeech = z.infer<typeof insertSpeechToSpeechSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
