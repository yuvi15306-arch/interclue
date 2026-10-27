import { create } from 'zustand';
import { User, RoleType, ExperienceLevel, QuestionCategory } from '../types';
import { apiClient, setAuthToken } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (
    email: string,
    pass: string,
    fullName: string,
    role: RoleType,
    level: ExperienceLevel,
    pref: QuestionCategory
  ) => Promise<boolean>;
  demoLogin: () => Promise<void>;
  updateTargetRole: (role: RoleType, level: ExperienceLevel) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: {
    id: 1,
    email: 'alex.rivera@interclue.ai',
    full_name: 'Alex Rivera',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    is_active: true,
    is_admin: false,
    created_at: new Date().toISOString(),
    subscription_tier: 'pro_monthly',
    profile: {
      id: 1,
      target_role: 'Full Stack Developer',
      experience_level: 'Junior',
      interview_type_preference: 'Mixed',
      weekly_interview_goal: 5,
      current_streak: 4,
      longest_streak: 7,
    },
  },
  token: 'mock-jwt-token-interclue',
  isAuthenticated: true,
  isLoading: false,
  error: null,

  login: async (email: string, pass: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post('/auth/login', { email, password: pass });
      const { access_token, user } = res.data;
      setAuthToken(access_token);
      set({ user, token: access_token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Login failed. Check your credentials.';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  register: async (email, pass, fullName, role, level, pref) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post('/auth/register', {
        email,
        password: pass,
        full_name: fullName,
        target_role: role,
        experience_level: level,
        interview_type: pref,
      });
      const { access_token, user } = res.data;
      setAuthToken(access_token);
      set({ user, token: access_token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Try a different email.';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  demoLogin: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post('/auth/login', {
        email: 'demo@interclue.ai',
        password: 'interclue123',
      });
      const { access_token, user } = res.data;
      setAuthToken(access_token);
      set({ user, token: access_token, isAuthenticated: true, isLoading: false });
    } catch {
      // Fallback demo user
      set({
        user: {
          id: 1,
          email: 'demo@interclue.ai',
          full_name: 'Alex Rivera (Demo)',
          is_active: true,
          is_admin: false,
          created_at: new Date().toISOString(),
          subscription_tier: 'pro_monthly',
          profile: {
            id: 1,
            target_role: 'Full Stack Developer',
            experience_level: 'Junior',
            interview_type_preference: 'Mixed',
            weekly_interview_goal: 5,
            current_streak: 4,
            longest_streak: 7,
          },
        },
        isAuthenticated: true,
        isLoading: false,
      });
    }
  },

  updateTargetRole: async (role: RoleType, level: ExperienceLevel) => {
    const { user } = get();
    if (!user) return;
    const updatedProfile = {
      ...user.profile,
      target_role: role,
      experience_level: level,
    };
    set({
      user: {
        ...user,
        profile: updatedProfile as any,
      },
    });

    try {
      await apiClient.put('/auth/profile', {
        target_role: role,
        experience_level: level,
      });
    } catch {
      // Local state kept
    }
  },

  logout: () => {
    setAuthToken(null);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
