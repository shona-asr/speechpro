import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { LANGUAGES } from "@/types/speech-services";
import { storage } from "@/lib/storage";
import { useState } from "react";

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
  const [result, setResult] = useState<TranscriptionResult | null>(null);

  const transcribeAudio = useMutation({
    mutationFn: async ({ file, language }: { file: File; language: string }) => {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("language", LANGUAGES[language as keyof typeof LANGUAGES]);

      const response = await fetch(API_ENDPOINTS.TRANSCRIBE, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      const data = await response.json();
      return data;
    },
    onSuccess: async (data) => {
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
        "current-user", // userId should be from auth context
        data.language
      );

      await storage.saveTranscription(
        audioId,
        "current-user", // userId should be from auth context
        data.transcription,
        data.language,
        data.confidence || 0,
        "batch",
        originalAudioUrl
      );

      // Update result with backend data, including translated content if available
      setResult({
        originalAudioUrl,
        transcription: data.transcription,
        //translatedText: data.translatedText || undefined, // Optional field
        //translatedAudioUrl: data.translatedAudio || undefined, // Optional field
      });

      toast({
        title: "Transcription complete",
        description: "Ready to play audio and view transcription",
      });
    },
    onError: (error) => {
      toast({
        title: "Transcription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const playAudio = () => {
    if (result?.originalAudioUrl) {
      const audio = new Audio(result.originalAudioUrl);
      audio.play();
    }
  };

  const playTranslatedAudio = () => {
    if (result?.translatedAudioUrl) {
      const audio = new Audio(result.translatedAudioUrl);
      audio.play();
    }
  };

  return {
    transcribe: transcribeAudio,
    transcribeAudio,
    result,
    playAudio,
    playTranslatedAudio,
  };
};
