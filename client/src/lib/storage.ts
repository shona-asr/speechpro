import { openDB, DBSchema, IDBPDatabase } from 'idb';
import CryptoJS from 'crypto-js';

// Encryption key - in a real app, this should be derived from user credentials
const ENCRYPTION_KEY = 'your-secret-key';

interface SpeechProDB extends DBSchema {
  'users': {
    key: string; // user_id
    value: {
      user_id: string;
      email: string;
      display_name: string;
      created_at: number;
    };
    indexes: {
      'by-email': string;
    };
  };
  'audio-files': {
    key: number; // audio_id
    value: {
      audio_id: number;
      user_id: string;
      filename: string;
      language: string;
      upload_time: number;
      duration_seconds: number;
      file_path: string;
      data: string; // Encrypted base64 audio data
      audio_url?: string; // URL for playing the audio
    };
    indexes: {
      'by-user': string;
    };
  };
  'transcriptions': {
    key: number; // transcription_id
    value: {
      transcription_id: number;
      audio_id: number;
      user_id: string;
      transcribed_text: string; // Encrypted
      confidence: number;
      language: string;
      method: 'batch' | 'streaming';
      created_at: number;
      audio_url?: string; // URL for playing the original audio
    };
    indexes: {
      'by-audio': number;
      'by-user': string;
    };
  };
  'translations': {
    key: number; // translation_id
    value: {
      translation_id: number;
      transcription_id: number;
      user_id: string;
      source_language: string;
      target_language: string;
      original_text: string; // Encrypted
      translated_text: string; // Encrypted
      created_at: number;
      audio_url?: string; // URL for playing the translated text
    };
    indexes: {
      'by-transcription': number;
      'by-user': string;
    };
  };
  'speech-to-speech': {
    key: number; // s2s_id
    value: {
      s2s_id: number;
      translation_id: number;
      user_id: string;
      source_language: string;
      target_language: string;
      original_audio_url: string;
      transcribed_text: string; // Encrypted
      translated_text: string; // Encrypted
      synthesized_audio_url: string;
      created_at: number;
    };
    indexes: {
      'by-translation': number;
      'by-user': string;
    };
  };
  'streaming-transcriptions': {
    key: number; // stream_id
    value: {
      stream_id: number;
      user_id: string;
      session_id: string;
      start_time: number;
      end_time: number;
      final_text: string; // Encrypted
      source_language: string;
      confidence_avg: number;
      audio_url: string;
    };
    indexes: {
      'by-user': string;
      'by-session': string;
    };
  };
  'text-to-speech': {
    key: number;
    value: {
      tts_id: number;
      user_id: string;
      original_text: string; // Encrypted
      language: string;
      voice_type: string;
      audio_url: string;
      created_at: number;
    };
    indexes: {
      'by-user': string;
    };
  };
  'logs': {
    key: number; // log_id
    value: {
      log_id: number;
      user_id: string;
      action_type: 'upload' | 'transcribe' | 'translate' | 's2s' | 'streaming' | 'tts';
      related_id: number;
      description: string;
      timestamp: number;
    };
    indexes: {
      'by-user': string;
      'by-action': string;
    };
  };
}

class StorageService {
  private db: Promise<IDBPDatabase<SpeechProDB>>;
  private nextId: { [key: string]: number } = {
    'audio-files': 1,
    'transcriptions': 1,
    'translations': 1,
    'speech-to-speech': 1,
    'streaming-transcriptions': 1,
    'text-to-speech': 1,
    'logs': 1
  };

