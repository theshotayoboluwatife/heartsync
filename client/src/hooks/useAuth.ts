import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Global auth state - shared across all useAuth instances
let globalUser: User | null = null;
let globalIsLoading = true;
let globalIsAuthenticated = false;

// Subscribers for state updates
const subscribers: Set<() => void> = new Set();

// Function to update global state and notify all subscribers
const updateGlobalAuthState = (user: User | null, isLoading: boolean) => {
  globalUser = user;
  globalIsLoading = isLoading;
  globalIsAuthenticated = !!user;

  console.log('Global auth state updated:', { 
    user: user?.email || 'none',
    isLoading, 
    isAuthenticated: globalIsAuthenticated 
  });

  // Notify all subscribers
  subscribers.forEach(callback => callback());
};

export function useAuth() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // Add this component to subscribers
    const updateComponent = () => forceUpdate({});
    subscribers.add(updateComponent);

    // Initialize auth state if this is the first useAuth call
    if (subscribers.size === 1) {
      initializeAuth();
    }

    // Cleanup subscription on unmount
    return () => {
      subscribers.delete(updateComponent);
    };
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if we're in a password recovery flow
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const isRecoveryFlow = hashParams.get('type') === 'recovery';
      
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Don't treat recovery sessions as authenticated
      if (isRecoveryFlow) {
        updateGlobalAuthState(null, false);
      } else {
        updateGlobalAuthState(session?.user ?? null, false);

        // Ensure user profile exists in backend if user is authenticated
        if (session?.user) {
          await ensureUserProfile(session.user);
        }
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        
        // Check again if we're in recovery flow
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isRecoveryFlow = hashParams.get('type') === 'recovery';
        
        // Don't treat recovery sessions as authenticated
        if (isRecoveryFlow) {
          updateGlobalAuthState(null, false);
        } else {
          updateGlobalAuthState(session?.user ?? null, false);

          // Create profile on sign in (but not on recovery)
          if (event === "SIGNED_IN" && session?.user) {
            await ensureUserProfile(session.user);
          }
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      updateGlobalAuthState(null, false);
    }
  };

  const ensureUserProfile = async (user: User) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        console.warn('No access token available');
        return;
      }

      const response = await fetch("/api/auth/user", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn('Failed to ensure user profile:', response.status);
      }
    } catch (err) {
      console.error("Error ensuring user profile:", err);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('Attempting login...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      throw new Error(error.message);
    }

    console.log('Login successful');
    return data?.user;
  };

  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    console.log('Attempting signup...');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (error) {
      console.error('Signup error:', error);
      throw new Error(error.message);
    }

    // Check if email confirmation is required
    if (data?.user && !data.session) {
      return {
        ...data,
        message: "Please check your email to verify your account"
      };
    }

    console.log('Signup successful');
    return data;
  };

  const logout = async () => {
    console.log('Logging out...');
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.warn('Logout error:', error);
    }

    updateGlobalAuthState(null, false);
  };

  const resetPassword = async (email: string) => {
    console.log('Requesting password reset...');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      throw new Error(error.message);
    }

    console.log('Password reset email sent');
  };

  const updatePassword = async (newPassword: string) => {
    console.log('Updating password...');
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Password update error:', error);
      throw new Error(error.message);
    }

    console.log('Password updated successfully');
  };

  return {
    user: globalUser,
    isLoading: globalIsLoading,
    isAuthenticated: globalIsAuthenticated,
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
  };
}

// Helper function for authenticated API calls
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}