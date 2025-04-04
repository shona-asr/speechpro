import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Transcribe from "@/pages/Transcribe";
import Translate from "@/pages/Translate";
import TextToSpeech from "@/pages/TextToSpeech";
import SpeechToSpeech from "@/pages/SpeechToSpeech";
import RealtimeMode from "@/pages/RealtimeMode";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import Layout from "@/components/layout/Layout";
import { useAuth } from "./context/AuthContext";

function Router() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="*">
          <LoginPage />
        </Route>
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/transcribe" component={Transcribe} />
        <Route path="/translate" component={Translate} />
        <Route path="/text-to-speech" component={TextToSpeech} />
        <Route path="/speech-to-speech" component={SpeechToSpeech} />
        <Route path="/realtime" component={RealtimeMode} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
