import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export const useSpeechServices = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Transcription service
  const transcribeAudio = useMutation({
    mutationFn: async ({ file, language, options }: { file: File, language: string, options: any }) => {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("language", language);
      formData.append("options", JSON.stringify(options));

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transcription complete",
        description: "Your audio has been successfully transcribed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recent-activities"] });
    },
    onError: (error) => {
      toast({
        title: "Transcription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Translation service
  const translateText = useMutation({
    mutationFn: async ({ 
      text, 
      sourceLanguage, 
      targetLanguage 
    }: { 
      text: string, 
      sourceLanguage: string, 
      targetLanguage: string 
    }) => {
      const response = await apiRequest("POST", "/api/translate", {
        text,
        sourceLanguage,
        targetLanguage,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Translation complete",
        description: "Your text has been successfully translated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recent-activities"] });
    },
    onError: (error) => {
      toast({
        title: "Translation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Text-to-Speech service
  const textToSpeech = useMutation({
    mutationFn: async ({ 
      text, 
      language, 
      voice 
    }: { 
      text: string, 
      language: string, 
      voice: string 
    }) => {
      const response = await apiRequest("POST", "/api/text-to-speech", {
        text,
        language,
        voice,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Speech generation complete",
        description: "Your text has been converted to speech.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recent-activities"] });
    },
    onError: (error) => {
      toast({
        title: "Speech generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Speech-to-Speech service
  const speechToSpeech = useMutation({
    mutationFn: async ({ 
      file, 
      sourceLanguage, 
      targetLanguage 
    }: { 
      file: File, 
      sourceLanguage: string, 
      targetLanguage: string 
    }) => {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("sourceLanguage", sourceLanguage);
      formData.append("targetLanguage", targetLanguage);

      const response = await fetch("/api/speech-to-speech", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Speech translation complete",
        description: "Your speech has been translated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recent-activities"] });
    },
    onError: (error) => {
      toast({
        title: "Speech translation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get user statistics
  const getUserStats = useQuery({
    queryKey: ["/api/user-stats"],
    enabled: !!user,
  });

  // Get recent activities
  const getRecentActivities = useQuery({
    queryKey: ["/api/recent-activities"],
    enabled: !!user,
  });

  return {
    transcribeAudio,
    translateText,
    textToSpeech,
    speechToSpeech,
    getUserStats,
    getRecentActivities,
  };
};
