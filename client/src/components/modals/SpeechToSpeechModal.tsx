import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSpeechToSpeechService } from "@/hooks/useSpeechToSpeechService";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGES, LANGUAGE_NAMES } from "@/types/speech-services";
import { Play, Pause } from "lucide-react";

interface SpeechToSpeechModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SpeechToSpeechModal = ({ isOpen, onClose }: SpeechToSpeechModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState("english");
  const [targetLanguage, setTargetLanguage] = useState("spanish");
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);
  const [isPlayingTranslated, setIsPlayingTranslated] = useState(false);
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const translatedAudioRef = useRef<HTMLAudioElement | null>(null);
  const { translate, result, isTranslating, reset } = useSpeechToSpeechService();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      await translate.mutateAsync({ 
        file, 
        sourceLanguage, 
        targetLanguage 
      });
    } catch (error) {
      console.error('Translation error:', error);
    }
  }, [file, sourceLanguage, targetLanguage, translate]);

  const handlePlayPauseOriginal = useCallback(() => {
    if (originalAudioRef.current) {
      if (isPlayingOriginal) {
        originalAudioRef.current.pause();
      } else {
        originalAudioRef.current.play();
      }
      setIsPlayingOriginal(!isPlayingOriginal);
    }
  }, [isPlayingOriginal]);

  const handlePlayPauseTranslated = useCallback(() => {
    if (translatedAudioRef.current) {
      if (isPlayingTranslated) {
        translatedAudioRef.current.pause();
      } else {
        translatedAudioRef.current.play();
      }
      setIsPlayingTranslated(!isPlayingTranslated);
    }
  }, [isPlayingTranslated]);

  const cleanupAudio = useCallback(() => {
    if (originalAudioRef.current) {
      originalAudioRef.current.pause();
      originalAudioRef.current = null;
    }
    if (translatedAudioRef.current) {
      translatedAudioRef.current.pause();
      translatedAudioRef.current = null;
    }
    setIsPlayingOriginal(false);
    setIsPlayingTranslated(false);
  }, []);

  useEffect(() => {
    if (result?.originalAudioUrl) {
      cleanupAudio();
      originalAudioRef.current = new Audio(result.originalAudioUrl);
      originalAudioRef.current.onended = () => setIsPlayingOriginal(false);
    }
    if (result?.translatedAudioUrl) {
      translatedAudioRef.current = new Audio(result.translatedAudioUrl);
      translatedAudioRef.current.onended = () => setIsPlayingTranslated(false);
    }
    return cleanupAudio;
  }, [result?.originalAudioUrl, result?.translatedAudioUrl, cleanupAudio]);

  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
      reset();
      setFile(null);
      setSourceLanguage("english");
      setTargetLanguage("spanish");
    }
  }, [isOpen, cleanupAudio, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Speech to Speech Translation</DialogTitle>
          <DialogDescription>
            Upload an audio file to translate it to another language.
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

            {result?.transcription && (
              <div className="grid gap-2">
                <Label>Original Text</Label>
                <Textarea
                  value={result.transcription}
                  readOnly
                  className="min-h-[100px]"
                />
              </div>
            )}

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
              {result?.originalAudioUrl && (
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handlePlayPauseOriginal} 
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isPlayingOriginal ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause Original Audio
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Play Original Audio
                    </>
                  )}
                </Button>
              )}

              {result?.translatedAudioUrl && (
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handlePlayPauseTranslated} 
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isPlayingTranslated ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause Translated Audio
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Play Translated Audio
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="submit" 
              disabled={!file || isTranslating}
            >
              {isTranslating ? "Translating..." : "Translate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SpeechToSpeechModal;
