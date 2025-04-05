import { 
  users, type User, type InsertUser,
  userStats, type UserStats, type InsertUserStats,
  transcriptions, type Transcription, type InsertTranscription,
  translations, type Translation, type InsertTranslation,
  textToSpeeches, type TextToSpeech, type InsertTextToSpeech,
  speechToSpeeches, type SpeechToSpeech, type InsertSpeechToSpeech,
  activities, type Activity, type InsertActivity
} from "@shared/schema";

// Storage interface with all CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseId(firebaseId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // User stats methods
  getUserStats(userId: number): Promise<UserStats | undefined>;
  createUserStats(stats: InsertUserStats): Promise<UserStats>;
  updateUserStats(userId: number, data: Partial<InsertUserStats>): Promise<UserStats | undefined>;
  
  // Activity methods
  getUserActivities(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Transcription methods
  createTranscription(transcription: InsertTranscription): Promise<Transcription>;
  getTranscription(id: number): Promise<Transcription | undefined>;
  getUserTranscriptions(userId: number): Promise<Transcription[]>;
  
  // Translation methods
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  getTranslation(id: number): Promise<Translation | undefined>;
  getUserTranslations(userId: number): Promise<Translation[]>;
  
  // Text-to-Speech methods
  createTextToSpeech(tts: InsertTextToSpeech): Promise<TextToSpeech>;
  getTextToSpeech(id: number): Promise<TextToSpeech | undefined>;
  getUserTextToSpeeches(userId: number): Promise<TextToSpeech[]>;
  
  // Speech-to-Speech methods
  createSpeechToSpeech(sts: InsertSpeechToSpeech): Promise<SpeechToSpeech>;
  getSpeechToSpeech(id: number): Promise<SpeechToSpeech | undefined>;
  getUserSpeechToSpeeches(userId: number): Promise<SpeechToSpeech[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userStats: Map<number, UserStats>;
  private transcriptions: Map<number, Transcription>;
  private translations: Map<number, Translation>;
  private textToSpeeches: Map<number, TextToSpeech>;
  private speechToSpeeches: Map<number, SpeechToSpeech>;
  private activities: Map<number, Activity>;
  
  // Track current IDs for each entity
  private currentIds: {
    users: number;
    userStats: number;
    transcriptions: number;
    translations: number;
    textToSpeeches: number;
    speechToSpeeches: number;
    activities: number;
  };

  constructor() {
    // Initialize storage maps
    this.users = new Map();
    this.userStats = new Map();
    this.transcriptions = new Map();
    this.translations = new Map();
    this.textToSpeeches = new Map();
    this.speechToSpeeches = new Map();
    this.activities = new Map();
    
    // Initialize IDs
    this.currentIds = {
      users: 1,
      userStats: 1,
      transcriptions: 1,
      translations: 1,
      textToSpeeches: 1,
      speechToSpeeches: 1,
      activities: 1
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByFirebaseId(firebaseId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseId === firebaseId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt, 
      password: insertUser.password || null,
      displayName: insertUser.displayName || null,
      firebaseId: insertUser.firebaseId || null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  // User Stats methods
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    return Array.from(this.userStats.values()).find(
      (stats) => stats.userId === userId
    );
  }
  
  async createUserStats(stats: InsertUserStats): Promise<UserStats> {
    const id = this.currentIds.userStats++;
    const updatedAt = new Date();
    const userStats: UserStats = { ...stats, id, updatedAt };
    this.userStats.set(id, userStats);
    return userStats;
  }
  
  async updateUserStats(userId: number, data: Partial<InsertUserStats>): Promise<UserStats | undefined> {
    const stats = await this.getUserStats(userId);
    if (!stats) return undefined;
    
    const updatedStats = { 
      ...stats, 
      ...data, 
      updatedAt: new Date() 
    };
    this.userStats.set(stats.id, updatedStats);
    return updatedStats;
  }
  
  // Activity methods
  async getUserActivities(userId: number, limit = 10): Promise<Activity[]> {
    const userActivities = Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    
    return userActivities;
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.currentIds.activities++;
    const createdAt = new Date();
    const newActivity: Activity = { ...activity, id, createdAt };
    this.activities.set(id, newActivity);
    return newActivity;
  }
  
  // Transcription methods
  async createTranscription(transcription: InsertTranscription): Promise<Transcription> {
    const id = this.currentIds.transcriptions++;
    const createdAt = new Date();
    const newTranscription: Transcription = { ...transcription, id, createdAt };
    this.transcriptions.set(id, newTranscription);
    return newTranscription;
  }
  
  async getTranscription(id: number): Promise<Transcription | undefined> {
    return this.transcriptions.get(id);
  }
  
  async getUserTranscriptions(userId: number): Promise<Transcription[]> {
    return Array.from(this.transcriptions.values())
      .filter(transcription => transcription.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Translation methods
  async createTranslation(translation: InsertTranslation): Promise<Translation> {
    const id = this.currentIds.translations++;
    const createdAt = new Date();
    const newTranslation: Translation = { ...translation, id, createdAt };
    this.translations.set(id, newTranslation);
    return newTranslation;
  }
  
  async getTranslation(id: number): Promise<Translation | undefined> {
    return this.translations.get(id);
  }
  
  async getUserTranslations(userId: number): Promise<Translation[]> {
    return Array.from(this.translations.values())
      .filter(translation => translation.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Text-to-Speech methods
  async createTextToSpeech(tts: InsertTextToSpeech): Promise<TextToSpeech> {
    const id = this.currentIds.textToSpeeches++;
    const createdAt = new Date();
    const newTTS: TextToSpeech = { ...tts, id, createdAt };
    this.textToSpeeches.set(id, newTTS);
    return newTTS;
  }
  
  async getTextToSpeech(id: number): Promise<TextToSpeech | undefined> {
    return this.textToSpeeches.get(id);
  }
  
  async getUserTextToSpeeches(userId: number): Promise<TextToSpeech[]> {
    return Array.from(this.textToSpeeches.values())
      .filter(tts => tts.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Speech-to-Speech methods
  async createSpeechToSpeech(sts: InsertSpeechToSpeech): Promise<SpeechToSpeech> {
    const id = this.currentIds.speechToSpeeches++;
    const createdAt = new Date();
    const newSTS: SpeechToSpeech = { ...sts, id, createdAt };
    this.speechToSpeeches.set(id, newSTS);
    return newSTS;
  }
  
  async getSpeechToSpeech(id: number): Promise<SpeechToSpeech | undefined> {
    return this.speechToSpeeches.get(id);
  }
  
  async getUserSpeechToSpeeches(userId: number): Promise<SpeechToSpeech[]> {
    return Array.from(this.speechToSpeeches.values())
      .filter(sts => sts.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
