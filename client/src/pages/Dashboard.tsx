import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Mic, 
  Languages, 
  AudioWaveform, 
  Volume2, 
  Clock, 
  ChartBar,
  DollarSign,
  ArrowRight,
  Clock3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Stats {
  minutesTranscribed: number;
  charactersTranslated: number;
  textToSpeechRequests: number;
  realtimeModeMinutes: number;
}

interface Activity {
  id: number;
  type: string;
  createdAt: string;
  fileName?: string;
  text?: string;
  originalText?: string;
  translatedText?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
}

const Dashboard = () => {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load statistics",
        variant: "destructive",
      });
    }
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activity"],
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load recent activities",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Minutes Transcribed */}
        <div className="card-stats">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <Clock className="text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Minutes Transcribed</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">
                      {statsLoading ? "Loading..." : stats?.minutesTranscribed || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {/* Active Projects */}
        <div className="card-stats">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <ChartBar className="text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">
                      {activitiesLoading ? "Loading..." : activities?.length || 0}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {/* Usage This Month */}
        <div className="card-stats">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <DollarSign className="text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Usage This Month</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">$0.00</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions Section */}
      <section className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Transcribe Audio */}
          <div className="card-action">
            <div className="p-5 text-center">
              <div className="flex justify-center mb-4">
                <div className="icon-container">
                  <Mic className="icon-primary" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Transcribe Audio</h3>
              <p className="text-sm text-gray-500 mb-4">Convert speech to text</p>
              <Link href="/transcribe">
                <a className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700">
                  Start Now
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Link>
            </div>
          </div>
          
          {/* Translate Audio */}
          <div className="card-action">
            <div className="p-5 text-center">
              <div className="flex justify-center mb-4">
                <div className="icon-container">
                  <Languages className="icon-primary" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Translate Audio</h3>
              <p className="text-sm text-gray-500 mb-4">Translate speech to other languages</p>
              <Link href="/translate">
                <a className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700">
                  Start Now
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Link>
            </div>
          </div>
          
          {/* Realtime Mode */}
          <div className="card-action">
            <div className="p-5 text-center">
              <div className="flex justify-center mb-4">
                <div className="icon-container">
                  <AudioWaveform className="icon-primary" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Realtime Mode</h3>
              <p className="text-sm text-gray-500 mb-4">Process audio in real-time</p>
              <Link href="/realtime">
                <a className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700">
                  Start Now
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Link>
            </div>
          </div>
          
          {/* Text to Speech */}
          <div className="card-action">
            <div className="p-5 text-center">
              <div className="flex justify-center mb-4">
                <div className="icon-container">
                  <Volume2 className="icon-primary" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Text to Speech</h3>
              <p className="text-sm text-gray-500 mb-4">Convert text to natural speech</p>
              <Link href="/text-to-speech">
                <a className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700">
                  Start Now
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Recent Activity Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <Link href="/activity">
            <a className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View all
            </a>
          </Link>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {activitiesLoading ? (
              <li className="p-4">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </li>
            ) : activities && activities.length > 0 ? (
              activities.map((activity) => (
                <li key={`${activity.type}-${activity.id}`} className="p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      {activity.type === 'transcription' && (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Mic className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                      {activity.type === 'translation' && (
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Languages className="h-5 w-5 text-green-600" />
                        </div>
                      )}
                      {activity.type === 'text-to-speech' && (
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Volume2 className="h-5 w-5 text-purple-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {activity.type === 'transcription' && 'Audio Transcription'}
                        {activity.type === 'translation' && 'Text Translation'}
                        {activity.type === 'text-to-speech' && 'Text to Speech'}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.type === 'transcription' && activity.fileName}
                        {activity.type === 'translation' && 
                          `${activity.sourceLanguage} → ${activity.targetLanguage}`}
                        {activity.type === 'text-to-speech' && 
                          activity.text?.substring(0, 30) + (activity.text?.length > 30 ? '...' : '')}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock3 className="h-3 w-3 mr-1" />
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Clock3 className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No recent activity to display</p>
                  <p className="text-sm text-gray-400 mt-1">Your recent activities will appear here</p>
                </div>
              </li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
