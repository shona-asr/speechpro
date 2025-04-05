import { useState } from "react";
import DashboardLayout from "@/components/layout/Dashboard";
import TranscribeModal from "@/components/modals/TranscribeModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Upload, File, Clock, RefreshCw } from "lucide-react";
import { useSpeechServices } from "@/hooks/use-speech-services";

const Transcribe = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getUserStats } = useSpeechServices();
  const { data: stats } = getUserStats;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transcribe Audio</h1>
            <p className="text-muted-foreground">
              Convert speech to text with high accuracy for various languages.
            </p>
          </div>
          <Button 
            className="mt-4 md:mt-0"
            onClick={() => setIsModalOpen(true)}
          >
            <Mic className="mr-2 h-4 w-4" /> New Transcription
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Minutes Transcribed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.minutesTranscribed || 0}</div>
              <p className="text-xs text-muted-foreground">
                +0% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Files Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                +0% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0:00</div>
              <p className="text-xs text-muted-foreground">
                Per audio file
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transcriptions</CardTitle>
            <CardDescription>
              Your most recent audio transcription activities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <File className="h-12 w-12 text-gray-300" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">No transcriptions yet</p>
                <p className="text-sm text-muted-foreground">
                  Upload an audio file to start transcribing.
                </p>
              </div>
              <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                <Upload className="mr-2 h-4 w-4" /> Upload Audio
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supported Audio Formats</CardTitle>
            <CardDescription>
              Our transcription service supports the following audio formats.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center border rounded-lg p-4">
                <div className="font-medium">.mp3</div>
                <div className="text-sm text-muted-foreground">MPEG Audio Layer III</div>
              </div>
              <div className="flex flex-col items-center border rounded-lg p-4">
                <div className="font-medium">.wav</div>
                <div className="text-sm text-muted-foreground">Waveform Audio Format</div>
              </div>
              <div className="flex flex-col items-center border rounded-lg p-4">
                <div className="font-medium">.flac</div>
                <div className="text-sm text-muted-foreground">Free Lossless Audio Codec</div>
              </div>
              <div className="flex flex-col items-center border rounded-lg p-4">
                <div className="font-medium">.m4a</div>
                <div className="text-sm text-muted-foreground">MPEG-4 Audio</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Maximum file size: 500MB</p>
            <RefreshCw className="h-4 w-4 mx-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Maximum duration: 2 hours</p>
          </CardFooter>
        </Card>
      </div>

      <TranscribeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </DashboardLayout>
  );
};

export default Transcribe;
