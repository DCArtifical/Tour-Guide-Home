import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface User {
  id: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error?: any }>;
}

const getDisplayName = (email: string): string => {
  const displayNames: Record<string, string> = {
    '1@qq.com': '彭东梅',
    '2@qq.com': '周正莲',
    '3@qq.com': '朱娜娜',
    '4@qq.com': '董育林'
    
    
    // Add more mappings here as needed
  };
  return displayNames[email] || email;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error };

    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        displayName: getDisplayName(data.user.email || ''),
      });
    }

    return {};
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const deleteAccount = async () => {
    try {
      if (!user) return { error: new Error('No user logged in') };

      // Delete the user from Supabase Auth
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        user.id
      );

      if (deleteError) {
        return { error: deleteError };
      }

      // Clear local user state and sign out
      setUser(null);
      await signOut();

      return {};
    } catch (error) {
      return { error };
    }
  };

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          displayName: getDisplayName(session.user.email || ''),
        });
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          displayName: getDisplayName(session.user.email || ''),
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};