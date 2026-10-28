import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { RadarChart } from '../components/RadarChart';
import { INITIAL_DASHBOARD_DATA } from '../services/mockData';
import { ScoreBadge } from '../components/ScoreBadge';

export const AnalyticsScreen: React.FC = () => {
  const strongTopics = [
    { name: 'System Design & Scalability', cat: 'Technical', score: 8.8, count: 5 },
    { name: 'RESTful API & Idempotency', cat: 'Technical', score: 8.6, count: 4 },
    { name: 'Cross-functional Collaboration', cat: 'Behavioral', score: 8.5, count: 3 },
    { name: 'Problem Articulation', cat: 'Communication', score: 8.4, count: 6 },
  ];

  const weakTopics = [
    { name: 'Concurrency & Race Conditions', cat: 'Technical', score: 6.8, count: 2, tip: 'Study database isolation levels & optimistic locking' },
    { name: 'Quantitative Impact Statement', cat: 'HR', score: 7.0, count: 3, tip: 'Mention percentages, latency metrics, and user growth' },
    { name: 'STAR Method Consistency', cat: 'Behavioral', score: 7.2, count: 4, tip: 'Spend 50% of answer time on the specific Action you took' },
  ];

  const trends = [
    { session: 'S1', score: 7.0 },
    { session: 'S2', score: 7.3 },
    { session: 'S3', score: 7.8 },
    { session: 'S4', score: 8.1 },
    { session: 'S5', score: 8.4 },
    { session: 'S6', score: 8.8 },
  ];

  const hasHistory = INITIAL_DASHBOARD_DATA.total_interviews > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Overview Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTop}>
          <View>
            <Text style={styles.bannerTitle}>Performance Analytics</Text>
            <Text style={styles.bannerSub}>Multi-session AI benchmarking & consistency</Text>
          </View>
          <View style={styles.consistencyPill}>
            <Ionicons name="flame" size={14} color="#F59E0B" />
            <Text style={styles.consistencyText}>{hasHistory ? '88.5% Consistency' : 'New Candidate'}</Text>
          </View>
        </View>
      </View>

      {hasHistory ? (
        <>
          {/* Radar Chart */}
          <RadarChart metrics={INITIAL_DASHBOARD_DATA.metrics_breakdown} />

          {/* Historical Trend Chart */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Score Trajectory (Last 6 Sessions)</Text>
            <Text style={styles.cardSub}>Steady growth from 7.0 to 8.8 overall</Text>

            <View style={styles.trendRow}>
              {trends.map((item, idx) => {
                const heightPercent = ((item.score - 5.0) / 5.0) * 80;
                return (
                  <View key={idx} style={styles.trendCol}>
                    <Text style={styles.trendScore}>{item.score.toFixed(1)}</Text>
                    <View style={styles.trendTrack}>
                      <View style={[styles.trendBar, { height: `${heightPercent}%` }]} />
                    </View>
                    <Text style={styles.trendLabel}>{item.session}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Strong Topics */}
          <View style={styles.card}>
            <View style={styles.headingRow}>
              <Ionicons name="ribbon" size={18} color={colors.success} />
              <Text style={[styles.cardTitle, { color: colors.success }]}>Strongest Topics</Text>
            </View>
            <Text style={styles.cardSub}>Areas where you consistently demonstrate senior depth</Text>

            <View style={styles.topicsList}>
              {strongTopics.map((topic, idx) => (
                <View key={idx} style={styles.topicItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.topicName}>{topic.name}</Text>
                    <Text style={styles.topicMeta}>{topic.cat} • {topic.count} responses evaluated</Text>
                  </View>
                  <ScoreBadge score={topic.score} size="sm" />
                </View>
              ))}
            </View>
          </View>

          {/* Weak Topics */}
          <View style={styles.card}>
            <View style={styles.headingRow}>
              <Ionicons name="trending-up" size={18} color={colors.warning} />
              <Text style={[styles.cardTitle, { color: colors.warning }]}>Target Improvement Topics</Text>
            </View>
            <Text style={styles.cardSub}>Focus your next practice sessions on these key areas</Text>

            <View style={styles.topicsList}>
              {weakTopics.map((topic, idx) => (
                <View key={idx} style={styles.weakItem}>
                  <View style={styles.weakHeader}>
                    <Text style={styles.topicName}>{topic.name}</Text>
                    <ScoreBadge score={topic.score} size="sm" />
                  </View>
                  <View style={styles.tipBox}>
                    <Ionicons name="bulb-outline" size={13} color={colors.accent} />
                    <Text style={styles.tipText}>{topic.tip}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </>
      ) : (
        <View style={styles.emptyAnalyticsCard}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="analytics-outline" size={36} color={colors.accent} />
          </View>
          <Text style={styles.emptyAnalyticsTitle}>No Interview Data Recorded</Text>
          <Text style={styles.emptyAnalyticsSub}>
            Complete your first mock interview session to unlock radar analytics, category competency scores, and personalized performance trajectories.
          </Text>
        </View>
      )}
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
  banner: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  bannerSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  consistencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  consistencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  cardSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  trendCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  trendScore: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accent,
    marginBottom: 4,
  },
  trendTrack: {
    width: 20,
    height: 70,
    backgroundColor: colors.surfaceLight,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  trendBar: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  trendLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 6,
  },
  topicsList: {
    gap: 10,
  },
  topicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topicName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  topicMeta: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  weakItem: {
    backgroundColor: colors.surfaceLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  tipText: {
    fontSize: 11,
    color: colors.accent,
    flex: 1,
    lineHeight: 15,
  },
  emptyAnalyticsCard: {
    backgroundColor: colors.surface,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyAnalyticsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  emptyAnalyticsSub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 300,
  },
});
