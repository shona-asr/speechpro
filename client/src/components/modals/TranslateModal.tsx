import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslationService } from "@/hooks/useTranslationService";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGES, LANGUAGE_NAMES } from "@/types/speech-services";
import { Play } from "lucide-react";

interface TranslateModalProps {
  isOpen: boolean;
  onClose: () => void;
  text?: string;
}

const TranslateModal = ({ isOpen, onClose, text = "" }: TranslateModalProps) => {
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("english");
  const [inputText, setInputText] = useState(text);
  const { translateText, result, playAudio } = useTranslationService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText) return;

    try {
      await translateText.mutateAsync({
        text: inputText,
        sourceLanguage,
        targetLanguage,
      });
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Translate Text</DialogTitle>
          <DialogDescription>
            Translate text between multiple languages with advanced neural translation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="text">Text to Translate</Label>
              <Textarea
                id="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to translate..."
                className="min-h-[100px]"
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
                    {Object.entries(LANGUAGES).map(([key, value]) => (
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
                    {Object.entries(LANGUAGES).filter(([key]) => key !== 'auto').map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {LANGUAGE_NAMES[key as keyof typeof LANGUAGE_NAMES]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {result && (
              <div className="grid gap-2">
                <Label>Translation</Label>
                <Textarea
                  value={result.translatedText}
                  readOnly
                  className="min-h-[100px]"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <div className="flex flex-col gap-2 w-full">
              {result?.audioUrl && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={playAudio}
                  className="w-full"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Play Audio
                </Button>
              )}
              <Button type="submit" disabled={!inputText || translateText.isPending}>
                {translateText.isPending ? "Translating..." : "Translate"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TranslateModal;
