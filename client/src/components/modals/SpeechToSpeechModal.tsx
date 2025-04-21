import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSpeechToSpeechService } from "@/hooks/useSpeechToSpeechService";
import { LANGUAGES, LANGUAGE_NAMES } from "@/types/speech-services";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause } from "lucide-react";

interface SpeechToSpeechModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SpeechToSpeechModal = ({ isOpen, onClose }: SpeechToSpeechModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("english");

  const { speechToSpeechTranslate, translationResult, playOriginalAudio, playSynthesizedAudio, originalAudio, synthesizedAudio } = useSpeechToSpeechService();
  const { toast } = useToast();

  // Reset form and translation data when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      await speechToSpeechTranslate.mutateAsync({
        file,
        sourceLanguage,
        targetLanguage,
      });
    } catch (error) {
      console.error("Speech-to-Speech error:", error);
      toast({
        title: "Translation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sourceLanguage">From</Label>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LANGUAGES).map(([key]) => (
                      <SelectItem key={key} value={key}>
                        {LANGUAGE_NAMES[key as keyof typeof LANGUAGE_NAMES]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="targetLanguage">To</Label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LANGUAGES)
                      .filter(([key]) => key !== "auto")
                      .map(([key]) => (
                        <SelectItem key={key} value={key}>
                          {LANGUAGE_NAMES[key as keyof typeof LANGUAGE_NAMES]}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Translation Results */}
            {translationResult && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Original Transcription</Label>
                  <Textarea
                    value={translationResult.transcription}
                    readOnly
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Translated Text</Label>
                  <Textarea
                    value={translationResult.translatedText}
                    readOnly
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={playOriginalAudio}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {originalAudio?.paused ? (
                      <>
                        <Play className="h-4 w-4" />
                        Play Original
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause Original
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={playSynthesizedAudio}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {synthesizedAudio?.paused ? (
                      <>
                        <Play className="h-4 w-4" />
                        Play Translated
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause Translated
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={!file || speechToSpeechTranslate.isPending}
            >
              {speechToSpeechTranslate.isPending ? "Translating..." : "Translate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { SpeechToSpeechModal };
