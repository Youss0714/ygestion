import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import LoadingScreen from "@/components/loading-screen";
import LanguageSelector from "@/components/language-selector";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Products from "@/pages/products";
import Categories from "@/pages/categories";
import Invoices from "@/pages/invoices";
import InvoiceDetail from "@/pages/invoice-detail";
import Sales from "@/pages/sales";
import Settings from "@/pages/settings";
import Export from "@/pages/export";
import UserRegistration from "@/pages/user-registration";
import LicenseActivation from "@/pages/license-activation";
import AdminLicenses from "@/pages/admin-licenses";
import Accounting from "@/pages/accounting";

import AlertsPage from "@/pages/alerts";
import UserGuide from "@/pages/user-guide";
import Sidebar from "@/components/sidebar";
import TrialBanner from "@/components/trial-banner";

function AppContent() {
  const { user } = useAuth();
  const [trialExpired, setTrialExpired] = useState(false);
  const [trialStartTime, setTrialStartTime] = useState<number | null>(null);
  
  // Start trial timer when user first accesses the dashboard
  useEffect(() => {
    if (user && !user.licenseActivated) {
      // Skip license activation for admin user "Youssouphafils"
      if (user.firstName === "Youssouphafils" || user.email === "youssouphafils@gmail.com") {
        return; // Admin never needs license activation
      }
      
      // Check if trial was already started in localStorage
      const storedStartTime = localStorage.getItem(`trial_start_${user.id}`);
      let startTime = storedStartTime ? parseInt(storedStartTime) : null;
      
      if (!startTime) {
        // Start new trial - but don't expire immediately, let user see dashboard
        startTime = Date.now();
        localStorage.setItem(`trial_start_${user.id}`, startTime.toString());
        setTrialStartTime(startTime);
        
        // Set timer for 1 minute
        const timer = setTimeout(() => {
          setTrialExpired(true);
        }, 60000);
        
        return () => clearTimeout(timer);
      } else {
        setTrialStartTime(startTime);
        
        // Check if trial should already be expired
        const elapsed = Date.now() - startTime;
        if (elapsed >= 60000) { // 1 minute = 60000ms
          setTrialExpired(true);
          return;
        }
        
        // Set timer for remaining time
        const remainingTime = 60000 - elapsed;
        const timer = setTimeout(() => {
          setTrialExpired(true);
        }, remainingTime);
        
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  // Clean up trial data when user activates license
  useEffect(() => {
    if (user?.licenseActivated) {
      localStorage.removeItem(`trial_start_${user.id}`);
      setTrialExpired(false); // Reset trial state
    }
  }, [user?.licenseActivated, user?.id]);
  
  // Show license activation after trial expires (except for admin)
  if (user && !user.licenseActivated && trialExpired && user.firstName !== "Youssouphafils" && user.email !== "youssouphafils@gmail.com") {
    return <LicenseActivation />;
  }

  const handleActivateLicense = () => {
    setTrialExpired(true);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-hidden content-glass">
        {user && !user.licenseActivated && trialStartTime && !trialExpired && user.firstName !== "Youssouphafils" && user.email !== "youssouphafils@gmail.com" && (
          <div className="p-4">
            <TrialBanner 
              trialStartTime={trialStartTime} 
              onActivateLicense={handleActivateLicense}
            />
          </div>
        )}
        <div className="h-full overflow-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/clients" component={Clients} />
            <Route path="/products" component={Products} />
            <Route path="/categories" component={Categories} />
            <Route path="/invoices" component={Invoices} />
            <Route path="/invoices/:id" component={InvoiceDetail} />
            <Route path="/sales" component={Sales} />
            <Route path="/accounting" component={Accounting} />
            <Route path="/settings" component={Settings} />
            <Route path="/alerts" component={AlertsPage} />
            <Route path="/export" component={Export} />
            <Route path="/user-guide" component={UserGuide} />
            <Route path="/complete-profile" component={UserRegistration} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoadingScreen, setShowLoadingScreen] = useState(() => {
    // Check if we should show loading screen
    return !sessionStorage.getItem('hasSeenLoading');
  });
  const [showLanguageSelector, setShowLanguageSelector] = useState(() => {
    // Check if language has been selected before
    return !localStorage.getItem('initialLanguageSelected');
  });

  // Show loading screen if not seen before
  if (showLoadingScreen) {
    return (
      <LoadingScreen 
        onComplete={() => {
          setShowLoadingScreen(false);
          sessionStorage.setItem('hasSeenLoading', 'true');
        }} 
      />
    );
  }

  // Show language selector if not selected before
  if (showLanguageSelector) {
    return (
      <LanguageSelector 
        onLanguageSelect={(language) => {
          // Save the language preference
          localStorage.setItem('initialLanguageSelected', 'true');
          localStorage.setItem('preferredLanguage', language);
          setShowLanguageSelector(false);
        }} 
      />
    );
  }

  // Wait for auth to complete before showing main app
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes for license management */}
      <Route path="/activate" component={LicenseActivation} />
      <Route path="/admin" component={AdminLicenses} />
      
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
          <Route component={AuthPage} />
        </>
      ) : (
        <AppContent />
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
