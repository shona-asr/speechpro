import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { LANGUAGES } from "@/types/speech-services";
import { storage } from "@/lib/storage";
import { useState } from "react";

interface TranslationResult {
  originalText: string;
  sourceLanguage: string;
  translatedText: string;
  targetLanguage: string;
  audioUrl?: string;
}

export const useTranslationService = () => {
  const { toast } = useToast();
  const [result, setResult] = useState<TranslationResult | null>(null);

  const translateText = useMutation({
    mutationFn: async ({ text, sourceLanguage, targetLanguage }: { text: string, sourceLanguage: string, targetLanguage: string }) => {
      const response = await fetch(API_ENDPOINTS.TRANSLATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          sourceLanguage: LANGUAGES[sourceLanguage as keyof typeof LANGUAGES],
          targetLanguage: LANGUAGES[targetLanguage as keyof typeof LANGUAGES],
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      const data = await response.json();
      return { ...data, originalText: text };
    },
    onSuccess: async (data) => {
      // Create URL for audio playback if available
      let audioUrl = '';
      if (data.audioContent) {
        try {
          const byteCharacters = atob(data.audioContent);
          const byteArrays = new Uint8Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteArrays[i] = byteCharacters.charCodeAt(i);
          }
      
          const blob = new Blob([byteArrays], { type: "audio/mp3" });
          audioUrl = URL.createObjectURL(blob);
        } catch (err) {
          console.error("Failed to decode audio content", err);
        }
      }
      

      // Save to storage
      await storage.saveTranslation(
        0, // transcriptionId will be updated if needed
        'current-user', // userId should be from auth context
        data.sourceLanguage,
        data.targetLanguage,
        data.originalText,
        data.translatedText,
        audioUrl
      );

      // Update state with results
      setResult({
        originalText: data.originalText,
        sourceLanguage: data.sourceLanguage,
        translatedText: data.translatedText,
        targetLanguage: data.targetLanguage,
        audioUrl
      });
      
      toast({
        title: "Translation complete",
        description: "Ready to view translation and play audio",
      });
    },
    onError: (error) => {
      toast({
        title: "Translation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const playAudio = () => {
    if (result?.audioUrl) {
      const audio = new Audio(result.audioUrl);
      console.log('Playing audio:', result.audioUrl);
      audio.play();
    }
  };

  return {
    translateText,
    result,
    playAudio
  };
}; 