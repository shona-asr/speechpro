import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { LANGUAGES } from "@/types/speech-services";
import { storage } from "@/lib/storage";
import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

interface TranslationResult {
  originalText: string;
  sourceLanguage: string;
  translatedText: string;
  targetLanguage: string;
  audioUrl?: string;
}

export const useTranslationService = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const reset = useCallback(() => {
    setResult(null);
    setIsTranslating(false);
  }, []);

  const translate = useMutation({
    mutationFn: async ({ 
      text, 
      sourceLanguage, 
      targetLanguage 
    }: { 
      text: string; 
      sourceLanguage: string; 
      targetLanguage: string; 
    }) => {
      if (!user) {
        throw new Error("User must be logged in to translate");
      }

      const response = await fetch(API_ENDPOINTS.TRANSLATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          sourceLanguage: LANGUAGES[sourceLanguage as keyof typeof LANGUAGES].toLowerCase(),
          targetLanguage: LANGUAGES[targetLanguage as keyof typeof LANGUAGES].toLowerCase(),
        }),
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
          throw new Error("User must be logged in to save translation");
        }

        // Save to database
        await storage.saveTranslation(
          0, // This will be auto-incremented by the database
          user.uid,
          data.sourceLanguage,
          data.targetLanguage,
          data.originalText,
          data.translatedText,
          data.audioUrl
        );

        setResult({
          originalText: data.originalText,
          sourceLanguage: data.sourceLanguage,
          translatedText: data.translatedText,
          targetLanguage: data.targetLanguage,
          audioUrl: data.audioUrl,
        });

        toast({
          title: "Translation complete",
          description: "Ready to play audio and view translation",
        });
      } catch (error) {
        console.error('Error saving translation:', error);
        toast({
          title: "Error saving translation",
          description: "There was an error saving the translation to the database",
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

  const playAudio = () => {
    if (result?.audioUrl) {
      const audio = new Audio(result.audioUrl);
      console.log('Playing audio:', result.audioUrl);
      audio.play();
    }
  };

  return {
    translate,
    result,
    isTranslating,
    reset,
    playAudio
  };
}; 