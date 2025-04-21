import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslationService } from "@/hooks/useTranslationService";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGES, LANGUAGE_NAMES } from "@/types/speech-services";
import { Play, Pause } from "lucide-react";

interface TranslateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TranslateModal = ({ isOpen, onClose }: TranslateModalProps) => {
  const [text, setText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("english");
  const [targetLanguage, setTargetLanguage] = useState("spanish");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { translate, result, isTranslating, reset } = useTranslationService();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await translate.mutateAsync({ 
        text, 
        sourceLanguage, 
        targetLanguage 
      });
    } catch (error) {
      console.error('Translation error:', error);
    }
  }, [text, sourceLanguage, targetLanguage, translate]);

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
    if (result?.audioUrl) {
      cleanupAudio();
      audioRef.current = new Audio(result.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    return cleanupAudio;
  }, [result?.audioUrl, cleanupAudio]);

  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
      reset();
      setText("");
      setSourceLanguage("english");
      setTargetLanguage("spanish");
    }
  }, [isOpen, cleanupAudio, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Text Translation</DialogTitle>
          <DialogDescription>
            Enter text to translate it to another language.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="text">Text to Translate</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[100px]"
                placeholder="Enter text to translate..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sourceLanguage">Source Language</Label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source language" />
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
            <div className="grid gap-2">
              <Label htmlFor="targetLanguage">Target Language</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target language" />
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

            {result?.translatedText && (
              <div className="grid gap-2">
                <Label>Translated Text</Label>
                <Textarea
                  value={result.translatedText}
                  readOnly
                  className="min-h-[100px]"
                />
              </div>
            )}

            <div className="grid gap-2">
              {result?.audioUrl && (
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
              disabled={!text.trim() || isTranslating}
            >
              {isTranslating ? "Translating..." : "Translate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TranslateModal;
