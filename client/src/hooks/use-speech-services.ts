import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { storage } from "@/lib/storage";
import { TranslationServiceClient } from '@google-cloud/translate';
import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import { API_ENDPOINTS } from "@/config/api";

// Supported languages
export const LANGUAGES = {
  'auto': 'autodetect',
  'english': 'en',
  'chinese': 'zh', 
  'shona': 'sn',
  'ndebele': 'nr'
} as const;

// Voice mapping for TTS
export const TTS_VOICE_MAP = {
  english: 'en-US',
  chinese: 'cmn-CN',
  shona: 'af-ZA',
  ndebele: 'af-ZA',
} as const;

// Language display names
export const LANGUAGE_NAMES = {
  auto: 'Auto Detect',
  english: 'English',
  chinese: 'Chinese',
  shona: 'Shona',
  ndebele: 'Ndebele'
} as const;

export const useSpeechServices = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, getToken } = useAuth();

  // Audio file storage
  const saveAudioFile = useMutation({
    mutationFn: async (file: File) => {
      return await storage.saveAudioFile(file, user?.id || '', 'auto');
    },
    onSuccess: () => {
      toast({
        title: "Audio file saved",
        description: "Your audio file has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["audio-files"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to save audio file",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Transcription service
  const transcribe = useMutation({
    mutationFn: async ({ file, language }: { file: File, language: string }) => {
      console.log('Sending transcription request...');
      console.log('File:', file);
      console.log('Language:', language);
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('language', LANGUAGES[language as keyof typeof LANGUAGES]);

      const response = await fetch(API_ENDPOINTS.TRANSCRIBE, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      const result = await response.json();
      console.log('Transcription result:', result);
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Transcription complete",
        description: data.transcription,
      });
      queryClient.invalidateQueries({ queryKey: ["transcriptions"] });
    },
    onError: (error) => {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Streaming transcription service
  const transcribeStream = useMutation({
    mutationFn: async ({ audioBlob, language }: { audioBlob: Blob, language: string }) => {
      console.log('Sending streaming transcription request...');
      console.log('Audio Blob:', audioBlob);
      console.log('Language:', language);
      const formData = new FormData();
      formData.append('audio_chunk', audioBlob);
      formData.append('language', LANGUAGES[language as keyof typeof LANGUAGES]);

      const response = await fetch(API_ENDPOINTS.TRANSCRIBE_STREAM, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      console.log('Streaming transcription update:', data);
    },
    onError: (error) => {
      console.error('Streaming transcription error:', error);
    },
  });

  // Translation service
  const translateText = useMutation({
    mutationFn: async ({ text, sourceLanguage, targetLanguage }: { text: string, sourceLanguage: string, targetLanguage: string }) => {
      console.log('Sending translation request...');
      console.log('Text:', text);
      console.log('Source Language:', sourceLanguage);
      console.log('Target Language:', targetLanguage);
      const response = await fetch(API_ENDPOINTS.TRANSLATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          text, 
          targetLanguage: targetLanguage,  // No conversion
          sourceLanguage: sourceLanguage
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Translation complete",
        description: `Translated to ${LANGUAGE_NAMES[data.targetLanguage as keyof typeof LANGUAGE_NAMES]}`,
      });
      queryClient.invalidateQueries({ queryKey: ["translations"] });
    },
    onError: (error) => {
      toast({
        title: "Translation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Text to Speech service
  const textToSpeech = useMutation({
    mutationFn: async ({ text, language }: { text: string, language: string }) => {
      console.log('Sending text-to-speech request...');
      console.log('Text:', text);
      console.log('Language:', language);
      const response = await fetch(API_ENDPOINTS.TEXT_TO_SPEECH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "audio/mp3"
        },
        // Change to send language code directly:
        body: JSON.stringify({ 
          text, 
          language: language  // Not LANGUAGES[language...]
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      const audioBlob = await response.blob();
      return audioBlob;
    },
    onSuccess: (audioBlob) => {
      // Create and play the audio
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      
      toast({
        title: "Text to Speech complete",
        description: "Playing audio...",
      });
    },
    onError: (error) => {
      toast({
        title: "Text to Speech failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Speech to Speech Translation service
  const speechToSpeechTranslate = useMutation({
    mutationFn: async ({ file, sourceLanguage, targetLanguage }: { file: File, sourceLanguage: string, targetLanguage: string }) => {
      console.log('Sending speech-to-speech translation request...');
      console.log('File:', file);
      console.log('Source Language:', sourceLanguage);
      console.log('Target Language:', targetLanguage);
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('sourceLanguage', sourceLanguage);
      formData.append('targetLanguage', targetLanguage);

      const response = await fetch(API_ENDPOINTS.SPEECH_TO_SPEECH, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      const audioBlob = await response.blob();
      return audioBlob;
    },
    onSuccess: (audioBlob) => {
      // Create and play the audio
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      
      toast({
        title: "Speech to Speech Translation complete",
        description: "Playing translated audio...",
      });
    },
    onError: (error) => {
      toast({
        title: "Speech to Speech Translation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // User stats query
  const getUserStats = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.USER_STATS, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user stats");
      }

      return response.json();
    },
  });

  // Query hooks for listing stored items
  const getAudioFiles = useQuery({
    queryKey: ["audio-files"],
    queryFn: async () => {
      const db = await storage.db;
      return db.getAllFromIndex('audio-files', 'by-user', user?.id || '');
    },
  });

  const getTranscriptions = useQuery({
    queryKey: ["transcriptions"],
    queryFn: async () => {
      const db = await storage.db;
      return db.getAllFromIndex('transcriptions', 'by-user', user?.id || '');
    },
  });

  const getTranslations = useQuery({
    queryKey: ["translations"],
    queryFn: async () => {
      const db = await storage.db;
      return db.getAllFromIndex('translations', 'by-user', user?.id || '');
    },
  });

  return {
    LANGUAGES,
    LANGUAGE_NAMES,
    saveAudioFile,
    transcribe,
    transcribeStream,
    translateText,
    textToSpeech,
    speechToSpeechTranslate,
    getAudioFiles,
    getTranscriptions,
    getTranslations,
    getUserStats,
  };
};
