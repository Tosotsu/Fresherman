import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DocumentUpload from '@/components/dashboard/DocumentUpload';
import { FileText } from 'lucide-react';

const Documents = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Show sidebar for larger screens */}
      <div className="hidden md:block">
        <Sidebar 
          isCollapsed={isCollapsed} 
          toggleSidebar={toggleSidebar}
          onMobileClose={closeMobileMenu}
        />
      </div>
      
      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs">
            <Sidebar 
              isCollapsed={false} 
              toggleSidebar={toggleSidebar}
              onMobileClose={closeMobileMenu}
            />
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <div className="relative flex-shrink-0 flex h-16 bg-card border-b border-border/40">
          <button
            type="button"
            className="md:hidden px-4 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
          </button>
          <div className="flex-1 flex justify-between px-4 md:px-6">
            <div className="flex-1 flex items-center">
              <h1 className="text-xl font-semibold flex items-center">
                <FileText className="h-6 w-6 mr-2 text-primary" />
                Document Storage
              </h1>
            </div>
          </div>
        </div>
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6">
          <DocumentUpload />
        </main>
      </div>
    </div>
  );
};

export default Documents; 