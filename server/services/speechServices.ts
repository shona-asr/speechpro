import * as fs from 'fs';
import * as path from 'path';
import fetch, { Response } from 'node-fetch';
import { ReadStream } from 'fs';
import FormData from 'form-data';

const API_BASE_URL = process.env.API_BASE_URL;

interface TranscriptionResult {
  transcription?: string;
  text?: string;
  language?: string;
  durationSeconds?: number;
}

interface TranscriptionOptions {
  model?: string;
  temperature?: number;
  [key: string]: any;
}

async function parseJsonResponse(response: Response): Promise<TranscriptionResult> {
  const data = await response.json();
  return data as TranscriptionResult;
}

/**
 * Transcribes audio file to text
 * @param audioFilePath Path to the audio file
 * @param language Language code of the audio (e.g., 'en-US')
 * @param options Additional options for transcription
 * @returns Transcription result
 */
export async function transcribeAudio(
  audioFilePath: string,
  language: string = 'en-US',
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  try {
    // Check if file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error('Audio file not found');
    }

    // Create form data
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(audioFilePath));
    formData.append('language', language);

    // Add any additional options
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Make request to transcription API
    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Transcription failed: ${errorText || response.statusText}`);
    }

    const result = await parseJsonResponse(response);
    
    // Return standardized response
    return {
      transcription: result.transcription || result.text || '',
      language: result.language || language,
      durationSeconds: result.durationSeconds || 0
    };
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    throw new Error(`Transcription failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Transcribes streaming audio data
 * @param audioData Audio data as Buffer
 * @param language Language code of the audio (e.g., 'en-US')
 * @param options Additional options for transcription
 * @returns Transcription result
 */
export async function transcribeStream(
  audioData: Buffer,
  language: string = 'en-US',
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('audio', audioData, {
      filename: 'stream.webm',
      contentType: 'audio/webm;codecs=opus'
    });
    formData.append('language', language);

    // Add any additional options
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Make request to streaming transcription API
    const response = await fetch(`${API_BASE_URL}/transcribe_stream`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Streaming transcription failed: ${errorText || response.statusText}`);
    }

    const result = await parseJsonResponse(response);
    
    // Return standardized response
    return {
      transcription: result.transcription || result.text || '',
      language: result.language || language,
      durationSeconds: result.durationSeconds || 0
    };
  } catch (error: any) {
    console.error('Error transcribing stream:', error);
    throw new Error(`Streaming transcription failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Translates text from one language to another
 * @param text Text to translate
 * @param sourceLanguage Source language code (e.g., 'en')
 * @param targetLanguage Target language code (e.g., 'es')
 * @returns Translation result
 */
export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
) {
  try {
    const response = await fetch(`${API_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage
      })
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      translatedText: result.translatedText
    };
  } catch (error: any) {
    console.error('Error translating text:', error);
    throw new Error(`Translation failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Converts text to speech
 * @param text Text to convert to speech
 * @param language Language code (e.g., 'en-US')
 * @param voice Voice name (e.g., 'en-US-Standard-B')
 * @returns Text-to-speech result
 */
export async function textToSpeech(
  text: string,
  language: string,
  voice: string
) {
  try {
    const response = await fetch(`${API_BASE_URL}/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        language,
        voice
      })
    });

    if (!response.ok) {
      throw new Error(`Text-to-speech failed: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioFileName = `tts_${Date.now()}.mp3`;
    const audioFilePath = path.join(process.cwd(), 'uploads', audioFileName);
    
    // Convert blob to buffer and save
    const buffer = Buffer.from(await audioBlob.arrayBuffer());
    fs.writeFileSync(audioFilePath, buffer);
    
    return {
      audioUrl: `/uploads/${audioFileName}`,
      durationSeconds: 0 // This would need to be calculated from the audio file
    };
  } catch (error: any) {
    console.error('Error converting text to speech:', error);
    throw new Error(`Text-to-speech conversion failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Converts speech in one language to speech in another language
 * @param audioFilePath Path to the audio file
 * @param sourceLanguage Source language code (e.g., 'en-US')
 * @param targetLanguage Target language code (e.g., 'es-ES')
 * @returns Speech-to-speech result with original text, translated text, and audio URL
 */
export async function speechToSpeech(
  audioFilePath: string,
  sourceLanguage: string,
  targetLanguage: string
) {
  try {
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(audioFilePath));
    formData.append('sourceLanguage', sourceLanguage);
    formData.append('targetLanguage', targetLanguage);

    const response = await fetch(`${API_BASE_URL}/speech-to-speech-translate`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Speech-to-speech translation failed: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioFileName = `sts_${Date.now()}.mp3`;
    const audioFilePath = path.join(process.cwd(), 'uploads', audioFileName);
    
    // Convert blob to buffer and save
    const buffer = Buffer.from(await audioBlob.arrayBuffer());
    fs.writeFileSync(audioFilePath, buffer);

    return {
      sourceText: '', // These would need to be returned from the API
      translatedText: '',
      audioUrl: `/uploads/${audioFileName}`,
      durationSeconds: 0
    };
  } catch (error: any) {
    console.error('Error in speech-to-speech translation:', error);
    throw new Error(`Speech-to-speech translation failed: ${error.message || 'Unknown error'}`);
  }
}
