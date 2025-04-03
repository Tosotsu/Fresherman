import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  User, Briefcase, GraduationCap, Heart, Car, 
  FileText, Settings, LogOut, ChevronLeft, Menu 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  toggleSidebar,
  onMobileClose
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserEmail(data.user.email || '');
        setUserName(data.user.user_metadata?.full_name || 'User');
      }
    };
    
    fetchUserData();
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLinkClick = () => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };
  
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Error signing out');
        console.error(error);
        return;
      }
      
      // Clear user-specific data from local storage
      localStorage.removeItem('user-vehicles');
      localStorage.removeItem('user-maintenance-records');
      localStorage.removeItem('user-medical-records');
      localStorage.removeItem('user-employment-records');
      localStorage.removeItem('user-education-records');
      localStorage.removeItem('user-documents');
      localStorage.removeItem('user-personal-info');
      // Add any other keys specific to your application here
      
      toast.success('Signed out successfully');
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('An error occurred while signing out');
    }
  };
  
  const navigation = [
    { name: 'Personal Information', href: '/dashboard', icon: User },
    { name: 'Education', href: '/dashboard/education', icon: GraduationCap },
    { name: 'Medical', href: '/dashboard/medical', icon: Heart },
    { name: 'Employment', href: '/dashboard/employment', icon: Briefcase },
    { name: 'Vehicle', href: '/dashboard/vehicle', icon: Car },
    { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  ];
  
  const bottomNavigation = [
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };
  
  const sidebarClasses = cn(
    'h-screen flex flex-col bg-card border-r border-border/40 transition-all duration-300 ease-in-out-quart',
    isCollapsed ? 'w-[70px]' : 'w-[250px]'
  );

  return (
    <div className={sidebarClasses}>
      <div className="flex justify-between items-center p-4 border-b border-border/40">
        {!isCollapsed && (
          <Link 
            to="/dashboard"
            className="flex items-center gap-2 px-2 py-1.5 mb-6"
          >
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              F
            </div>
            <span>Fresherman</span>
          </Link>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="ml-auto"
        >
          {isMobile ? (
            <Menu className="h-5 w-5" />
          ) : (
            <ChevronLeft className={cn(
              "h-5 w-5 transition-transform duration-300",
              isCollapsed && "rotate-180"
            )} />
          )}
        </Button>
      </div>
      
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                onClick={handleLinkClick}
                className={cn(
                  'flex items-center rounded-md py-2 px-3 text-sm font-medium transition-colors',
                  isActive(item.href) 
                    ? 'bg-secondary text-foreground' 
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                <item.icon className={cn('flex-shrink-0 h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="py-4 px-2 border-t border-border/40">
        <ul className="space-y-1">
          {bottomNavigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                onClick={handleLinkClick}
                className={cn(
                  'flex items-center rounded-md py-2 px-3 text-sm font-medium transition-colors',
                  isActive(item.href) 
                    ? 'bg-secondary text-foreground' 
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                <item.icon className={cn('flex-shrink-0 h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
          
          <li>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center rounded-md py-2 px-3 text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
            >
              <LogOut className={cn('flex-shrink-0 h-5 w-5', isCollapsed ? 'mx-auto' : 'mr-3')} />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </li>
        </ul>
      </div>
      
      {!isCollapsed && (
        <div className="px-4 py-3 border-t border-border/40">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-foreground" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
