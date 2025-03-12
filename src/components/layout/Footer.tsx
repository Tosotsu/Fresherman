import { Link } from 'react-router-dom';
import { ArrowRight, Github, Linkedin, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-medium mb-4"
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                F
              </div>
              <span className="text-foreground">Fresherman</span>
            </Link>
            <p className="text-muted-foreground mt-4 mb-6 max-w-md">
              Your personal information system with seamless organization, security, and accessibility.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" icon={<Twitter className="h-5 w-5" />} label="Twitter" />
              <SocialLink href="#" icon={<Github className="h-5 w-5" />} label="GitHub" />
              <SocialLink href="#" icon={<Linkedin className="h-5 w-5" />} label="LinkedIn" />
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-medium text-base mb-4 text-foreground">Product</h4>
            <ul className="space-y-3">
              <FooterLink href="/features">Features</FooterLink>
              <FooterLink href="/about">About</FooterLink>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="font-medium text-base mb-4 text-foreground">Stay Updated</h4>
            <form className="mb-4" onSubmit={(e) => e.preventDefault()}>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-md border border-input px-3 py-2 text-sm bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <Button type="submit" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <p className="text-xs text-muted-foreground">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {new Date().getFullYear()} Fresherman. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <Link
      to={href}
      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
    >
      {children}
    </Link>
  </li>
);

const SocialLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <a
    href={href}
    className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
    aria-label={label}
  >
    {icon}
  </a>
);

export default Footer;
