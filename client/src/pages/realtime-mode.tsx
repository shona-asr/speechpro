import { useState } from "react";
import DashboardLayout from "@/components/layout/Dashboard";
import RealtimeModeModal from "@/components/modals/RealtimeModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, Mic, MicOff, BookOpen } from "lucide-react";

const RealtimeMode = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Realtime Mode</h1>
            <p className="text-muted-foreground">
              Process and transcribe audio in real-time with low latency.
            </p>
          </div>
          <Button 
            className="mt-4 md:mt-0"
            onClick={() => setIsModalOpen(true)}
          >
            <PlayCircle className="mr-2 h-4 w-4" /> Start Realtime Mode
          </Button>
        </div>

        <Card className="bg-primary-50 border-primary-100">
          <CardHeader>
            <CardTitle className="text-primary-900">How It Works</CardTitle>
            <CardDescription className="text-primary-800">
              Realtime mode provides instant speech recognition as you speak.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-primary-100 text-primary-500 p-3 rounded-full mb-4">
                  <Mic className="h-6 w-6" />
                </div>
                <h3 className="font-medium mb-2">Speak into your microphone</h3>
                <p className="text-sm text-muted-foreground">
                  The app processes your voice in small chunks as you speak.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-primary-100 text-primary-500 p-3 rounded-full mb-4">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 11l4 4L20 4" />
                  </svg>
                </div>
                <h3 className="font-medium mb-2">Instant processing</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI transcribes your speech with minimal delay.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="bg-primary-100 text-primary-500 p-3 rounded-full mb-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="font-medium mb-2">See results immediately</h3>
                <p className="text-sm text-muted-foreground">
                  Text appears on screen as you speak, ready to be saved or edited.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-primary-100 bg-primary-50/50">
            <Button variant="outline" className="w-full" onClick={() => setIsModalOpen(true)}>
              Begin Realtime Session
            </Button>
          </CardFooter>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Use Cases</CardTitle>
              <CardDescription>
                Popular applications for realtime speech recognition.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-primary-100 text-primary mr-3">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 19V5h16l.001 14H4z"></path>
                    <path d="M6 7h12v2H6zm0 4h12v2H6zm0 4h6v2H6z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Live Captioning</h3>
                  <p className="text-sm text-muted-foreground">
                    Provide real-time captions for meetings, presentations, or videos.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-primary-100 text-primary mr-3">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
                    <path d="M13 7h-2v5.414l3.293 3.293 1.414-1.414L13 11.586z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Note Taking</h3>
                  <p className="text-sm text-muted-foreground">
                    Capture your thoughts or meeting notes without typing.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-primary-100 text-primary mr-3">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Accessibility</h3>
                  <p className="text-sm text-muted-foreground">
                    Assist those with hearing impairments by providing text versions of spoken content.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Realtime Settings</CardTitle>
              <CardDescription>
                Configure your realtime transcription experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-3">
                  <div className="font-medium mb-1">Languages</div>
                  <div className="text-sm text-muted-foreground">
                    Supports 35+ languages for realtime transcription.
                  </div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="font-medium mb-1">Audio Quality</div>
                  <div className="text-sm text-muted-foreground">
                    Adjust microphone sensitivity and noise cancellation.
                  </div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="font-medium mb-1">Accuracy Mode</div>
                  <div className="text-sm text-muted-foreground">
                    Choose between speed and accuracy for best results.
                  </div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="font-medium mb-1">Auto-punctuation</div>
                  <div className="text-sm text-muted-foreground">
                    Enable automatic punctuation in transcribed text.
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => setIsModalOpen(true)}>
                <MicOff className="mr-2 h-4 w-4" /> Start Listening
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <RealtimeModeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </DashboardLayout>
  );
};

export default RealtimeMode;