  constructor() {
    this.db = openDB<SpeechProDB>('speechpro-db', 1, {
      upgrade(db) {
        // Create object stores with indexes
        const usersStore = db.createObjectStore('users', { keyPath: 'user_id' });
        usersStore.createIndex('by-email', 'email', { unique: true });

        const audioFilesStore = db.createObjectStore('audio-files', { keyPath: 'audio_id', autoIncrement: true });
        audioFilesStore.createIndex('by-user', 'user_id');

        const transcriptionsStore = db.createObjectStore('transcriptions', { keyPath: 'transcription_id', autoIncrement: true });
        transcriptionsStore.createIndex('by-audio', 'audio_id');
        transcriptionsStore.createIndex('by-user', 'user_id');

        const translationsStore = db.createObjectStore('translations', { keyPath: 'translation_id', autoIncrement: true });
        translationsStore.createIndex('by-transcription', 'transcription_id');
        translationsStore.createIndex('by-user', 'user_id');

        const speechToSpeechStore = db.createObjectStore('speech-to-speech', { keyPath: 's2s_id', autoIncrement: true });
        speechToSpeechStore.createIndex('by-translation', 'translation_id');
        speechToSpeechStore.createIndex('by-user', 'user_id');

        const streamingStore = db.createObjectStore('streaming-transcriptions', { keyPath: 'stream_id', autoIncrement: true });
        streamingStore.createIndex('by-user', 'user_id');
        streamingStore.createIndex('by-session', 'session_id');

        const textToSpeechStore = db.createObjectStore('text-to-speech', { keyPath: 'tts_id', autoIncrement: true });
        textToSpeechStore.createIndex('by-user', 'user_id');

        const logsStore = db.createObjectStore('logs', { keyPath: 'log_id', autoIncrement: true });
        logsStore.createIndex('by-user', 'user_id');
        logsStore.createIndex('by-action', 'action_type');
      },
    });
  }

  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  }

  private decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // User operations
  async saveUser(user: { user_id: string; email: string; display_name: string }): Promise<void> {
    await (await this.db).put('users', {
      ...user,
      created_at: Date.now()
    });
  }

  async getUser(userId: string) {
    return (await this.db).get('users', userId);
  }

  // Audio file operations
  async saveAudioFile(file: File, userId: string, language: string = 'auto'): Promise<number> {
    const id = this.nextId['audio-files']++;
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const encryptedData = this.encrypt(base64Data);
          
          await (await this.db).put('audio-files', {
            audio_id: id,
            user_id: userId,
            filename: file.name,
            language,
            upload_time: Date.now(),
            duration_seconds: 0, // You'll need to calculate this
            file_path: `users/${userId}/audio/${id}`,
            data: encryptedData
          });

          // Log the action
          await this.logAction(userId, 'upload', id, `Uploaded audio file: ${file.name}`);
          
          resolve(id);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // Transcription operations
  async saveTranscription(
    audioId: number,
    userId: string,
    text: string,
    language: string,
    confidence: number,
    method: 'batch' | 'streaming' = 'batch',
    audioUrl?: string
  ): Promise<number> {
    const id = this.nextId['transcriptions']++;
    
    await (await this.db).put('transcriptions', {
      transcription_id: id,
      audio_id: audioId,
      user_id: userId,
      transcribed_text: this.encrypt(text),
      confidence,
      language,
      method,
      created_at: Date.now(),
      audio_url: audioUrl
    });

    await this.logAction(userId, 'transcribe', id, `Transcribed audio ${audioId}`);
    
    return id;
  }

  // Translation operations
  async saveTranslation(
    transcriptionId: number,
    userId: string,
    sourceLanguage: string,
    targetLanguage: string,
    originalText: string,
    translatedText: string,
    audioUrl?: string
  ): Promise<number> {
    const id = this.nextId['translations']++;
    
    await (await this.db).put('translations', {
      translation_id: id,
      transcription_id: transcriptionId,
      user_id: userId,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      original_text: this.encrypt(originalText),
      translated_text: this.encrypt(translatedText),
      created_at: Date.now(),
      audio_url: audioUrl
    });

    await this.logAction(userId, 'translate', id, `Translated text`);
    
    return id;
  }

  // Speech-to-Speech operations
  async saveSpeechToSpeech(
    translationId: number,
    userId: string,
    sourceLanguage: string,
    targetLanguage: string,
    originalAudioUrl: string,
    transcribedText: string,
    translatedText: string,
    synthesizedAudioUrl: string
  ): Promise<number> {
    const id = this.nextId['speech-to-speech']++;
    
    await (await this.db).put('speech-to-speech', {
      s2s_id: id,
      translation_id: translationId,
      user_id: userId,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      original_audio_url: originalAudioUrl,
      transcribed_text: this.encrypt(transcribedText),
      translated_text: this.encrypt(translatedText),
      synthesized_audio_url: synthesizedAudioUrl,
      created_at: Date.now()
    });

    await this.logAction(userId, 's2s', id, `Completed speech-to-speech translation`);
    
    return id;
  }

  // Streaming operations
  async startStreamingSession(userId: string, sourceLanguage: string): Promise<number> {
    const id = this.nextId['streaming-transcriptions']++;
    
    await (await this.db).put('streaming-transcriptions', {
      stream_id: id,
      user_id: userId,
      session_id: crypto.randomUUID(),
      start_time: Date.now(),
      end_time: 0,
      final_text: '',
      source_language: sourceLanguage,
      confidence_avg: 0
    });

    await this.logAction(userId, 'streaming', id, `Started streaming session`);
    
    return id;
  }

  async updateStreamingSession(
    streamId: number,
    finalText: string,
    confidenceAvg: number,
    audioUrl: string
  ): Promise<void> {
    await (await this.db).put('streaming-transcriptions', {
      stream_id: streamId,
      final_text: this.encrypt(finalText),
      confidence_avg: confidenceAvg,
      audio_url: audioUrl,
      end_time: Date.now()
    });
  }

  // Text-to-Speech operations
  async saveTextToSpeech(
    userId: string,
    originalText: string,
    language: string,
    audioUrl: string,
    voiceType: string = 'NEUTRAL'
  ): Promise<number> {
    const id = this.nextId['text-to-speech']++;
    
    await (await this.db).put('text-to-speech', {
      tts_id: id,
      user_id: userId,
      original_text: this.encrypt(originalText),
      language,
      voice_type: voiceType,
      audio_url: audioUrl,
      created_at: Date.now()
    });

    await this.logAction(userId, 'tts', id, `Generated speech for text`);
    
    return id;
  }

  // Logging
  private async logAction(
    userId: string,
    actionType: 'upload' | 'transcribe' | 'translate' | 's2s' | 'streaming' | 'tts',
    relatedId: number,
    description: string
  ): Promise<void> {
    const id = this.nextId['logs']++;
    
    await (await this.db).put('logs', {
      log_id: id,
      user_id: userId,
      action_type: actionType,
      related_id: relatedId,
      description,
      timestamp: Date.now()
    });
  }

  // Query methods
  async getUserHistory(userId: string) {
    const db = await this.db;
    const logs = await db.getAllFromIndex('logs', 'by-user', userId);
    return logs.sort((a, b) => b.timestamp - a.timestamp);
  }

  async getUserStats(userId: string) {
    const db = await this.db;
    const [
      audioCount,
      transcriptionCount,
      translationCount,
      s2sCount,
      streamingCount
    ] = await Promise.all([
      db.countFromIndex('audio-files', 'by-user', userId),
      db.countFromIndex('transcriptions', 'by-user', userId),
      db.countFromIndex('translations', 'by-user', userId),
      db.countFromIndex('speech-to-speech', 'by-user', userId),
      db.countFromIndex('streaming-transcriptions', 'by-user', userId)
    ]);

    return {
      audio_files: audioCount,
      transcriptions: transcriptionCount,
      translations: translationCount,
      speech_to_speech: s2sCount,
      streaming_sessions: streamingCount
    };
  }
}

export const storage = new StorageService(); 