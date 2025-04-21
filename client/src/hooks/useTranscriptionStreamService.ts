import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { LANGUAGES } from "@/types/speech-services";
import { storage } from "@/lib/storage";
import { useState } from "react";

interface StreamingResult {
  originalAudioUrl: string;
  transcription: string;
  translatedText?: string;  // Optional field for translated text if available
  translatedAudioUrl?: string;  // Optional field for translated audio URL if available
}

export const useTranscriptionStreamService = () => {
  const { toast } = useToast();
  const [result, setResult] = useState<StreamingResult | null>(null);
  const [streamId, setStreamId] = useState<number | null>(null);

  const transcribeStream = useMutation({
    mutationFn: async ({ audioChunk, language }: { audioChunk: Blob; language: string }) => {
      const formData = new FormData();
      formData.append('audio_chunk', audioChunk);
      formData.append('language', LANGUAGES[language as keyof typeof LANGUAGES]);

      let retries = 3;
      let lastError;

      while (retries > 0) {
        try {
          const response = await fetch(API_ENDPOINTS.TRANSCRIBE_STREAM, {
            method: "POST",
            body: formData,
            credentials: "include",
            headers: {
              'Connection': 'keep-alive',
              'Keep-Alive': 'timeout=60, max=1000'
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || response.statusText);
          }

          const data = await response.json();
          return data;
        } catch (error) {
          lastError = error;
          retries--;
          if (retries > 0) {
            // Wait for 1 second before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      throw lastError || new Error('Failed to transcribe audio chunk after multiple attempts');
    },
    onSuccess: async (data, variables) => {
      // If this is the first chunk, start a new streaming session
      if (!streamId) {
        const newStreamId = await storage.startStreamingSession(
          'current-user', // userId should be from auth context
          variables.language
        );
        setStreamId(newStreamId);
      }

      // Create URL for audio playback if available
      let audioUrl = '';
      if (data.originalAudio) {
        audioUrl = URL.createObjectURL(data.originalAudio);
      }

      // Update the streaming session with new data
      if (streamId) {
        await storage.updateStreamingSession(
          streamId,
          data.transcription,
          data.confidence || 0,
          audioUrl
        );
      }

      // Check if translated audio and text are present and handle them
      const translatedText = data.translatedText || result?.translatedText;
      const translatedAudioUrl = data.translatedAudioUrl || result?.translatedAudioUrl;

      // Update state with results
      setResult(prev => ({
        originalAudioUrl: audioUrl || prev?.originalAudioUrl || '',
        transcription: data.transcription,
        translatedText,
        translatedAudioUrl
      }));

      toast({
        title: "Streaming transcription updated",
        description: "New transcription available",
      });
    },
    onError: (error) => {
      toast({
        title: "Streaming transcription failed",
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
    transcribeStream,
    result,
    playAudio,
    playTranslatedAudio,  // Added function to play translated audio
  };
};
