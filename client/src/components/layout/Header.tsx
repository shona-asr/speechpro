import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "wouter";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  const getPageTitle = () => {
    const path = location.split("/")[1];
    if (!path) return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button - only shows on mobile */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Page title */}
          <h1 className="text-lg font-semibold text-gray-800 truncate max-w-[180px] sm:max-w-none">
            {getPageTitle()}
          </h1>
        </div>

        {/* User dropdown - only shows when logged in */}
        {user && (
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center space-x-1 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label="User menu"
                >
                  <span className="hidden sm:inline text-sm font-medium text-gray-700 px-2">
                    {user.email}
                  </span>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 mt-1 shadow-lg rounded-md border border-gray-200"
              >
                <DropdownMenuItem asChild>
                  <Link 
                    href="/profile" 
                    className="w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    href="/settings" 
                    className="w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem 
                  onClick={() => logout()} 
                  className="w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;