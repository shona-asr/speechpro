import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { LANGUAGES } from "@/types/speech-services";
import { storage } from "@/lib/storage";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface TextToSpeechResult {
  originalText: string;
  audioUrl: string;
}

interface TextToSpeechResponse {
  audioBlob: Blob;
  originalText: string;
  language: string;
}

export const useTextToSpeechService = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [result, setResult] = useState<TextToSpeechResult | null>(null);

  const textToSpeech = useMutation<TextToSpeechResponse, Error, { text: string, language: string }>({
    mutationFn: async ({ text, language }) => {
      if (!user) {
        throw new Error("User must be logged in to perform text-to-speech");
      }

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
      return { audioBlob, originalText: text, language };
    },
    onSuccess: async (data) => {
      try {
        if (!user) {
          throw new Error("User must be logged in to save text-to-speech");
        }

        if (!data.audioBlob) {
          throw new Error('No audio data received');
        }

        // Create URL for audio playback
        const audioUrl = URL.createObjectURL(data.audioBlob);
        
        // Save to database
        await storage.saveTextToSpeech(
          user.uid,
          data.originalText,
          data.language,
          audioUrl
        );

        // Update state with results
        setResult({
          originalText: data.originalText,
          audioUrl
        });
        
        toast({
          title: "Text to Speech complete",
          description: "Ready to play audio",
        });
      } catch (error) {
        console.error('Error saving text-to-speech:', error);
        toast({
          title: "Error saving text-to-speech",
          description: "There was an error saving the text-to-speech to the database",
          variant: "destructive",
        });
      }
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