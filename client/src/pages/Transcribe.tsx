import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Mic, 
  Play, 
  Upload,
  Copy,
  Download,
  Share2,
  X
} from "lucide-react";

interface TranscriptionResult {
  id: number;
  text: string;
  fileName: string;
  duration: number; // in seconds
}

const Transcribe = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>("en-US");
  const [diarization, setDiarization] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  
  const { 
    isRecording, 
    audioBlob,
    startRecording, 
    stopRecording, 
    recordingTime,
    resetRecording
  } = useAudioRecorder();

  const transcribeMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/transcribe", {
        audioData: formData.get("audioData"),
        language: formData.get("language"),
        fileName: formData.get("fileName"),
        fileSize: formData.get("fileSize"),
        duration: formData.get("duration")
      });
      return response.json();
    },
    onSuccess: (data: TranscriptionResult) => {
      setTranscriptionResult(data);
      toast({
        title: "Transcription complete",
        description: "Your audio has been successfully transcribed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Transcription failed",
        description: error.message || "An error occurred during transcription.",
        variant: "destructive",
      });
    }
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const validTypes = ["audio/mp3", "audio/wav", "audio/flac", "audio/mpeg", "audio/m4a"];
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an MP3, WAV, FLAC, or M4A file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (500MB)
      if (selectedFile.size > 500 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 500MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Validate file type and size
      const validTypes = ["audio/mp3", "audio/wav", "audio/flac", "audio/mpeg", "audio/m4a"];
      if (!validTypes.includes(droppedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an MP3, WAV, FLAC, or M4A file.",
          variant: "destructive",
        });
        return;
      }
      
      if (droppedFile.size > 500 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 500MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(droppedFile);
    }
  };

  const handleStartTranscription = async (e: FormEvent) => {
    e.preventDefault();
    
    let audioData: string | null = null;
    let fileName: string = "recording.wav";
    let fileSize: number = 0;
    let duration: number = 0;
    
    if (file) {
      // Use uploaded file
      fileName = file.name;
      fileSize = file.size;
      
      // Convert file to base64
      const reader = new FileReader();
      audioData = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      // Estimate duration (this is a rough estimate, actual duration would be better)
      const avgBitRate = 128 * 1024; // Assuming 128 kbps
      duration = Math.round(file.size * 8 / avgBitRate);
    } else if (audioBlob) {
      // Use recorded audio
      fileSize = audioBlob.size;
      
      // Convert blob to base64
      const reader = new FileReader();
      audioData = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });
      
      // Use recording time for duration
      duration = Math.round(recordingTime / 1000);
    } else {
      toast({
        title: "No audio",
        description: "Please upload an audio file or record audio first.",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("audioData", audioData as string);
    formData.append("language", language);
    formData.append("fileName", fileName);
    formData.append("fileSize", fileSize.toString());
    formData.append("duration", duration.toString());
    
    transcribeMutation.mutate(formData);
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCopyToClipboard = () => {
    if (transcriptionResult) {
      navigator.clipboard.writeText(transcriptionResult.text);
      toast({
        title: "Copied",
        description: "Transcription text copied to clipboard.",
      });
    }
  };

  const handleDownload = () => {
    if (transcriptionResult) {
      const element = document.createElement("a");
      const file = new Blob([transcriptionResult.text], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${transcriptionResult.fileName.split('.')[0]}_transcript.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleShare = () => {
    if (transcriptionResult && navigator.share) {
      navigator.share({
        title: "Speech AI Transcription",
        text: transcriptionResult.text
      }).catch(err => {
        console.error("Share failed:", err);
      });
    } else {
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support sharing capabilities.",
        variant: "destructive",
      });
    }
  };

  const handleNewTranscription = () => {
    setFile(null);
    resetRecording();
    setTranscriptionResult(null);
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Transcribe Audio</h1>
      
      {!transcriptionResult ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Audio File</h2>
            
            {/* File Upload */}
            <div 
              className={`file-upload-container ${file ? 'border-primary-500 bg-primary-50' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                id="audio-upload" 
                className="hidden" 
                accept="audio/*" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <label htmlFor="audio-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  {file ? (
                    <>
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 mb-3">
                        <Upload className="text-primary-600 h-6 w-6" />
                      </div>
                      <p className="text-gray-700 mb-1">{file.name}</p>
                      <p className="text-sm text-gray-500 mb-3">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove File
                      </Button>
                    </>
                  ) : (
                    <>
                      <Upload className="text-gray-400 h-12 w-12 mb-3" />
                      <p className="text-gray-700 mb-1">Drag and drop your audio file here</p>
                      <p className="text-sm text-gray-500 mb-3">or</p>
                      <Button>
                        Select File
                      </Button>
                      <p className="text-xs text-gray-500 mt-3">Supported formats: MP3, WAV, FLAC, M4A (Max 500MB)</p>
                    </>
                  )}
                </div>
              </label>
            </div>
            
            {/* Recording Option */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">Or Record Audio</h3>
                <div>
                  {isRecording ? (
                    <Button
                      variant="destructive"
                      onClick={stopRecording}
                      className="flex items-center"
                    >
                      <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse mr-2"></span>
                      Stop Recording
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={startRecording}
                      className="flex items-center"
                      disabled={!!file}
                    >
                      <Mic className="mr-2 h-4 w-4" />
                      Start Recording
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Recording Status */}
              {isRecording && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 mr-3">
                      <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse"></div>
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">Recording in progress...</p>
                      <p className="text-sm text-gray-500">
                        {new Date(recordingTime).toISOString().substr(14, 5)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      onClick={resetRecording}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {audioBlob && !isRecording && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 mr-3">
                      <Mic className="text-green-600 h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">Recording complete</p>
                      <p className="text-sm text-gray-500">
                        Duration: {new Date(recordingTime).toISOString().substr(14, 5)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      onClick={resetRecording}
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="mt-2">
                    <audio controls className="w-full">
                      <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              )}
            </div>
            
            {/* Transcription Options */}
            <div className="mt-6">
              <h3 className="text-base font-medium text-gray-900 mb-3">Transcription Options</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Language Selection */}
                <div>
                  <Label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                    Audio Language
                  </Label>
                  <Select 
                    value={language} 
                    onValueChange={setLanguage}
                  >
                    <SelectTrigger id="language" className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="es-ES">Spanish</SelectItem>
                      <SelectItem value="fr-FR">French</SelectItem>
                      <SelectItem value="de-DE">German</SelectItem>
                      <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                      <SelectItem value="ja-JP">Japanese</SelectItem>
                      <SelectItem value="ko-KR">Korean</SelectItem>
                      <SelectItem value="ar-SA">Arabic</SelectItem>
                      <SelectItem value="ru-RU">Russian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Speaker Diarization */}
                <div>
                  <div className="flex items-center mb-1">
                    <Label htmlFor="diarization" className="text-sm font-medium text-gray-700 mr-2">
                      Speaker Diarization
                    </Label>
                    <div className="relative group">
                      <span className="cursor-help text-gray-400">ⓘ</span>
                      <div className="absolute left-0 -top-2 transform -translate-y-full w-48 px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        Automatically identifies and separates different speakers
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="diarization" 
                      checked={diarization}
                      onCheckedChange={(checked) => setDiarization(checked as boolean)}
                    />
                    <Label 
                      htmlFor="diarization" 
                      className="ml-2 text-sm text-gray-500"
                    >
                      Identify multiple speakers
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleStartTranscription}
                disabled={(!file && !audioBlob) || transcribeMutation.isPending}
                className="flex items-center"
              >
                {transcribeMutation.isPending ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {transcribeMutation.isPending ? "Processing..." : "Start Transcription"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Transcription Results</h2>
            
            <div className="bg-gray-50 rounded-md p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    {transcriptionResult.fileName}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatDuration(transcriptionResult.duration)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={handleCopyToClipboard}
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={handleDownload}
                    title="Download as text"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={handleShare}
                    title="Share"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-md p-4 h-64 overflow-y-auto">
                <p className="text-gray-700 whitespace-pre-line">
                  {transcriptionResult.text}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={handleNewTranscription}
              >
                New Transcription
              </Button>
              <Button>
                Translate Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transcribe;
