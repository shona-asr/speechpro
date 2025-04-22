import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { LANGUAGES } from "@/types/speech-services";
import { storage } from "@/lib/storage";
import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

interface TranscriptionResult {
  originalAudioUrl: string;
  transcription: string;
  translatedText?: string;  // Optional, if backend returns translated text
  translatedAudioUrl?: string; // Optional, if backend returns translated audio
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

export const useTranscriptionService = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const reset = useCallback(() => {
    setResult(null);
    setIsTranscribing(false);
  }, []);

  const transcribeAudio = useMutation({
    mutationFn: async ({ file, language }: { file: File; language: string }) => {
      if (!user) {
        throw new Error("User must be logged in to transcribe audio");
      }

      const formData = new FormData();
      formData.append("audio", file, file.name);
      formData.append("language", LANGUAGES[language as keyof typeof LANGUAGES].toLowerCase());

      const response = await fetch(API_ENDPOINTS.TRANSCRIBE, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      return response.json();
    },
    onMutate: () => {
      setIsTranscribing(true);
    },
    onSuccess: async (data) => {
      try {
        if (!user) {
          throw new Error("User must be logged in to save transcription");
        }

        const {
          originalAudio,
          transcription
        } = data;

        // Create URL for audio playback
        const originalAudioBlob = base64ToBlob(originalAudio);
        const originalAudioUrl = URL.createObjectURL(originalAudioBlob);

        // Convert base64 to File object
        const audioFile = new File([originalAudioBlob], 'audio.mp3', { type: 'audio/mp3' });

        // Save to storage
        const audioId = await storage.saveAudioFile(
          audioFile,
          user.uid,
          data.language
        );

        await storage.saveTranscription(
          audioId,
          user.uid,
          data.transcription,
          data.language,
          data.confidence || 0,
          "batch",
          originalAudioUrl
        );

        setResult({
          originalAudioUrl,
          transcription: data.transcription,
        });

        toast({
          title: "Transcription complete",
          description: "Ready to play audio and view transcription",
        });
      } catch (error) {
        console.error('Error processing transcription result:', error);
        toast({
          title: "Error processing result",
          description: "There was an error processing the transcription result",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Transcription failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsTranscribing(false);
    }
  });

  return {
    transcribe: transcribeAudio,
    transcribeAudio,
    result,
    isTranscribing,
    reset
  };
};
