import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const Settings = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableAlerts, setEnableAlerts] = useState(false);
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('english');

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully');
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
                <SettingsIcon className="h-6 w-6 mr-2 text-primary" />
                Settings
              </h1>
            </div>
          </div>
        </div>
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6">
          <Card>
            <CardHeader>
              <CardTitle>App Settings</CardTitle>
              <CardDescription>
                Manage your application preferences and account settings
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications">Enable Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about your information updates
                        </p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={enableNotifications}
                        onCheckedChange={setEnableNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="alerts">Document Expiry Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get alerts when your documents are about to expire
                        </p>
                      </div>
                      <Switch
                        id="alerts"
                        checked={enableAlerts}
                        onCheckedChange={setEnableAlerts}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Display</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select
                        value={theme}
                        onValueChange={setTheme}
                      >
                        <SelectTrigger id="theme">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={language}
                        onValueChange={setLanguage}
                      >
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="german">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Security</h3>
                  <div className="space-y-4">
                    <Button variant="outline">Change Password</Button>
                    <Button variant="outline">Two-Factor Authentication</Button>
                    <Button variant="outline" className="text-destructive hover:text-destructive">Delete Account</Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button onClick={handleSaveSettings}>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Settings; 