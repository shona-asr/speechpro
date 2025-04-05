import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff } from "lucide-react";

interface RealtimeModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RealtimeModeModal = ({ isOpen, onClose }: RealtimeModeModalProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [transcription, setTranscription] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Initialize WebSocket connection when modal opens
      const socket = new WebSocket(`wss://${window.location.host}/api/realtime`);
      
      socket.onopen = () => {
        console.log("WebSocket connection established");
      };
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.transcription) {
          setTranscription(prev => prev + " " + data.transcription);
        }
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
      
      socketRef.current = socket;
      
      return () => {
        // Close WebSocket connection when modal closes
        if (socketRef.current) {
          socketRef.current.close();
        }
      };
    }
  }, [isOpen]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            audio: event.data,
            language
          }));
        }
      };
      
      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Realtime Speech Recognition</DialogTitle>
          <DialogDescription>
            Start speaking and see your speech transcribed in real-time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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

          <div className="flex justify-center my-6">
            <Button
              size="lg"
              className={`rounded-full p-6 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <MicOff className="h-10 w-10" />
              ) : (
                <Mic className="h-10 w-10" />
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Transcription</Label>
            <div className="p-4 border rounded-md bg-gray-50 min-h-[120px] max-h-[200px] overflow-y-auto">
              {transcription || "Start speaking to see transcription..."}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RealtimeModeModal;
