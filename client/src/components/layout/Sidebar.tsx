import { Link } from "wouter";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Mic, 
  Languages, 
  AudioWaveform, 
  Volume2, 
  Link2, 
  Settings, 
  UserCircle, 
  LogOut,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-3 text-gray-500" /> },
  { name: "Transcribe", path: "/transcribe", icon: <Mic className="w-5 h-5 mr-3 text-gray-500" /> },
  { name: "Translate", path: "/translate", icon: <Languages className="w-5 h-5 mr-3 text-gray-500" /> },
  { name: "Realtime Mode", path: "/realtime-mode", icon: <AudioWaveform className="w-5 h-5 mr-3 text-gray-500" /> },
  { name: "Text to Speech", path: "/text-to-speech", icon: <Volume2 className="w-5 h-5 mr-3 text-gray-500" /> },
  { name: "Speech to Speech", path: "/speech-to-speech", icon: <Link2 className="w-5 h-5 mr-3 text-gray-500" /> },
  { name: "Settings", path: "/settings", icon: <Settings className="w-5 h-5 mr-3 text-gray-500" /> },
  { name: "Profile", path: "/profile", icon: <UserCircle className="w-5 h-5 mr-3 text-gray-500" /> },
];

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and brand */}
          <div className="flex items-center justify-between px-6 py-4 h-16 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Mic className="w-7 h-7 text-primary-600" />
              <span className="text-xl font-semibold text-primary-600">Speech AI</span>
            </Link>
            <button 
              onClick={onClose} 
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={onClose}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location === item.path
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3 text-gray-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
