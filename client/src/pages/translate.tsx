import { useState } from "react";
import DashboardLayout from "@/components/layout/Dashboard";
import TranslateModal from "@/components/modals/TranslateModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Languages, Clock, RefreshCw, File } from "lucide-react";
import { useSpeechServices } from "@/hooks/use-speech-services";

const Translate = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getUserStats } = useSpeechServices();
  const { data: stats } = getUserStats;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Translate</h1>
            <p className="text-muted-foreground">
              Translate text between multiple languages with advanced neural translation.
            </p>
          </div>
          <Button 
            className="mt-4 md:mt-0"
            onClick={() => setIsModalOpen(true)}
          >
            <Languages className="mr-2 h-4 w-4" /> New Translation
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Words Translated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.wordsTranslated || 0}</div>
              <p className="text-xs text-muted-foreground">
                +0% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Languages Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Most common: English → Shona
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Average Words</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Per translation
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Translations</CardTitle>
            <CardDescription>
              Your most recent translation activities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <File className="h-12 w-12 text-gray-300" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">No translations yet</p>
                <p className="text-sm text-muted-foreground">
                  Start translating text between languages.
                </p>
              </div>
              <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                <Languages className="mr-2 h-4 w-4" /> New Translation
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supported Languages</CardTitle>
            <CardDescription>
              Our translation service supports over 100 languages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4">
                <div className="font-medium">European</div>
                <div className="text-sm text-muted-foreground mt-1">
                  English, Spanish, French, German, Italian, Portuguese, Russian
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="font-medium">Asian</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Chinese, Japanese, Korean, Vietnamese, Thai
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="font-medium">Middle Eastern</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Arabic, Hebrew, Persian, Turkish
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="font-medium">Other</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Hindi, Bengali, Indonesian, Swahili, and many more
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Max text length: 5,000 characters</p>
            <RefreshCw className="h-4 w-4 mx-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Neural translation for superior quality</p>
          </CardFooter>
        </Card>
      </div>

      <TranslateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </DashboardLayout>
  );
};

export default Translate;
