import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { 
  Mic, 
  Languages, 
  PlayCircle, 
  Link2,
  Volume2, 
  LogOut,
  LayoutDashboard,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [location] = useLocation();
  const { logout } = useAuth();

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="sidebar-icon" />,
    },
    {
      name: "Transcribe",
      path: "/transcribe",
      icon: <Mic className="sidebar-icon" />,
    },
    {
      name: "Translate",
      path: "/translate",
      icon: <Languages className="sidebar-icon" />,
    },
    {
      name: "Realtime Mode",
      path: "/realtime-mode",
      icon: <PlayCircle className="sidebar-icon" />,
    },
    {
      name: "Text to Speech",
      path: "/text-to-speech",
      icon: <Volume2 className="sidebar-icon" />,
    },
    {
      name: "Speech to Speech",
      path: "/speech-to-speech",
      icon: <Link2 className="sidebar-icon" />,
    },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
      <div className="flex flex-col h-full">
        {/* Logo and brand */}
        <div className="flex items-center justify-between px-6 py-4 h-16 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Mic className="w-7 h-7 text-primary" />
            <span className="text-xl font-semibold text-primary">Speech AI</span>
          </Link>
          <button 
            onClick={onClose} 
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`sidebar-item ${
                location === item.path ? "active" : ""
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => logout()}
            className="sidebar-item w-full flex items-center"
          >
            <LogOut className="sidebar-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
