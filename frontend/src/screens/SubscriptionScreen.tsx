import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuthStore } from '../store/useAuthStore';

interface SubscriptionScreenProps {
  onOpenUpgrade: () => void;
}

export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ onOpenUpgrade }) => {
  const { user } = useAuthStore();
  const isPro = user?.subscription_tier !== 'free';

  const planComparison = [
    { feature: 'Daily Mock Interviews', free: '3 per day', pro: 'Unlimited' },
    { feature: 'Voice Interview Mode', free: 'Unavailable', pro: 'Included (Deepgram / Whisper)' },
    { feature: 'Full ATS Resume Analyzer', free: 'Basic scan', pro: 'Full scan + Resume questions' },
    { feature: 'Competency Radar & Analytics', free: 'Basic average', pro: 'Multi-session radar & trends' },
    { feature: 'Personalized Question Bank', free: 'Limited questions', pro: 'Unlimited AI Generation' },
    { feature: 'Gemini 1.5 Pro Processing', free: 'Standard model', pro: 'Priority high-depth feedback' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Current Plan Card */}
      <View style={styles.currentCard}>
        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, isPro ? styles.proStatus : styles.freeStatus]}>
            <Ionicons name={isPro ? 'diamond' : 'person'} size={14} color={isPro ? '#38BDF8' : '#94A3B8'} />
            <Text style={[styles.statusText, { color: isPro ? '#38BDF8' : '#94A3B8' }]}>
              {isPro ? 'PRO ACTIVE' : 'FREE PLAN'}
            </Text>
          </View>
        </View>

        <Text style={styles.planTitle}>{isPro ? 'InterClue Pro Monthly' : 'Student Free Starter'}</Text>
        <Text style={styles.planDesc}>
          {isPro
            ? 'You have unlimited access to AI mock interviews, voice mode, and resume analysis.'
            : 'You are on the free plan with 3 mock interviews per day.'}
        </Text>

        {!isPro ? (
          <TouchableOpacity style={styles.upgradeBtn} onPress={onOpenUpgrade}>
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            <Text style={styles.upgradeBtnText}>Upgrade to Pro with Google Play</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.proActiveBanner}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.proActiveBannerText}>Active Subscription • Renews monthly via Google Play</Text>
          </View>
        )}
      </View>

      {/* Feature Comparison Matrix */}
      <View style={styles.matrixCard}>
        <Text style={styles.matrixTitle}>Plan Comparison</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.colHeader, { flex: 1.8 }]}>Features</Text>
          <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>Free</Text>
          <Text style={[styles.colHeader, { flex: 1.4, textAlign: 'center', color: colors.accent }]}>
            Pro
          </Text>
        </View>

        {planComparison.map((row, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={styles.rowFeature}>{row.feature}</Text>
            <Text style={styles.rowFree}>{row.free}</Text>
            <Text style={styles.rowPro}>{row.pro}</Text>
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
  currentCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.4)',
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proStatus: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  freeStatus: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  planDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  proActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.successLight,
    padding: 12,
    borderRadius: 10,
  },
  proActiveBannerText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  matrixCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  matrixTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 6,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  rowFeature: {
    flex: 1.8,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  rowFree: {
    flex: 1,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  rowPro: {
    flex: 1.4,
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
    textAlign: 'center',
  },
});
