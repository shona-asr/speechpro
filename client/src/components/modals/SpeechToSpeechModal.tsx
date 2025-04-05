import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSpeechServices } from "@/hooks/use-speech-services";
import { Upload } from "lucide-react";

interface SpeechToSpeechModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SpeechToSpeechModal = ({ isOpen, onClose }: SpeechToSpeechModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState("en-US");
  const [targetLanguage, setTargetLanguage] = useState("es-ES");
  const [audioUrl, setAudioUrl] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const { speechToSpeech } = useSpeechServices();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    try {
      const result = await speechToSpeech.mutateAsync({
        file,
        sourceLanguage,
        targetLanguage,
      });
      setAudioUrl(result.audioUrl);
      setSourceText(result.sourceText || "");
      setTranslatedText(result.translatedText || "");
    } catch (error) {
      console.error("Speech-to-Speech error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Speech to Speech Translation</DialogTitle>
          <DialogDescription>
            Upload an audio file to translate it to another language.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="audio-file">Upload Audio File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-10 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-1 text-sm text-gray-500">
                {file ? file.name : "Drag and drop a file here, or click to browse"}
              </p>
              <Input
                id="audio-file"
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={() => document.getElementById("audio-file")?.click()}
              >
                Select File
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="source-language">Source Language</Label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger id="source-language">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                  <SelectItem value="de-DE">German</SelectItem>
                  <SelectItem value="ja-JP">Japanese</SelectItem>
                  <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="target-language">Target Language</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger id="target-language">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                  <SelectItem value="de-DE">German</SelectItem>
                  <SelectItem value="ja-JP">Japanese</SelectItem>
                  <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {sourceText && (
            <div className="space-y-2">
              <Label>Recognized Text ({sourceLanguage})</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                {sourceText}
              </div>
            </div>
          )}

          {translatedText && (
            <div className="space-y-2">
              <Label>Translated Text ({targetLanguage})</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                {translatedText}
              </div>
            </div>
          )}

          {audioUrl && (
            <div className="space-y-2">
              <Label>Translated Speech</Label>
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
            disabled={!file || speechToSpeech.isPending}
          >
            {speechToSpeech.isPending ? "Processing..." : "Translate Speech"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpeechToSpeechModal;
