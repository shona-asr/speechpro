import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { LANGUAGES } from "@/types/speech-services";
import { storage } from "@/lib/storage";
import { useState } from "react";

interface TextToSpeechResult {
  originalText: string;
  audioUrl: string;
}

export const useTextToSpeechService = () => {
  const { toast } = useToast();
  const [result, setResult] = useState<TextToSpeechResult | null>(null);

  const textToSpeech = useMutation({
    mutationFn: async ({ text, language }: { text: string, language: string }) => {
      const response = await fetch(API_ENDPOINTS.TEXT_TO_SPEECH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          language: language 
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      // Get the audio blob directly from the response
      const audioBlob = await response.blob();
      return { audioBlob, originalText: text };
    },
    onSuccess: async (data) => {
      if (!data.audioBlob) {
        throw new Error('No audio data received');
      }

      // Create URL for audio playback
      const audioUrl = URL.createObjectURL(data.audioBlob);
      
      

      // Update state with results
      setResult({
        originalText: data.originalText,
        audioUrl
      });
      
      toast({
        title: "Text to Speech complete",
        description: "Ready to play audio",
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

  const playAudio = () => {
    if (result?.audioUrl) {
      const audio = new Audio(result.audioUrl);
      console.log('Playing audio:', result.audioUrl);
      audio.play();
    }
  };

  return {
    textToSpeech,
    result,
    playAudio
  };
}; 