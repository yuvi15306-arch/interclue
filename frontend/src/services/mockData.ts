import { DashboardData, ResumeData, SubscriptionPlan } from '../types';

export const INITIAL_DASHBOARD_DATA: DashboardData = {
  total_interviews: 0,
  average_score: 0.0,
  current_streak: 0,
  target_role: 'Full Stack Developer',
  weekly_goal: 5,
  weekly_completed: 0,
  strength_areas: [],
  improvement_areas: [],
  weekly_progress: [
    { day: 'Mon', date: '', interviews_count: 0, avg_score: 0.0 },
    { day: 'Tue', date: '', interviews_count: 0, avg_score: 0.0 },
    { day: 'Wed', date: '', interviews_count: 0, avg_score: 0.0 },
    { day: 'Thu', date: '', interviews_count: 0, avg_score: 0.0 },
    { day: 'Fri', date: '', interviews_count: 0, avg_score: 0.0 },
    { day: 'Sat', date: '', interviews_count: 0, avg_score: 0.0 },
    { day: 'Sun', date: '', interviews_count: 0, avg_score: 0.0 },
  ],
  recent_interviews: [],
  metrics_breakdown: {
    technical_avg: 0.0,
    communication_avg: 0.0,
    confidence_avg: 0.0,
    clarity_avg: 0.0,
  },
  subscription_tier: 'free',
  remaining_daily_interviews: 3,
};

export const INITIAL_RESUME_DATA: ResumeData | null = null;

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Starter',
    price: 0,
    currency: 'USD',
    billing_period: 'forever',
    features: [
      '3 AI mock interviews per day',
      'Text-based interview engine',
      'Basic answer feedback',
      '5 question-bank items per category',
    ],
    is_popular: false,
    play_store_product_id: 'interclue_free',
  },
  {
    id: 'pro_monthly',
    name: 'InterClue Pro',
    price: 19.99,
    currency: 'USD',
    billing_period: 'monthly',
    features: [
      'Unlimited AI mock interviews',
      'Voice Interview Mode (Deepgram / Whisper)',
      'Full ATS Resume Analyzer & Score',
      'Custom questions generated from Resume',
      'Multi-dimensional Radar Analytics',
      'Priority Gemini 1.5 Pro processing',
    ],
    is_popular: true,
    play_store_product_id: 'interclue_pro_monthly',
  },
];
