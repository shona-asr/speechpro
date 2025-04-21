import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranscriptionService } from "@/hooks/useTranscriptionService";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGES, LANGUAGE_NAMES } from "@/types/speech-services";
import { Play, Pause } from "lucide-react";

interface TranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TranscribeModal = ({ isOpen, onClose }: TranscribeModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("english");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { transcribe, result, isTranscribing, reset } = useTranscriptionService();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      await transcribe.mutateAsync({ file, language });
    } catch (error) {
      console.error('Transcription error:', error);
    }
  }, [file, language, transcribe]);

  const handlePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (result?.originalAudioUrl) {
      cleanupAudio();
      audioRef.current = new Audio(result.originalAudioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    return cleanupAudio;
  }, [result?.originalAudioUrl, cleanupAudio]);

  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
      reset();
      setFile(null);
      setLanguage("english");
    }
  }, [isOpen, cleanupAudio, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transcribe Audio</DialogTitle>
          <DialogDescription>
            Upload an audio file to transcribe it to text.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Audio File</Label>
              <Input
                id="file"
                type="file"
                accept="audio/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {LANGUAGE_NAMES[key as keyof typeof LANGUAGE_NAMES]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {result?.transcription && (
              <div className="grid gap-2">
                <Label>Transcription</Label>
                <Textarea
                  value={result.transcription}
                  readOnly
                  className="min-h-[100px]"
                />
              </div>
            )}

            <div className="grid gap-2">
              {result?.originalAudioUrl && (
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handlePlayPause} 
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause Audio
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Play Audio
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="submit" 
              disabled={!file || isTranscribing}
            >
              {isTranscribing ? "Transcribing..." : "Transcribe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TranscribeModal;
