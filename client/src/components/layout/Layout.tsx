import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default Layout;
