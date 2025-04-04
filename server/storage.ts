import {
  users, User, InsertUser,
  transcriptions, Transcription, InsertTranscription,
  translations, Translation, InsertTranslation,
  textToSpeech, TextToSpeech, InsertTextToSpeech,
  usageStats, UsageStats, InsertUsageStats
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transcription operations
  createTranscription(transcription: InsertTranscription): Promise<Transcription>;
  getUserTranscriptions(userId: number, limit?: number): Promise<Transcription[]>;
  
  // Translation operations
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  getUserTranslations(userId: number, limit?: number): Promise<Translation[]>;
  
  // Text-to-Speech operations
  createTextToSpeech(tts: InsertTextToSpeech): Promise<TextToSpeech>;
  getUserTextToSpeech(userId: number, limit?: number): Promise<TextToSpeech[]>;
  
  // Usage stats operations
  getUserStats(userId: number): Promise<UsageStats | undefined>;
  updateTranscriptionStats(userId: number, minutes: number): Promise<void>;
  updateTranslationStats(userId: number, characters: number): Promise<void>;
  updateTextToSpeechStats(userId: number): Promise<void>;
  updateRealtimeModeStats(userId: number, minutes: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transcriptions: Map<number, Transcription>;
  private translations: Map<number, Translation>;
  private textToSpeech: Map<number, TextToSpeech>;
  private usageStats: Map<number, UsageStats>;
  private currentUserId: number;
  private currentTranscriptionId: number;
  private currentTranslationId: number;
  private currentTtsId: number;
  private currentStatsId: number;

  constructor() {
    this.users = new Map();
    this.transcriptions = new Map();
    this.translations = new Map();
    this.textToSpeech = new Map();
    this.usageStats = new Map();
    this.currentUserId = 1;
    this.currentTranscriptionId = 1;
    this.currentTranslationId = 1;
    this.currentTtsId = 1;
    this.currentStatsId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    
    // Create initial usage stats for the user
    await this.createInitialStats(id);
    
    return user;
  }

  private async createInitialStats(userId: number): Promise<void> {
    const id = this.currentStatsId++;
    const now = new Date();
    const stats: UsageStats = {
      id,
      userId,
      minutesTranscribed: 0,
      charactersTranslated: 0,
      textToSpeechRequests: 0,
      realtimeModeMinutes: 0,
      lastUpdated: now
    };
    this.usageStats.set(id, stats);
  }

  // Transcription operations
  async createTranscription(insertTranscription: InsertTranscription): Promise<Transcription> {
    const id = this.currentTranscriptionId++;
    const now = new Date();
    const transcription: Transcription = {
      ...insertTranscription,
      id,
      createdAt: now
    };
    this.transcriptions.set(id, transcription);
    return transcription;
  }

  async getUserTranscriptions(userId: number, limit = 10): Promise<Transcription[]> {
    const userTranscriptions = Array.from(this.transcriptions.values())
      .filter(transcription => transcription.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? userTranscriptions.slice(0, limit) : userTranscriptions;
  }

  // Translation operations
  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const id = this.currentTranslationId++;
    const now = new Date();
    const translation: Translation = {
      ...insertTranslation,
      id,
      createdAt: now
    };
    this.translations.set(id, translation);
    return translation;
  }

  async getUserTranslations(userId: number, limit = 10): Promise<Translation[]> {
    const userTranslations = Array.from(this.translations.values())
      .filter(translation => translation.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? userTranslations.slice(0, limit) : userTranslations;
  }

  // Text-to-Speech operations
  async createTextToSpeech(insertTts: InsertTextToSpeech): Promise<TextToSpeech> {
    const id = this.currentTtsId++;
    const now = new Date();
    const tts: TextToSpeech = {
      ...insertTts,
      id,
      createdAt: now
    };
    this.textToSpeech.set(id, tts);
    return tts;
  }

  async getUserTextToSpeech(userId: number, limit = 10): Promise<TextToSpeech[]> {
    const userTts = Array.from(this.textToSpeech.values())
      .filter(tts => tts.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? userTts.slice(0, limit) : userTts;
  }

  // Usage stats operations
  async getUserStats(userId: number): Promise<UsageStats | undefined> {
    return Array.from(this.usageStats.values()).find(
      stats => stats.userId === userId
    );
  }

  async updateTranscriptionStats(userId: number, minutes: number): Promise<void> {
    const stats = await this.getUserStats(userId);
    if (stats) {
      const updatedStats = {
        ...stats,
        minutesTranscribed: stats.minutesTranscribed + minutes,
        lastUpdated: new Date()
      };
      this.usageStats.set(stats.id, updatedStats);
    }
  }

  async updateTranslationStats(userId: number, characters: number): Promise<void> {
    const stats = await this.getUserStats(userId);
    if (stats) {
      const updatedStats = {
        ...stats,
        charactersTranslated: stats.charactersTranslated + characters,
        lastUpdated: new Date()
      };
      this.usageStats.set(stats.id, updatedStats);
    }
  }

  async updateTextToSpeechStats(userId: number): Promise<void> {
    const stats = await this.getUserStats(userId);
    if (stats) {
      const updatedStats = {
        ...stats,
        textToSpeechRequests: stats.textToSpeechRequests + 1,
        lastUpdated: new Date()
      };
      this.usageStats.set(stats.id, updatedStats);
    }
  }

  async updateRealtimeModeStats(userId: number, minutes: number): Promise<void> {
    const stats = await this.getUserStats(userId);
    if (stats) {
      const updatedStats = {
        ...stats,
        realtimeModeMinutes: stats.realtimeModeMinutes + minutes,
        lastUpdated: new Date()
      };
      this.usageStats.set(stats.id, updatedStats);
    }
  }
}

export const storage = new MemStorage();
