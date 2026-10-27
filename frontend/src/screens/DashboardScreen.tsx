import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuthStore } from '../store/useAuthStore';
import { useInterviewStore } from '../store/useInterviewStore';
import { MetricCard } from '../components/MetricCard';
import { WeeklyProgressChart } from '../components/WeeklyProgressChart';
import { ScoreBadge } from '../components/ScoreBadge';
import { INITIAL_DASHBOARD_DATA } from '../services/mockData';
import { RoleType, ExperienceLevel, QuestionCategory } from '../types';

interface DashboardScreenProps {
  onStartInterview: () => void;
  onOpenRoleModal: () => void;
  onOpenUpgrade: () => void;
  onOpenResume: () => void;
  onOpenQuestionBank: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onStartInterview,
  onOpenRoleModal,
  onOpenUpgrade,
  onOpenResume,
  onOpenQuestionBank,
}) => {
  const { user } = useAuthStore();
  const { startInterview, isVoiceMode, toggleVoiceMode } = useInterviewStore();

  const [selectedDuration, setSelectedDuration] = useState<number>(15);
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory>('Mixed');

  const profile = user?.profile;
  const currentRole = (profile?.target_role as RoleType) || 'Full Stack Developer';
  const currentLevel = (profile?.experience_level as ExperienceLevel) || 'Junior';

  const handleLaunchMockInterview = async () => {
    await startInterview({
      role: currentRole,
      difficulty: currentLevel,
      duration: selectedDuration,
      interview_type: selectedCategory,
      is_voice: isVoiceMode,
      total_questions: 4,
    });
    onStartInterview();
  };

  const categories: QuestionCategory[] = ['Mixed', 'Technical', 'Behavioral', 'HR', 'Situational', 'Aptitude'];
  const isFree = user?.subscription_tier === 'free' || !user?.subscription_tier;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome & Role Strip */}
      <View style={styles.welcomeStrip}>
        <View>
          <Text style={styles.greetingText}>
            Welcome back, {user?.full_name ? user.full_name.split(' ')[0] : 'Candidate'} 👋
          </Text>
          <TouchableOpacity style={styles.rolePickerBtn} onPress={onOpenRoleModal}>
            <Ionicons name="briefcase-outline" size={14} color={colors.accent} />
            <Text style={styles.rolePickerText}>
              {currentRole} • {currentLevel}
            </Text>
            <Ionicons name="chevron-down" size={12} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.streakGoalBadge} onPress={onOpenRoleModal}>
          <Ionicons name="flame" size={18} color="#F59E0B" />
          <View>
            <Text style={styles.streakValue}>{profile?.current_streak || 4} Days</Text>
            <Text style={styles.streakLabel}>Active Streak</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Launch Mock Interview Hero Card */}
      <View style={styles.launchCard}>
        <View style={styles.launchHeader}>
          <View>
            <Text style={styles.launchTag}>AI MOCK INTERVIEW ENGINE</Text>
            <Text style={styles.launchTitle}>Ready for your next session?</Text>
          </View>

          {/* Voice Mode Toggle */}
          <TouchableOpacity
            style={[styles.voiceToggle, isVoiceMode && styles.voiceToggleActive]}
            onPress={toggleVoiceMode}
          >
            <Ionicons
              name={isVoiceMode ? 'mic' : 'mic-outline'}
              size={16}
              color={isVoiceMode ? '#FFFFFF' : colors.textSecondary}
            />
            <Text style={[styles.voiceToggleText, isVoiceMode && styles.voiceToggleTextActive]}>
              Voice Mode
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category selector */}
        <Text style={styles.selectorLabel}>Interview Type (Gemini writes questions for this type)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, selectedCategory === cat && styles.catPillActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Duration selector */}
        <View style={styles.durationRow}>
          <Text style={styles.selectorLabel}>Session Length:</Text>
          <View style={styles.durationOptions}>
            {[5, 15, 30].map((mins) => (
              <TouchableOpacity
                key={mins}
                style={[styles.durPill, selectedDuration === mins && styles.durPillActive]}
                onPress={() => setSelectedDuration(mins)}
              >
                <Text style={[styles.durText, selectedDuration === mins && styles.durTextActive]}>
                  {mins} mins
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.geminiHint}>
          {isFree
            ? 'Free tier: 5 questions per category in the bank. Gemini still generates this mock from your selected type.'
            : 'Pro: full 55-question bank per category plus Gemini generation for this interview type.'}
        </Text>

        {/* Big Start Button */}
        <TouchableOpacity style={styles.startBtn} onPress={handleLaunchMockInterview}>
          <Ionicons name="play" size={18} color="#FFFFFF" />
          <Text style={styles.startBtnText}>Start AI Mock Interview</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Metrics Grid */}
      <View style={styles.metricsGrid}>
        <MetricCard
          title="Interviews Completed"
          value={INITIAL_DASHBOARD_DATA.total_interviews}
          icon="checkmark-done-circle"
          iconColor={colors.accent}
          trend="+2 this wk"
          isPositive={true}
        />
        <MetricCard
          title="Average Score"
          value={`${INITIAL_DASHBOARD_DATA.average_score}/10`}
          icon="trophy"
          iconColor="#F59E0B"
          trend="+0.6 pts"
          isPositive={true}
        />
      </View>

      {/* Weekly Progress Chart */}
      <WeeklyProgressChart
        data={INITIAL_DASHBOARD_DATA.weekly_progress}
        weeklyGoal={INITIAL_DASHBOARD_DATA.weekly_goal}
      />

      {/* Strength & Improvement Areas as specified in prompt */}
      <View style={styles.insightsCard}>
        <Text style={styles.sectionHeader}>Personalized Performance Insights</Text>

        <View style={styles.insightBox}>
          <View style={styles.insightTitleRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.strengthTitle}>Key Strength Areas</Text>
          </View>
          {INITIAL_DASHBOARD_DATA.strength_areas.map((item, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: colors.success }]} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.insightBox, { marginTop: 12 }]}>
          <View style={styles.insightTitleRow}>
            <Ionicons name="trending-up" size={16} color={colors.warning} />
            <Text style={styles.weaknessTitle}>Target Improvement Areas</Text>
          </View>
          {INITIAL_DASHBOARD_DATA.improvement_areas.map((item, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Access Tiles: Resume Analyzer & Question Bank */}
      <View style={styles.tilesRow}>
        <TouchableOpacity style={styles.tileCard} onPress={onOpenResume}>
          <View style={[styles.tileIcon, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
            <Ionicons name="document-text" size={22} color={colors.accent} />
          </View>
          <Text style={styles.tileTitle}>ATS Resume Scanner</Text>
          <Text style={styles.tileSub}>Scan score & generate resume questions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tileCard} onPress={onOpenQuestionBank}>
          <View style={[styles.tileIcon, { backgroundColor: 'rgba(37, 99, 235, 0.15)' }]}>
            <Ionicons name="library" size={22} color={colors.primaryLight} />
          </View>
          <Text style={styles.tileTitle}>Question Bank</Text>
          <Text style={styles.tileSub}>Personalized questions by skills</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Interviews History */}
      <View style={styles.historyCard}>
        <Text style={styles.sectionHeader}>Recent Interviews</Text>
        {INITIAL_DASHBOARD_DATA.recent_interviews.map((inv) => (
          <View key={inv.id} style={styles.historyItem}>
            <View>
              <Text style={styles.historyRole}>{inv.role}</Text>
              <Text style={styles.historyMeta}>
                {inv.interview_type} • {inv.difficulty} • {inv.total_questions} Questions
              </Text>
            </View>
            <ScoreBadge score={inv.overall_score || 8.0} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  welcomeStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  rolePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
    gap: 4,
  },
  rolePickerText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '700',
  },
  streakGoalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gap: 8,
  },
  streakValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  streakLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '600',
  },
  launchCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.4)',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  launchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  launchTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.8,
  },
  launchTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  voiceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  voiceToggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.accent,
  },
  voiceToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  voiceToggleTextActive: {
    color: '#FFFFFF',
  },
  selectorLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  catRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catPillActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    borderColor: colors.primary,
  },
  catText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  catTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  durationOptions: {
    flexDirection: 'row',
    gap: 6,
  },
  durPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durPillActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  durText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  durTextActive: {
    color: colors.accent,
    fontWeight: '800',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  geminiHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  insightsCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  insightBox: {
    backgroundColor: colors.surfaceLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  strengthTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  weaknessTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.warning,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
  },
  bulletText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tileCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tileTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  tileSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
  historyCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  historyRole: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  historyMeta: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
});
