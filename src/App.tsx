/// <reference types="react" />
import React, { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Features from "./pages/Features";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";
import { MenuBar } from "./components/menu-bar";

// Dashboard components
import Dashboard from "./pages/Dashboard";
import DashboardEducation from "./pages/dashboard/Education";
import DashboardMedical from "./pages/dashboard/Medical";
import DashboardEmployment from "./pages/dashboard/Employment";
import DashboardVehicle from "./pages/dashboard/Vehicle";
import DashboardDocuments from "./pages/dashboard/Documents";
import DashboardSettings from "./pages/dashboard/Settings";

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Show loading indicator while checking auth status
  if (isAuthenticated === null) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// Floating Controls component
const FloatingControls = () => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center gap-4">
      <div className="p-2 rounded-full bg-background/80 backdrop-blur-lg border border-border/30 shadow-lg">
        <ThemeToggle />
      </div>
      <MenuBar />
    </div>
  );
};

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" disableSystemTheme>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/education" element={
              <ProtectedRoute>
                <DashboardEducation />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/medical" element={
              <ProtectedRoute>
                <DashboardMedical />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/employment" element={
              <ProtectedRoute>
                <DashboardEmployment />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/vehicle" element={
              <ProtectedRoute>
                <DashboardVehicle />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/documents" element={
              <ProtectedRoute>
                <DashboardDocuments />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute>
                <DashboardSettings />
              </ProtectedRoute>
            } />
            
            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Floating Menu Bar and Theme Toggle */}
          <FloatingControls />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
