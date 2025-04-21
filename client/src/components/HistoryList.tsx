import { useSpeechServices } from "@/hooks/use-speech-services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { FileText, Languages, Mic } from "lucide-react";

export function HistoryList() {
  const { getAudioFiles, getTranscriptions, getTranslations } = useSpeechServices();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Audio Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Audio Files
          </CardTitle>
          <CardDescription>Your recorded audio files</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {getAudioFiles.data?.map((file) => (
              <div key={file.id} className="p-2 border-b">
                <div className="font-medium">{file.name}</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(file.createdAt), "MMM d, yyyy HH:mm")}
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Transcriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transcriptions
          </CardTitle>
          <CardDescription>Your transcribed audio files</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {getTranscriptions.data?.map((transcription) => (
              <div key={transcription.id} className="p-2 border-b">
                <div className="font-medium">Audio ID: {transcription.audioId}</div>
                <div className="text-sm text-muted-foreground">
                  {transcription.language} • {format(new Date(transcription.createdAt), "MMM d, yyyy HH:mm")}
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Translations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Translations
          </CardTitle>
          <CardDescription>Your translated texts</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {getTranslations.data?.map((translation) => (
              <div key={translation.id} className="p-2 border-b">
                <div className="font-medium">
                  {translation.sourceLanguage} → {translation.targetLanguage}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(translation.createdAt), "MMM d, yyyy HH:mm")}
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
} 