import { useState } from "react";
import DashboardLayout from "@/components/layout/Dashboard";
import SpeechToSpeechModal from "@/components/modals/SpeechToSpeechModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Upload, File, Clock } from "lucide-react";

const SpeechToSpeech = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Speech to Speech</h1>
            <p className="text-muted-foreground">
              Translate spoken content from one language to another while preserving voice characteristics.
            </p>
          </div>
          <Button 
            className="mt-4 md:mt-0"
            onClick={() => setIsModalOpen(true)}
          >
            <Link2 className="mr-2 h-4 w-4" /> New Speech Translation
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Translations Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Total speech translations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Minutes Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0:00</div>
              <p className="text-xs text-muted-foreground">
                Total audio duration
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Popular Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                No data yet
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Speech Translations</CardTitle>
            <CardDescription>
              Your most recent speech-to-speech translations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <File className="h-12 w-12 text-gray-300" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">No speech translations yet</p>
                <p className="text-sm text-muted-foreground">
                  Upload an audio file to translate speech between languages.
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
            <CardTitle>How Speech-to-Speech Works</CardTitle>
            <CardDescription>
              Our advanced AI converts speech from one language to another in three steps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary mx-auto mb-3 flex items-center justify-center">
                  <span className="font-bold">1</span>
                </div>
                <div className="font-medium mb-2">Speech Recognition</div>
                <p className="text-sm text-muted-foreground">
                  Your audio is transcribed to text in the source language.
                </p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary mx-auto mb-3 flex items-center justify-center">
                  <span className="font-bold">2</span>
                </div>
                <div className="font-medium mb-2">Neural Translation</div>
                <p className="text-sm text-muted-foreground">
                  The text is accurately translated to the target language.
                </p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary mx-auto mb-3 flex items-center justify-center">
                  <span className="font-bold">3</span>
                </div>
                <div className="font-medium mb-2">Speech Synthesis</div>
                <p className="text-sm text-muted-foreground">
                  The translated text is converted to natural-sounding speech.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Processing time depends on audio length and complexity</p>
          </CardFooter>
        </Card>
      </div>

      <SpeechToSpeechModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </DashboardLayout>
  );
};

export default SpeechToSpeech;
