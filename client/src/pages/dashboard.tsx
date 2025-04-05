import { useState } from "react";
import { Link } from "wouter";
import DashboardLayout from "@/components/layout/Dashboard";
import StatCard from "@/components/ui/stat-card";
import ActionCard from "@/components/ui/action-card";
import ActivityItem from "@/components/ui/activity-item";
import TranscribeModal from "@/components/modals/TranscribeModal";
import TranslateModal from "@/components/modals/TranslateModal";
import TextToSpeechModal from "@/components/modals/TextToSpeechModal";
import RealtimeModeModal from "@/components/modals/RealtimeModal";
import SpeechToSpeechModal from "@/components/modals/SpeechToSpeechModal";
import { useSpeechServices } from "@/hooks/use-speech-services";
import { 
  Mic, 
  Languages, 
  PlayCircle, 
  Link2, 
  Volume2, 
  Loader2 
} from "lucide-react";

const Dashboard = () => {
  const [modalState, setModalState] = useState({
    transcribe: false,
    translate: false,
    textToSpeech: false,
    realtime: false,
    speechToSpeech: false,
  });
  const { getUserStats, getRecentActivities } = useSpeechServices();

  const { data: stats, isLoading: isLoadingStats } = getUserStats;
  const { data: activities, isLoading: isLoadingActivities } = getRecentActivities;

  const toggleModal = (modal: keyof typeof modalState) => {
    setModalState(prev => ({
      ...prev,
      [modal]: !prev[modal],
    }));
  };

  return (
    <DashboardLayout>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            title="Transcribe Audio"
            description="Convert speech to text"
            icon={<Mic className="w-6 h-6" />}
            link="#"
          />
          <ActionCard
            title="Translate Audio"
            description="Translate speech to other languages"
            icon={<Languages className="w-6 h-6" />}
            link="#"
          />
          <ActionCard
            title="Realtime Mode"
            description="Process audio in real-time"
            icon={<PlayCircle className="w-6 h-6" />}
            link="#"
          />
          <ActionCard
            title="Text to Speech"
            description="Convert text to natural speech"
            icon={<Volume2 className="w-6 h-6" />}
            link="#"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">Recent Activity</h2>
          <Link href="#" className="text-primary text-sm font-medium hover:underline">
            View all
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoadingActivities ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : activities && activities.length > 0 ? (
            activities.map((activity) => (
              <ActivityItem
                key={activity.id}
                title={activity.title}
                description={activity.description}
                icon={
                  activity.type === "transcription" ? (
                    <Mic className="w-5 h-5" />
                  ) : activity.type === "translation" ? (
                    <Languages className="w-5 h-5" />
                  ) : activity.type === "textToSpeech" ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <Link2 className="w-5 h-5" />
                  )
                }
                timestamp={new Date(activity.timestamp)}
              />
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No recent activities. Start using the speech services to see your activities here.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TranscribeModal
        isOpen={modalState.transcribe}
        onClose={() => toggleModal("transcribe")}
      />
      <TranslateModal
        isOpen={modalState.translate}
        onClose={() => toggleModal("translate")}
      />
      <TextToSpeechModal
        isOpen={modalState.textToSpeech}
        onClose={() => toggleModal("textToSpeech")}
      />
      <RealtimeModeModal
        isOpen={modalState.realtime}
        onClose={() => toggleModal("realtime")}
      />
      <SpeechToSpeechModal
        isOpen={modalState.speechToSpeech}
        onClose={() => toggleModal("speechToSpeech")}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
