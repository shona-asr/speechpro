import { useLocation, Link } from "wouter";
import { LayoutDashboard, Mic, Languages, AudioWaveform, MoreHorizontal } from "lucide-react";

const MobileNavigation = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 w-full z-10">
      <div className="grid grid-cols-5 py-2">
        <Link href="/dashboard">
          <a className="flex flex-col items-center justify-center text-gray-500">
            <LayoutDashboard className={`text-lg ${isActive("/dashboard") ? "text-primary-600" : ""}`} />
            <span className={`text-xs mt-1 ${isActive("/dashboard") ? "text-primary-600" : ""}`}>Dashboard</span>
          </a>
        </Link>
        
        <Link href="/transcribe">
          <a className="flex flex-col items-center justify-center text-gray-500">
            <Mic className={`text-lg ${isActive("/transcribe") ? "text-primary-600" : ""}`} />
            <span className={`text-xs mt-1 ${isActive("/transcribe") ? "text-primary-600" : ""}`}>Transcribe</span>
          </a>
        </Link>
        
        <Link href="/translate">
          <a className="flex flex-col items-center justify-center text-gray-500">
            <Languages className={`text-lg ${isActive("/translate") ? "text-primary-600" : ""}`} />
            <span className={`text-xs mt-1 ${isActive("/translate") ? "text-primary-600" : ""}`}>Translate</span>
          </a>
        </Link>
        
        <Link href="/realtime">
          <a className="flex flex-col items-center justify-center text-gray-500">
            <AudioWaveform className={`text-lg ${isActive("/realtime") ? "text-primary-600" : ""}`} />
            <span className={`text-xs mt-1 ${isActive("/realtime") ? "text-primary-600" : ""}`}>Realtime</span>
          </a>
        </Link>
        
        <div className="flex flex-col items-center justify-center text-gray-500 relative group">
          <MoreHorizontal className="text-lg" />
          <span className="text-xs mt-1">More</span>
          
          {/* Dropdown menu */}
          <div className="absolute bottom-full mb-2 right-0 bg-white rounded-md shadow-lg py-2 w-40 hidden group-hover:block">
            <Link href="/text-to-speech">
              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Text to Speech
              </a>
            </Link>
            <Link href="/speech-to-speech">
              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Speech to Speech
              </a>
            </Link>
            <Link href="/settings">
              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Settings
              </a>
            </Link>
            <Link href="/profile">
              <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Profile
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
