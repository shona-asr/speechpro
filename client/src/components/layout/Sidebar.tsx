import { useLocation, Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import {
  Mic, 
  Languages, 
  AudioWaveform, 
  Volume2, 
  MessageSquare, 
  LayoutDashboard, 
  LogOut
} from "lucide-react";

const Sidebar = () => {
  const [location] = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <aside className="w-56 border-r border-gray-200 bg-white hidden md:block overflow-y-auto">
      <nav className="mt-5 px-2">
        <Link href="/dashboard">
          <a className={isActive("/dashboard") ? "nav-item-active" : "nav-item group"}>
            <LayoutDashboard className={isActive("/dashboard") ? "nav-icon-active" : "nav-icon"} />
            Dashboard
          </a>
        </Link>
        
        <Link href="/transcribe">
          <a className={isActive("/transcribe") ? "nav-item-active" : "nav-item group"}>
            <Mic className={isActive("/transcribe") ? "nav-icon-active" : "nav-icon"} />
            Transcribe
          </a>
        </Link>
        
        <Link href="/translate">
          <a className={isActive("/translate") ? "nav-item-active" : "nav-item group"}>
            <Languages className={isActive("/translate") ? "nav-icon-active" : "nav-icon"} />
            Translate
          </a>
        </Link>
        
        <Link href="/realtime">
          <a className={isActive("/realtime") ? "nav-item-active" : "nav-item group"}>
            <AudioWaveform className={isActive("/realtime") ? "nav-icon-active" : "nav-icon"} />
            Realtime Mode
          </a>
        </Link>
        
        <Link href="/text-to-speech">
          <a className={isActive("/text-to-speech") ? "nav-item-active" : "nav-item group"}>
            <Volume2 className={isActive("/text-to-speech") ? "nav-icon-active" : "nav-icon"} />
            Text to Speech
          </a>
        </Link>
        
        <Link href="/speech-to-speech">
          <a className={isActive("/speech-to-speech") ? "nav-item-active" : "nav-item group"}>
            <MessageSquare className={isActive("/speech-to-speech") ? "nav-icon-active" : "nav-icon"} />
            Speech to Speech
          </a>
        </Link>
        
        <div className="border-t border-gray-200 mt-6 pt-4">
          <button 
            onClick={handleLogout}
            className="nav-item group w-full text-left"
          >
            <LogOut className="nav-icon" />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
