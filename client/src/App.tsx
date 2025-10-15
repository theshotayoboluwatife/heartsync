import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Notifications from "@/pages/notifications-page";
import Ratings from "@/pages/ratings";
import Achievements from "@/pages/achievements";
import Messages from "@/pages/Messages";
import Premium from "@/pages/premium";
import PremiumSuccess from "@/pages/premium-success";
import ResetPassword from "@/pages/reset-password";
import NotFound from "@/pages/not-found";
import Debug from "@/pages/debug";
import Test from "@/pages/test";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while determining auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes - accessible regardless of auth state */}
      <Route path="/test" component={Test} />
      <Route path="/debug" component={Debug} />
      <Route path="/reset-password" component={ResetPassword} />

      {/* Protected routes - require authentication */}
      {isAuthenticated ? (
        <>
          <Route path="/" component={Home} />
          <Route path="/discover" component={Home} />
          <Route path="/profile" component={Profile} />
          <Route path="/ratings" component={Ratings} />
          <Route path="/achievements" component={Achievements} />
          <Route path="/messages" component={Messages} />
          <Route path="/premium" component={Premium} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/premium-success" component={PremiumSuccess} />
          <Route component={NotFound} />
        </>
      ) : (
        <>
          {/* All routes redirect to landing when not authenticated */}
          <Route path="/" component={Landing} />
          <Route component={Landing} />
        </>
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
