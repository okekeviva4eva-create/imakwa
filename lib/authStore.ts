import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';

type AuthState = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  pendingEmail: string | null;
  pendingMode: 'signup' | 'signin' | null;

  init: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  sendOtp: (email: string) => Promise<{ error?: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ error?: string }>;
  setPendingEmail: (email: string | null, mode?: 'signup' | 'signin' | null) => void;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  session: null,
  user: null,
  pendingEmail: null,
  pendingMode: null,

  init: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const session = data.session ?? null;
      set({
        session,
        user: session?.user ?? null,
        status: session ? 'authenticated' : 'unauthenticated',
      });
    } catch {
      set({ status: 'unauthenticated' });
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session: session ?? null,
        user: session?.user ?? null,
        status: session ? 'authenticated' : 'unauthenticated',
      });
    });
  },

  signUpWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    set({ pendingEmail: email, pendingMode: 'signup' });
    return {};
  },

  signInWithPassword: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // If user exists but not confirmed, fall back to OTP confirmation flow
      if (error.message.toLowerCase().includes('confirm')) {
        set({ pendingEmail: email, pendingMode: 'signup' });
        return { error: 'Please verify your email. We have sent a 6-digit code.' };
      }
      return { error: error.message };
    }
    return {};
  },

  sendOtp: async (email) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) return { error: error.message };
    set({ pendingEmail: email, pendingMode: 'signin' });
    return {};
  },

  verifyOtp: async (email, token) => {
    const mode = get().pendingMode;
    const type = mode === 'signup' ? 'signup' : 'email';
    const { error } = await supabase.auth.verifyOtp({ email, token, type });
    if (error) return { error: error.message };
    set({ pendingEmail: null, pendingMode: null });
    return {};
  },

  setPendingEmail: (email, mode = null) => set({ pendingEmail: email, pendingMode: mode }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, status: 'unauthenticated' });
  },
}));
