import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Transcribe from "@/pages/transcribe";
import Translate from "@/pages/translate";
import TextToSpeech from "@/pages/text-to-speech";
import RealtimeMode from "@/pages/realtime-mode";
import SpeechToSpeech from "@/pages/speech-to-speech";
import Profile from "@/pages/profile";
import LandingPage from "@/pages/landing";
import AboutPage from "@/pages/about";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/about" component={AboutPage} />
      <Route path="/dashboard">
        {() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/transcribe">
        {() => (
          <ProtectedRoute>
            <Transcribe />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/translate">
        {() => (
          <ProtectedRoute>
            <Translate />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/text-to-speech">
        {() => (
          <ProtectedRoute>
            <TextToSpeech />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/realtime-mode">
        {() => (
          <ProtectedRoute>
            <RealtimeMode />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/speech-to-speech">
        {() => (
          <ProtectedRoute>
            <SpeechToSpeech />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/profile">
        {() => (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
