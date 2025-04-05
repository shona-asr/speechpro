import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { TranslationServiceClient } from '@google-cloud/translate';
import { SpeechClient } from '@google-cloud/speech';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

// Load service account credentials
const serviceAccountPath = path.resolve(process.cwd(), 'attached_assets/asrGCAPI.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Google Cloud clients
const textToSpeechClient = new TextToSpeechClient({
  credentials: serviceAccount
});

const translationClient = new TranslationServiceClient({
  credentials: serviceAccount
});

const speechClient = new SpeechClient({
  credentials: serviceAccount
});

// Project ID from service account
const projectId = serviceAccount.project_id;
const location = 'global';

// Helper for Speech-to-Text API
export async function transcribe(audioFilePath: string, languageCode: string = 'en-US', config: any = {}) {
  try {
    // Read the audio file
    const file = fs.readFileSync(audioFilePath);
    const audioBytes = file.toString('base64');

    // Configure request
    const audio = {
      content: audioBytes,
    };
    
    const requestConfig = {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode,
      ...config,
    };
    
    const request = {
      audio,
      config: requestConfig,
    };

    // Detects speech in the audio file
    const [response] = await speechClient.recognize(request);
    
    // Estimate duration (this is approximate and would be more accurate with file metadata)
    const fileSizeBytes = fs.statSync(audioFilePath).size;
    const approximateDurationSeconds = Math.ceil(fileSizeBytes / (16000 * 2)); // Rough estimate for 16kHz, 16-bit audio

    // Get the transcription from the response
    let transcription = '';
    if (response && response.results) {
      transcription = response.results
        .map(result => result.alternatives && result.alternatives[0] ? result.alternatives[0].transcript : '')
        .join(' ');
    }

    return {
      text: transcription,
      durationSeconds: approximateDurationSeconds
    };
  } catch (error) {
    console.error('Error in transcription:', error);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}

// Helper for Translation API
export async function translate(text: string, sourceLanguageCode: string, targetLanguageCode: string) {
  try {
    const projectId = serviceAccount.project_id;
    const location = 'global';

    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: 'text/plain',
      sourceLanguageCode,
      targetLanguageCode,
    };

    const [response] = await translationClient.translateText(request);
    
    if (!response.translations || response.translations.length === 0) {
      throw new Error('No translation returned from API');
    }

    return {
      translatedText: response.translations[0].translatedText || ''
    };
  } catch (error) {
    console.error('Error in translation:', error);
    throw new Error(`Failed to translate text: ${error.message}`);
  }
}

// Helper for Text-to-Speech API
export async function synthesizeSpeech(text: string, languageCode: string, voiceName: string) {
  try {
    // Configure request
    const request = {
      input: { text },
      voice: { languageCode, name: voiceName },
      audioConfig: { audioEncoding: 'MP3' },
    };

    // Generate speech
    const [response] = await textToSpeechClient.synthesizeSpeech(request);
    
    if (!response.audioContent) {
      throw new Error('No audio content returned from API');
    }

    // Create unique filename
    const outputDir = path.resolve(process.cwd(), 'temp');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filename = `tts-${Date.now()}.mp3`;
    const outputPath = path.join(outputDir, filename);
    
    // Write the audio content to file
    fs.writeFileSync(outputPath, response.audioContent, 'binary');
    
    // Calculate approximate duration based on word count and rate
    // This is a very rough estimate
    const wordCount = text.split(/\s+/).length;
    const approximateDurationSeconds = Math.ceil(wordCount / 2.5); // Assuming average of 2.5 words per second
    
    // In a production app, we'd host this file somewhere accessible
    // For now, we'll return a local path that would be served by our Express app
    return {
      audioUrl: `/temp/${filename}`,
      durationSeconds: approximateDurationSeconds
    };
  } catch (error) {
    console.error('Error in speech synthesis:', error);
    throw new Error(`Failed to synthesize speech: ${error.message}`);
  }
}
