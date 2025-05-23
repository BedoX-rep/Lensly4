
import { supabase } from '@/integrations/supabase/client';
import { createTrialSubscription } from '@/integrations/supabase/queries';
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (data.user) {
      try {
        // Check if user has any subscription
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (subError?.code === 'PGRST116' || !subscription) {
          // No subscription found, create trial with user metadata
          const metadata = data.user.user_metadata || {};
          await createTrialSubscription(
            data.user.id, 
            data.user.email || '', 
            metadata.display_name || 'User'
          );
        } else {
          // Check if subscription is expired
          const currentDate = new Date();
          const endDate = new Date(subscription.end_date);
          
          if (currentDate > endDate) {
            // Subscription expired
            const subscriptionError = { message: 'Your subscription has expired. Please renew to continue.' };
            await supabase.auth.signOut();
            return { data: null, error: subscriptionError };
          }
        }
      } catch (error) {
        console.error('Subscription check error:', error);
      }
    }
    
    return { data, error };
  } catch (error) {
    console.error('Auth error:', error);
    return { data: null, error };
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    session,
    logout: signOut
  };
}
