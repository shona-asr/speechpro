import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranscriptionStreamService } from "@/hooks/useTranscriptionStreamService";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGES, LANGUAGE_NAMES } from "@/types/speech-services";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

interface RealtimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RealtimeModal = ({ isOpen, onClose }: RealtimeModalProps) => {
  const [language, setLanguage] = useState("english");
  const [transcription, setTranscription] = useState("");
  const [isConnected, setIsConnected] = useState(true);
  const { transcribeStream } = useTranscriptionStreamService();
  const { startRecording, stopRecording, isRecording, audioChunks } = useAudioRecorder();
  const processedChunksRef = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Effect to process audio chunks and call the transcription stream service
  useEffect(() => {
    const processNewChunks = async () => {
      if (audioChunks.length <= processedChunksRef.current) return;

      const newChunks = audioChunks.slice(processedChunksRef.current);
      processedChunksRef.current = audioChunks.length;

      for (const chunk of newChunks) {
        try {
          // Sending each audio chunk for transcription via the service
          const result = await transcribeStream.mutateAsync({
            audioChunk: chunk,
            language,
          });
          setIsConnected(true);
          if (result.transcription) {
            setTranscription((prev) => {
              const newText = result.transcription.trim();
              if (!prev.includes(newText)) {
                return prev + (prev ? " " : "") + newText;
              }
              return prev;
            });
          }
        } catch (error) {
          console.error("Streaming transcription error:", error);
          setIsConnected(false);
          
          // Clear any existing retry timeout
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }
          
          // Set a new retry timeout
          retryTimeoutRef.current = setTimeout(() => {
            setIsConnected(true);
            // Reset the processed chunks counter to reprocess any failed chunks
            processedChunksRef.current = 0;
          }, 5000); // Retry after 5 seconds
        }
      }
    };

    if (isRecording) {
      processNewChunks();
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [audioChunks, isRecording, language, transcribeStream]);

  // Handle recording start and stop
  const handleStartRecording = () => {
    setTranscription("");
    processedChunksRef.current = 0;
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Real-time Transcription</DialogTitle>
          <DialogDescription>
            Record audio for real-time transcription.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LANGUAGES).filter(([key]) => key !== "auto").map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {LANGUAGE_NAMES[key as keyof typeof LANGUAGE_NAMES]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {transcription && (
            <div className="grid gap-2">
              <Label>Transcription</Label>
              <Textarea
                value={transcription}
                readOnly
                className="min-h-[100px]"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={transcribeStream.isPending}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { RealtimeModal };
