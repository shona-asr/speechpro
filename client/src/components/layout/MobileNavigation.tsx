import { useState } from "react";
import { useLocation, Link } from "wouter";
import { LayoutDashboard, Mic, Languages, AudioWaveform, MoreHorizontal, Volume2, Link2, Settings, UserCircle, X } from "lucide-react";

const MobileNavigation = () => {
  const [location] = useLocation();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location === path;
  };

  const toggleMoreMenu = () => {
    setMoreMenuOpen(!moreMenuOpen);
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
        
        <Link href="/realtime-mode">
          <a className="flex flex-col items-center justify-center text-gray-500">
            <AudioWaveform className={`text-lg ${isActive("/realtime-mode") ? "text-primary-600" : ""}`} />
            <span className={`text-xs mt-1 ${isActive("/realtime-mode") ? "text-primary-600" : ""}`}>Realtime</span>
          </a>
        </Link>
        
        <button 
          className="flex flex-col items-center justify-center text-gray-500 w-full bg-transparent border-none"
          onClick={toggleMoreMenu}
        >
          <MoreHorizontal className={`text-lg ${moreMenuOpen ? "text-primary-600" : ""}`} />
          <span className={`text-xs mt-1 ${moreMenuOpen ? "text-primary-600" : ""}`}>More</span>
        </button>
      </div>
      
      {/* Dropdown menu - fixed positioned at bottom of screen */}
      {moreMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-20"
            onClick={() => setMoreMenuOpen(false)}
          />
          
          {/* Menu */}
          <div className="fixed bottom-16 inset-x-0 bg-white rounded-t-xl shadow-lg py-4 z-30 animate-slide-up">
            <div className="flex justify-between items-center px-4 pb-2 border-b">
              <h3 className="font-medium">More Options</h3>
              <button 
                onClick={() => setMoreMenuOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="px-2 py-3">
              <Link href="/text-to-speech">
                <a className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMoreMenuOpen(false)}>
                  <Volume2 className="h-5 w-5 mr-3 text-primary-600" />
                  <span>Text to Speech</span>
                </a>
              </Link>
              <Link href="/speech-to-speech">
                <a className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMoreMenuOpen(false)}>
                  <Link2 className="h-5 w-5 mr-3 text-primary-600" />
                  <span>Speech to Speech</span>
                </a>
              </Link>
              <Link href="/settings">
                <a className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMoreMenuOpen(false)}>
                  <Settings className="h-5 w-5 mr-3 text-primary-600" />
                  <span>Settings</span>
                </a>
              </Link>
              <Link href="/profile">
                <a className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMoreMenuOpen(false)}>
                  <UserCircle className="h-5 w-5 mr-3 text-primary-600" />
                  <span>Profile</span>
                </a>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileNavigation;
