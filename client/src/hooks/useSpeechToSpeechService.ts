import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { LANGUAGES } from "@/types/speech-services";
import { storage } from "@/lib/storage";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

interface SpeechToSpeechResult {
  originalAudioUrl: string;
  transcription: string;
  translatedText: string;
  synthesizedAudioUrl: string;
}

interface TranslationResponse {
  transcription: string;
  translatedText: string;
  originalAudioUrl: string;
  translatedAudioUrl: string;
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
  const { user } = useAuth();
  const [result, setResult] = useState<TranslationResponse | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [originalAudio, setOriginalAudio] = useState<HTMLAudioElement | null>(null);
  const [synthesizedAudio, setSynthesizedAudio] = useState<HTMLAudioElement | null>(null);

  const reset = useCallback(() => {
    setResult(null);
    setIsTranslating(false);
  }, []);

  const translate = useMutation({
    mutationFn: async ({ 
      file, 
      sourceLanguage, 
      targetLanguage 
    }: { 
      file: File; 
      sourceLanguage: string; 
      targetLanguage: string; 
    }) => {
      if (!user) {
        throw new Error("User must be logged in to perform speech-to-speech translation");
      }

      const formData = new FormData();
      formData.append("audio", file, file.name);
      formData.append("sourceLanguage", LANGUAGES[sourceLanguage as keyof typeof LANGUAGES].toLowerCase());
      formData.append("targetLanguage", LANGUAGES[targetLanguage as keyof typeof LANGUAGES].toLowerCase());

      const response = await fetch(API_ENDPOINTS.SPEECH_TO_SPEECH, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      return response.json();
    },
    onMutate: () => {
      setIsTranslating(true);
    },
    onSuccess: async (data) => {
      try {
        if (!user) {
          throw new Error("User must be logged in to save speech-to-speech translation");
        }

        // Save to database
        await storage.saveSpeechToSpeech(
          0, // This will be auto-incremented by the database
          user.uid,
          data.sourceLanguage,
          data.targetLanguage,
          data.originalAudioUrl,
          data.transcription,
          data.translatedText,
          data.translatedAudioUrl
        );

        setResult({
          transcription: data.transcription,
          translatedText: data.translatedText,
          originalAudioUrl: data.originalAudioUrl,
          translatedAudioUrl: data.translatedAudioUrl,
          sourceLanguage: data.sourceLanguage,
          targetLanguage: data.targetLanguage,
        });

        toast({
          title: "Translation complete",
          description: "Ready to play audio and view translation",
        });
      } catch (error) {
        console.error('Error saving speech-to-speech translation:', error);
        toast({
          title: "Error saving translation",
          description: "There was an error saving the speech-to-speech translation to the database",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Translation failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsTranslating(false);
    }
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
      if (result) {
        URL.revokeObjectURL(result.originalAudioUrl);
        URL.revokeObjectURL(result.translatedAudioUrl);
      }
    };
  }, [result]);

  return {
    translate,
    result,
    isTranslating,
    reset,
    playOriginalAudio,
    playSynthesizedAudio,
    originalAudio,
    synthesizedAudio
  };
};
