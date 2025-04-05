import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSpeechServices } from "@/hooks/use-speech-services";

interface TextToSpeechModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TextToSpeechModal = ({ isOpen, onClose }: TextToSpeechModalProps) => {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [voice, setVoice] = useState("en-US-Standard-B"); // Default voice
  const [audioUrl, setAudioUrl] = useState("");
  const { textToSpeech } = useSpeechServices();

  const voices = {
    "en-US": [
      { value: "en-US-Standard-A", label: "Female" },
      { value: "en-US-Standard-B", label: "Male" },
      { value: "en-US-Wavenet-A", label: "Female (Natural)" },
      { value: "en-US-Wavenet-B", label: "Male (Natural)" },
    ],
    "es-ES": [
      { value: "es-ES-Standard-A", label: "Female" },
      { value: "es-ES-Standard-B", label: "Male" },
    ],
    "fr-FR": [
      { value: "fr-FR-Standard-A", label: "Female" },
      { value: "fr-FR-Standard-B", label: "Male" },
    ],
    "de-DE": [
      { value: "de-DE-Standard-A", label: "Female" },
      { value: "de-DE-Standard-B", label: "Male" },
    ],
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // Set default voice for selected language
    if (voices[newLanguage as keyof typeof voices]) {
      setVoice(voices[newLanguage as keyof typeof voices][0].value);
    }
  };

  const handleSubmit = async () => {
    if (!text) return;

    try {
      const result = await textToSpeech.mutateAsync({
        text,
        language,
        voice,
      });
      setAudioUrl(result.audioUrl);
    } catch (error) {
      console.error("Text-to-Speech error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Text to Speech</DialogTitle>
          <DialogDescription>
            Convert text to natural-sounding speech.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es-ES">Spanish</SelectItem>
                <SelectItem value="fr-FR">French</SelectItem>
                <SelectItem value="de-DE">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice">Voice</Label>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger id="voice">
                <SelectValue placeholder="Select Voice" />
              </SelectTrigger>
              <SelectContent>
                {voices[language as keyof typeof voices]?.map(voiceOption => (
                  <SelectItem key={voiceOption.value} value={voiceOption.value}>
                    {voiceOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text-to-convert">Text</Label>
            <Textarea
              id="text-to-convert"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to convert to speech..."
              rows={4}
            />
          </div>

          {audioUrl && (
            <div className="space-y-2">
              <Label>Generated Speech</Label>
              <audio controls className="w-full">
                <source src={audioUrl} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!text || textToSpeech.isPending}
          >
            {textToSpeech.isPending ? "Generating..." : "Generate Speech"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TextToSpeechModal;
