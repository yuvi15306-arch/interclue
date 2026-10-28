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
  const isCorrect = latestEvaluation?.is_correct !== false;
  const accuracyLevel = latestEvaluation?.accuracy_level || (isCorrect ? 'Accurate' : 'Incorrect');
  const overall = latestEvaluation?.overall_score || 7.5;
  const tech = latestEvaluation?.technical_score || 7.2;
  const comm = latestEvaluation?.communication_score || 7.8;
  const conf = latestEvaluation?.confidence_score || 7.4;
  const clar = latestEvaluation?.clarity_score || 7.6;
  const feedbackSummary = latestEvaluation?.feedback_summary;
  const idealAnswer = latestEvaluation?.ideal_answer;
  const corrections = latestEvaluation?.corrections_and_misconceptions || [];

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
      {/* Top Header Row with Right-Aligned Controls */}
      <View style={styles.topControlRow}>
        <View style={styles.topTag}>
          <Ionicons name="sparkles" size={13} color={colors.accent} />
          <Text style={styles.topTagText}>GEMINI 1.5 PRO EVALUATION</Text>
        </View>

        <View style={styles.topRightActions}>
          <TouchableOpacity style={styles.topActionBtn} onPress={onContinue} accessibilityLabel="Refresh / Next">
            <Ionicons name="refresh" size={15} color={colors.accent} />
            <Text style={styles.topActionText}>{isCompleted ? 'Review' : 'Continue'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topActionBtn} onPress={onFinish} accessibilityLabel="Back to Dashboard">
            <Ionicons name="arrow-back" size={15} color={colors.textSecondary} />
            <Text style={styles.topActionText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Banner */}
      <View style={styles.heroCard}>
        <View style={styles.accuracyRow}>
          <View
            style={[
              styles.accuracyBadge,
              isCorrect ? styles.accuracyCorrect : styles.accuracyIncorrect,
            ]}
          >
            <Ionicons
              name={isCorrect ? 'checkmark-circle' : 'alert-circle'}
              size={14}
              color={isCorrect ? colors.success : colors.danger}
            />
            <Text
              style={[
                styles.accuracyText,
                { color: isCorrect ? colors.success : colors.danger },
              ]}
            >
              {accuracyLevel.toUpperCase()}
            </Text>
          </View>
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
                : overall >= 5.0
                ? 'Partially Correct ⚠️'
                : 'Needs Fundamental Study ❌'}
            </Text>
            <Text style={styles.verdictSub}>
              {feedbackSummary ||
                'Evaluated strictly across conceptual accuracy, depth, articulation, and trade-offs.'}
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

      {/* Corrections & Misconceptions if any */}
      {corrections.length > 0 && (
        <View style={[styles.feedbackCard, styles.correctionCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="close-circle" size={18} color={colors.danger} />
            <Text style={[styles.cardTitle, { color: colors.danger }]}>
              Corrections & Misconceptions
            </Text>
          </View>
          {corrections.map((c: string, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <View style={[styles.dot, { backgroundColor: colors.danger }]} />
              <Text style={styles.itemText}>{c}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Model Engineering Answer if available */}
      {idealAnswer && (
        <View style={[styles.feedbackCard, styles.modelAnswerCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="school" size={18} color={colors.accent} />
            <Text style={[styles.cardTitle, { color: colors.accent }]}>
              Model Engineering Answer
            </Text>
          </View>
          <Text style={styles.modelAnswerText}>{idealAnswer}</Text>
        </View>
      )}

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
  topControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  topTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  topTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  accuracyRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  accuracyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  accuracyCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: colors.success,
  },
  accuracyIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: colors.danger,
  },
  accuracyText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  overallScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surfaceLight,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreLarge: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.accent,
  },
  scoreMax: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  verdictCol: {
    flex: 1,
  },
  verdictTitle: {
    fontSize: 15,
    fontWeight: '700',
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
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  dimGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dimItem: {
    width: '48%',
    backgroundColor: colors.surfaceLight,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dimLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    flex: 1,
  },
  feedbackCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  correctionCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  modelAnswerCard: {
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  modelAnswerText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 19,
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  itemText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
  actionRow: {
    marginTop: 10,
  },
  continueBtn: {
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
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
