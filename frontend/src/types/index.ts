export type RoleType =
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Full Stack Developer'
  | 'Java Developer'
  | 'Python Developer'
  | 'Data Analyst'
  | 'Data Scientist'
  | 'Product Manager'
  | 'UI/UX Designer';

export type ExperienceLevel = 'Beginner' | 'Junior' | 'Mid-Level' | 'Senior';

export type QuestionCategory =
  | 'Technical'
  | 'Behavioral'
  | 'HR'
  | 'Aptitude'
  | 'Situational'
  | 'Mixed';

export interface UserProfile {
  id: number;
  target_role: RoleType;
  experience_level: ExperienceLevel;
  interview_type_preference: QuestionCategory;
  bio?: string;
  target_company?: string;
  weekly_interview_goal: number;
  current_streak: number;
  longest_streak: number;
  last_interview_at?: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  profile?: UserProfile;
  subscription_tier: 'free' | 'pro_monthly' | 'pro_annual';
}

export interface Question {
  id: number;
  interview_id: number;
  question_order: number;
  question_text: string;
  category: QuestionCategory;
  role: string;
  difficulty: string;
  expected_key_points?: string[];
}

export interface EvaluationResult {
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  clarity_score: number;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  response_id?: number;
  next_question?: Question;
  is_completed: boolean;
}

export interface InterviewSession {
  id: number;
  role: RoleType;
  difficulty: ExperienceLevel;
  duration_minutes: number;
  interview_type: QuestionCategory;
  status: 'in_progress' | 'completed' | 'abandoned';
  is_voice_mode: boolean;
  total_questions: number;
  current_question_index: number;
  overall_score?: number;
  feedback_summary?: string;
  created_at: string;
  questions: Question[];
}

export interface WeeklyProgressItem {
  day: string;
  date: string;
  interviews_count: number;
  avg_score: number;
}

export interface MetricsBreakdown {
  technical_avg: number;
  communication_avg: number;
  confidence_avg: number;
  clarity_avg: number;
}

export interface DashboardData {
  total_interviews: number;
  average_score: number;
  current_streak: number;
  target_role: string;
  weekly_goal: number;
  weekly_completed: number;
  strength_areas: string[];
  improvement_areas: string[];
  weekly_progress: WeeklyProgressItem[];
  recent_interviews: {
    id: number;
    role: string;
    difficulty: string;
    interview_type: string;
    status: string;
    overall_score?: number;
    total_questions: number;
    created_at: string;
  }[];
  metrics_breakdown: MetricsBreakdown;
  subscription_tier: string;
  remaining_daily_interviews: number;
}

export interface ResumeData {
  id: number;
  filename: string;
  ats_score: number;
  candidate_name?: string;
  contact_email?: string;
  detected_role?: string;
  parsed_skills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  generated_questions: string[];
  created_at: string;
}

export interface QuestionBankItem {
  id: number;
  question_text: string;
  category: QuestionCategory;
  role: string;
  difficulty: string;
  source: string;
  is_bookmarked?: boolean;
  is_locked?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_period: string;
  features: string[];
  is_popular: boolean;
  play_store_product_id: string;
}
