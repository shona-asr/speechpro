import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/layout/Dashboard";
import StatCard from "@/components/ui/stat-card";
import { HistoryList } from "@/components/HistoryList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSpeechServices } from "@/hooks/use-speech-services";
import { Mic, Languages, Loader2 } from "lucide-react";

const Dashboard = () => {
  const [, navigate] = useLocation();
  const { getUserStats } = useSpeechServices();
  const { data: stats, isLoading: isLoadingStats } = getUserStats;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your audio files, transcriptions, and translations.
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button onClick={() => navigate("/transcribe")}>
              <Mic className="mr-2 h-4 w-4" /> Transcribe
            </Button>
            <Button onClick={() => navigate("/translate")}>
              <Languages className="mr-2 h-4 w-4" /> Translate
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Start a new transcription or translation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24"
                onClick={() => navigate("/transcribe")}
              >
                <div className="flex flex-col items-center gap-2">
                  <Mic className="h-6 w-6" />
                  <span>Transcribe Audio</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-24"
                onClick={() => navigate("/translate")}
              >
                <div className="flex flex-col items-center gap-2">
                  <Languages className="h-6 w-6" />
                  <span>Translate Text</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoadingStats ? (
            <div className="col-span-3 flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <StatCard
                title="Minutes Transcribed"
                value={stats?.minutesTranscribed || 0}
                icon={<Mic className="w-6 h-6" />}
              />
              <StatCard
                title="Active Projects"
                value={stats?.activeProjects || 0}
                icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path>
                </svg>}
              />
              <StatCard
                title="Usage This Month"
                value={`$${((stats?.usageCost || 0) / 100).toFixed(2)}`}
                icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"></path>
                </svg>}
              />
            </>
          )}
        </div>

        <HistoryList />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
