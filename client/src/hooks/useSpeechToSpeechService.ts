import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { LANGUAGES } from "@/types/speech-services";
import { storage } from "@/lib/storage";
import { useState, useEffect } from "react";

interface SpeechToSpeechResult {
  originalAudioUrl: string;
  transcription: string;
  translatedText: string;
  synthesizedAudioUrl: string;
}

interface TranslationResponse {
  originalAudio: string;       // base64
  synthesizedAudio: string;    // base64
  transcription: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

// Helper function to convert base64 to Blob
function base64ToBlob(base64: string, mime: string = "audio/mp3"): Blob {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
}

export const useSpeechToSpeechService = () => {
  const { toast } = useToast();
  const [translationResult, setTranslationResult] = useState<SpeechToSpeechResult | null>(null);
  const [originalAudio, setOriginalAudio] = useState<HTMLAudioElement | null>(null);
  const [synthesizedAudio, setSynthesizedAudio] = useState<HTMLAudioElement | null>(null);

  const speechToSpeechTranslate = useMutation({
    mutationFn: async ({ file, sourceLanguage, targetLanguage }: { file: File, sourceLanguage: string, targetLanguage: string }) => {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('sourceLanguage', LANGUAGES[sourceLanguage as keyof typeof LANGUAGES]);
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

      const data: TranslationResponse = await response.json();

      if (
        !data.originalAudio || 
        !data.synthesizedAudio || 
        !data.transcription || 
        !data.translatedText
      ) {
        throw new Error("Incomplete response from the server.");
      }

      return data;
    },
    onSuccess: async (data) => {
      const {
        originalAudio: originalAudioBase64,
        synthesizedAudio: synthesizedAudioBase64,
        transcription,
        translatedText,
        sourceLanguage,
        targetLanguage
      } = data;

      const originalAudioBlob = base64ToBlob(originalAudioBase64);
      const synthesizedAudioBlob = base64ToBlob(synthesizedAudioBase64);

      const originalAudioUrl = URL.createObjectURL(originalAudioBlob);
      const synthesizedAudioUrl = URL.createObjectURL(synthesizedAudioBlob);

      // Create new audio elements
      const originalAudioElement = new Audio(originalAudioUrl);
      const synthesizedAudioElement = new Audio(synthesizedAudioUrl);

      setOriginalAudio(originalAudioElement);
      setSynthesizedAudio(synthesizedAudioElement);

      // Save to storage
      await storage.saveSpeechToSpeech(
        0,
        'current-user',
        sourceLanguage,
        targetLanguage,
        originalAudioUrl,
        transcription,
        translatedText,
        synthesizedAudioUrl
      );

      setTranslationResult({
        originalAudioUrl,
        transcription,
        translatedText,
        synthesizedAudioUrl
      });

      toast({
        title: "Translation complete",
        description: "Ready to play audio and view translation",
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        title: "Speech to Speech Translation failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const playOriginalAudio = () => {
    if (originalAudio) {
      if (originalAudio.paused) {
        originalAudio.play();
      } else {
        originalAudio.pause();
      }
    }
  };

  const playSynthesizedAudio = () => {
    if (synthesizedAudio) {
      if (synthesizedAudio.paused) {
        synthesizedAudio.play();
      } else {
        synthesizedAudio.pause();
      }
    }
  };

  // Cleanup function to revoke object URLs
  useEffect(() => {
    return () => {
      if (translationResult) {
        URL.revokeObjectURL(translationResult.originalAudioUrl);
        URL.revokeObjectURL(translationResult.synthesizedAudioUrl);
      }
    };
  }, [translationResult]);

  return {
    speechToSpeechTranslate,
    translationResult,
    playOriginalAudio,
    playSynthesizedAudio,
    originalAudio,
    synthesizedAudio
  };
};
