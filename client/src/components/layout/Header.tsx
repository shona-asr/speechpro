import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MicOff } from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2.5 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="text-primary-600">
              <MicOff className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              <span className="text-primary-600">Speech</span> AI
            </h1>
          </div>
        </Link>
        
        {/* Navigation - Desktop */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/">
            <a className="px-1 py-2 text-gray-700 font-medium hover:text-primary-600 transition-colors">
              Home
            </a>
          </Link>
          <Link href="/about">
            <a className="px-1 py-2 text-gray-700 font-medium hover:text-primary-600 transition-colors">
              About
            </a>
          </Link>
          <Link href="/features">
            <a className="px-1 py-2 text-gray-700 font-medium hover:text-primary-600 transition-colors">
              Features
            </a>
          </Link>
          <Link href="/pricing">
            <a className="px-1 py-2 text-gray-700 font-medium hover:text-primary-600 transition-colors">
              Pricing
            </a>
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">{user.email}</span>
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || "User"} 
                        className="rounded-full w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-sm font-medium">
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link href="/dashboard">
                    <DropdownMenuItem className="cursor-pointer">
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem className="cursor-pointer">
                      Settings
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-gray-700">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary-600 text-white hover:bg-primary-700">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
