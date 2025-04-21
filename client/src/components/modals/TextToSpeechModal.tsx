import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useTextToSpeechService } from "@/hooks/useTextToSpeechService";
import { Play } from "lucide-react";

interface TextToSpeechModalProps {
  isOpen: boolean;
  onClose: () => void;
  text?: string;
}

const TextToSpeechModal = ({ isOpen, onClose, text = "" }: TextToSpeechModalProps) => {
  const [inputText, setInputText] = useState(text);
  const [language, setLanguage] = useState("english");
  const [isPlaying, setIsPlaying] = useState(false);

  const { textToSpeech, result } = useTextToSpeechService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText) return;

    try {
      await textToSpeech.mutateAsync({
        text: inputText,
        language
      });
    } catch (error) {
      console.error('Text-to-Speech error:', error);
    }
  };

  const handlePlay = () => {
    if (result?.audioUrl) {
      const audio = new Audio(result.audioUrl);
      setIsPlaying(true);
      audio.play();
      audio.onended = () => setIsPlaying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Text to Speech</DialogTitle>
          <DialogDescription>
            Convert text to spoken audio in your chosen language.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="text">Text to Convert</Label>
              <Textarea
                id="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to convert to speech..."
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="shona">Shona</SelectItem>
                  <SelectItem value="ndebele">Ndebele</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {result && result.audioUrl && (
              <div className="grid gap-2">
                <div>
                  <Label>Original Text</Label>
                  <div className="text-sm border rounded p-2 bg-muted">{result.originalText}</div>
                </div>

                <div>
                  <Label>Audio</Label>
                  <Button
                    variant="outline"
                    onClick={handlePlay}
                    className="w-full"
                    disabled={isPlaying}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {isPlaying ? "Playing..." : "Play Audio"}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!inputText || textToSpeech.isPending}>
              {textToSpeech.isPending ? "Converting..." : "Convert to Speech"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TextToSpeechModal;
