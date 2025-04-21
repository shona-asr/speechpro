import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranscriptionService } from "@/hooks/useTranscriptionService";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGES, LANGUAGE_NAMES } from "@/types/speech-services";

interface TranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TranscribeModal = ({ isOpen, onClose }: TranscribeModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("english");
  const { transcribe, result, playAudio, playTranslatedAudio } = useTranscriptionService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      await transcribe.mutateAsync({ file, language });
    } catch (error) {
      console.error('Transcription error:', error);
    }
  };

  useEffect(() => {
    if (result) {
      // You can set any UI changes you want once the transcription result is available.
    }
  }, [result]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
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

            {/* Transcription Result */}
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

            {/* Translated Text Result */}
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

            {/* Play Audio Buttons */}
            <div className="grid gap-2">
              {result?.originalAudioUrl && (
                <Button variant="outline" onClick={playAudio} className="w-full">
                  Play Original Audio
                </Button>
              )}

              {result?.translatedAudioUrl && (
                <Button variant="outline" onClick={playTranslatedAudio} className="w-full">
                  Play Translated Audio
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!file || transcribe.isPending}>
              {transcribe.isPending ? "Transcribing..." : "Transcribe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TranscribeModal;
