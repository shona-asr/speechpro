import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useSpeechServices } from "@/hooks/use-speech-services";
import { Upload } from "lucide-react";

interface TranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TranscribeModal = ({ isOpen, onClose }: TranscribeModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("en-US");
  const [enableSpeakerDiarization, setEnableSpeakerDiarization] = useState(false);
  const [addPunctuation, setAddPunctuation] = useState(true);
  const { transcribeAudio } = useSpeechServices();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    try {
      await transcribeAudio.mutateAsync({
        file,
        language,
        options: {
          enableSpeakerDiarization,
          addPunctuation,
        },
      });
      onClose();
    } catch (error) {
      console.error("Transcription error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transcribe Audio</DialogTitle>
          <DialogDescription>
            Upload an audio file to transcribe it to text.
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

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
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

          <div className="space-y-2">
            <Label>Advanced Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="speaker-diarization"
                  checked={enableSpeakerDiarization}
                  onCheckedChange={(checked) => setEnableSpeakerDiarization(!!checked)}
                />
                <label
                  htmlFor="speaker-diarization"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enable speaker diarization
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="punctuation"
                  checked={addPunctuation}
                  onCheckedChange={(checked) => setAddPunctuation(!!checked)}
                />
                <label
                  htmlFor="punctuation"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Add punctuation
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!file || transcribeAudio.isPending}
          >
            {transcribeAudio.isPending ? "Processing..." : "Start Transcription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TranscribeModal;
