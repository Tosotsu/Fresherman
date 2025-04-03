import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out-quart px-4 md:px-6 py-4',
      isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm dark:bg-black/80' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center space-x-2 text-xl font-medium transition-opacity hover:opacity-80"
        >
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            F
          </div>
          <span className={cn(isScrolled ? 'text-foreground' : 'text-foreground')}>Fresherman</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            className="h-9 px-4 hover:bg-secondary/80 transition-colors hidden md:flex"
            asChild
          >
            <Link to="/signin">Sign In</Link>
          </Button>
          <Button className="h-9 px-4 shadow-sm hover:shadow-md transition-all hidden md:flex" asChild>
            <Link to="/signup">Sign Up</Link>
          </Button>
          
          <button
            className="md:hidden p-2 rounded-md hover:bg-secondary/80 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      <div className={cn(
        'md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm transition-transform duration-300 ease-in-out-quart',
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <div className="flex flex-col p-6 pt-20 h-full">
          <div className="flex flex-col space-y-3">
            <Button
              variant="outline"
              className="w-full justify-center"
              asChild
            >
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button className="w-full justify-center" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

const NavLink = ({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) => {
  return (
    <Link
      to={href}
      className={cn(
        'px-3 py-2 rounded-md text-sm font-medium transition-colors relative',
        active 
          ? 'text-foreground' 
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
      )}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
      )}
    </Link>
  );
};

const MobileNavLink = ({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) => {
  return (
    <Link
      to={href}
      className={cn(
        'px-4 py-3 rounded-md text-lg font-medium transition-colors',
        active 
          ? 'bg-secondary text-foreground' 
          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
      )}
    >
      {children}
    </Link>
  );
};

export default Navbar;
