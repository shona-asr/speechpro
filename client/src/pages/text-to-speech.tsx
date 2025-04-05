import { useState } from "react";
import DashboardLayout from "@/components/layout/Dashboard";
import TextToSpeechModal from "@/components/modals/TextToSpeechModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, Info, File } from "lucide-react";

const TextToSpeech = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Text to Speech</h1>
            <p className="text-muted-foreground">
              Convert text to natural-sounding speech in multiple languages and voices.
            </p>
          </div>
          <Button 
            className="mt-4 md:mt-0"
            onClick={() => setIsModalOpen(true)}
          >
            <Volume2 className="mr-2 h-4 w-4" /> New Text to Speech
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Speech Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0:00</div>
              <p className="text-xs text-muted-foreground">
                Total duration
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Files Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Total audio files
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Words Converted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Across all files
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Text to Speech</CardTitle>
            <CardDescription>
              Your most recent text to speech conversions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <File className="h-12 w-12 text-gray-300" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">No text to speech conversions yet</p>
                <p className="text-sm text-muted-foreground">
                  Convert text to speech to see your history here.
                </p>
              </div>
              <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                <Volume2 className="mr-2 h-4 w-4" /> New Conversion
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voice Types</CardTitle>
            <CardDescription>
              Choose from a variety of natural-sounding voices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="font-medium">Standard Voices</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Clear and consistent synthesized voices, ideal for most applications.
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="font-medium">WaveNet Voices</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Deep neural network voices with human-like intonation and clarity.
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="font-medium">Neural2 Voices</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Most natural-sounding voices with advanced prosody and pronunciation.
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="font-medium">Studio Voices</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Premium voices recorded in a professional studio with a focus on quality.
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center">
            <Info className="h-4 w-4 mr-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Output formats: MP3, WAV, OGG, FLAC
            </p>
          </CardFooter>
        </Card>
      </div>

      <TextToSpeechModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </DashboardLayout>
  );
};

export default TextToSpeech;
