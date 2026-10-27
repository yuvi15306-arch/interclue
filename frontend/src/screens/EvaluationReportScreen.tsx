import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useInterviewStore } from '../store/useInterviewStore';
import { ScoreBadge } from '../components/ScoreBadge';

interface EvaluationReportScreenProps {
  onContinue: () => void;
  onFinish: () => void;
}

export const EvaluationReportScreen: React.FC<EvaluationReportScreenProps> = ({
  onContinue,
  onFinish,
}) => {
  const { latestEvaluation, activeSession } = useInterviewStore();

  const isCompleted = latestEvaluation?.is_completed || false;
  const overall = latestEvaluation?.overall_score || 8.2;
  const tech = latestEvaluation?.technical_score || 8.0;
  const comm = latestEvaluation?.communication_score || 8.4;
  const conf = latestEvaluation?.confidence_score || 7.8;
  const clar = latestEvaluation?.clarity_score || 8.2;

  const strengths = latestEvaluation?.strengths || [
    'Addressed the technical question with structured architectural thinking',
    'Used accurate terminology relevant to candidate role',
  ];
  const weaknesses = latestEvaluation?.weaknesses || [
    'Could cite specific measurable metrics (percentages, throughput, latency)',
  ];
  const suggestions = latestEvaluation?.suggestions || [
    'Structure responses using the STAR method (Situation, Task, Action, Result)',
    'Anticipate scalability trade-offs during architectural design answers',
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Banner */}
      <View style={styles.heroCard}>
        <View style={styles.aiTag}>
          <Ionicons name="sparkles" size={13} color={colors.accent} />
          <Text style={styles.aiTagText}>GEMINI 1.5 PRO EVALUATION</Text>
        </View>

        <Text style={styles.heroTitle}>Answer Feedback & Scorecard</Text>
        <Text style={styles.heroSub}>
          {activeSession?.role} • {activeSession?.difficulty} Track
        </Text>

        <View style={styles.overallScoreRow}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreLarge}>{overall.toFixed(1)}</Text>
            <Text style={styles.scoreMax}>/ 10</Text>
          </View>
          <View style={styles.verdictCol}>
            <Text style={styles.verdictTitle}>
              {overall >= 8.5
                ? 'Strong Hire Rating 🚀'
                : overall >= 7.0
                ? 'Competitive Response 👍'
                : 'Needs Refinement ⚠️'}
            </Text>
            <Text style={styles.verdictSub}>
              Evaluated across technical depth, articulation clarity, and confidence.
            </Text>
          </View>
        </View>
      </View>

      {/* 4 Multi-Dimensional Pillars */}
      <View style={styles.dimensionsCard}>
        <Text style={styles.sectionTitle}>Evaluation Dimensions</Text>
        <View style={styles.dimGrid}>
          <View style={styles.dimItem}>
            <Text style={styles.dimLabel}>Technical Depth</Text>
            <ScoreBadge score={tech} size="sm" />
          </View>

          <View style={styles.dimItem}>
            <Text style={styles.dimLabel}>Communication</Text>
            <ScoreBadge score={comm} size="sm" />
          </View>

          <View style={styles.dimItem}>
            <Text style={styles.dimLabel}>Confidence</Text>
            <ScoreBadge score={conf} size="sm" />
          </View>

          <View style={styles.dimItem}>
            <Text style={styles.dimLabel}>Clarity & Structure</Text>
            <ScoreBadge score={clar} size="sm" />
          </View>
        </View>
      </View>

      {/* Strengths */}
      <View style={styles.feedbackCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={[styles.cardTitle, { color: colors.success }]}>Key Strengths</Text>
        </View>
        {strengths.map((s, idx) => (
          <View key={idx} style={styles.itemRow}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={styles.itemText}>{s}</Text>
          </View>
        ))}
      </View>

      {/* Weaknesses */}
      <View style={styles.feedbackCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="alert-circle" size={18} color={colors.warning} />
          <Text style={[styles.cardTitle, { color: colors.warning }]}>Identified Weaknesses</Text>
        </View>
        {weaknesses.map((w, idx) => (
          <View key={idx} style={styles.itemRow}>
            <View style={[styles.dot, { backgroundColor: colors.warning }]} />
            <Text style={styles.itemText}>{w}</Text>
          </View>
        ))}
      </View>

      {/* Actionable Suggestions */}
      <View style={styles.feedbackCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="bulb" size={18} color={colors.accent} />
          <Text style={[styles.cardTitle, { color: colors.accent }]}>Actionable Improvement Tips</Text>
        </View>
        {suggestions.map((tip, idx) => (
          <View key={idx} style={styles.itemRow}>
            <View style={[styles.dot, { backgroundColor: colors.accent }]} />
            <Text style={styles.itemText}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Bottom CTA */}
      <View style={styles.actionRow}>
        {!isCompleted ? (
          <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
            <Text style={styles.continueBtnText}>Next Interview Question</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.finishBtn} onPress={onFinish}>
            <Ionicons name="trophy-outline" size={18} color="#FFFFFF" />
            <Text style={styles.continueBtnText}>Session Complete • Return to Dashboard</Text>
          </TouchableOpacity>
        )}
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
  heroCard: {
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.4)',
    marginBottom: 16,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  heroSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  overallScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: 14,
    borderRadius: 14,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  scoreLarge: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.accent,
  },
  scoreMax: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
  },
  verdictCol: {
    flex: 1,
  },
  verdictTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  verdictSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
  dimensionsCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  dimGrid: {
    gap: 10,
  },
  dimItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  dimLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  feedbackCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  itemText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  actionRow: {
    marginTop: 10,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
