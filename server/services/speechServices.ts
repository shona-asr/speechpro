import * as fs from 'fs';
import * as path from 'path';
import { transcribe, translate, synthesizeSpeech } from './googleCloud';

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
  options: any = {}
) {
  try {
    // Configure transcription options
    const config = {
      enableAutomaticPunctuation: options.addPunctuation !== false,
      enableSpeakerDiarization: options.enableSpeakerDiarization === true,
      diarizationSpeakerCount: options.enableSpeakerDiarization ? (options.speakerCount || 2) : undefined,
    };

    // Call the Google Cloud Speech-to-Text API
    const result = await transcribe(audioFilePath, language, config);
    
    return {
      text: result.text,
      durationSeconds: result.durationSeconds
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error(`Transcription failed: ${error.message}`);
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
    // Call the Google Cloud Translation API
    const result = await translate(text, sourceLanguage, targetLanguage);
    
    return {
      translatedText: result.translatedText
    };
  } catch (error) {
    console.error('Error translating text:', error);
    throw new Error(`Translation failed: ${error.message}`);
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
    // Call the Google Cloud Text-to-Speech API
    const result = await synthesizeSpeech(text, language, voice);
    
    return {
      audioUrl: result.audioUrl,
      durationSeconds: result.durationSeconds
    };
  } catch (error) {
    console.error('Error converting text to speech:', error);
    throw new Error(`Text-to-speech conversion failed: ${error.message}`);
  }
}

/**
 * Converts speech in one language to speech in another language
 * @param audioFilePath Path to the audio file
 * @param sourceLanguage Source language code (e.g., 'en-US')
 * @param targetLanguage Target language code (e.g., 'es-ES')
 * @returns Speech-to-speech result
 */
export async function speechToSpeech(
  audioFilePath: string,
  sourceLanguage: string,
  targetLanguage: string
) {
  try {
    // Step 1: Transcribe audio to text in source language
    const transcriptionResult = await transcribeAudio(audioFilePath, sourceLanguage);
    
    // Step 2: Translate text to target language
    // Convert language codes if necessary (speech-to-text vs translation format)
    const sourceTranslationLang = sourceLanguage.split('-')[0];
    const targetTranslationLang = targetLanguage.split('-')[0];
    
    const translationResult = await translateText(
      transcriptionResult.text,
      sourceTranslationLang,
      targetTranslationLang
    );
    
    // Step 3: Convert translated text to speech in target language
    // Select an appropriate voice for the target language
    const voice = `${targetLanguage}-Standard-A`;
    
    const ttsResult = await textToSpeech(
      translationResult.translatedText,
      targetLanguage,
      voice
    );
    
    return {
      audioUrl: ttsResult.audioUrl,
      durationSeconds: ttsResult.durationSeconds || transcriptionResult.durationSeconds
    };
  } catch (error) {
    console.error('Error in speech-to-speech translation:', error);
    throw new Error(`Speech-to-speech translation failed: ${error.message}`);
  }
}
