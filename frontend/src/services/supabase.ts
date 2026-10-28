import { apiClient, setAuthToken } from './api';

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export interface SupabaseAuthResult {
  access_token: string;
  user: any;
}

export const supabaseAuthService = {
  isConfigured: () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),

  loginWithPassword: async (email: string, password: string): Promise<SupabaseAuthResult> => {
    const res = await apiClient.post('/auth/supabase/login', { email, password });
    const { access_token, user } = res.data;
    setAuthToken(access_token);
    return { access_token, user };
  },

  signUpWithPassword: async (
    email: string,
    password: string,
    fullName: string,
    targetRole: string = 'Full Stack Developer',
    experienceLevel: string = 'Junior',
    interviewType: string = 'Mixed'
  ): Promise<SupabaseAuthResult> => {
    const res = await apiClient.post('/auth/supabase/signup', {
      email,
      password,
      full_name: fullName,
      target_role: targetRole,
      experience_level: experienceLevel,
      interview_type: interviewType,
    });
    const { access_token, user } = res.data;
    setAuthToken(access_token);
    return { access_token, user };
  },

  syncSession: async (
    accessToken: string,
    email?: string,
    fullName?: string
  ): Promise<SupabaseAuthResult> => {
    const res = await apiClient.post('/auth/supabase/sync', {
      access_token: accessToken,
      email,
      full_name: fullName,
    });
    const { access_token, user } = res.data;
    setAuthToken(access_token);
    return { access_token, user };
  },
};
