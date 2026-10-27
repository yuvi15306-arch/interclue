import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { WeeklyProgressItem } from '../types';

interface WeeklyProgressChartProps {
  data: WeeklyProgressItem[];
  weeklyGoal: number;
}

export const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({ data, weeklyGoal }) => {
  const maxInterviews = Math.max(3, ...data.map((d) => d.interviews_count));
  const totalCompleted = data.reduce((sum, item) => sum + item.interviews_count, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Weekly Interview Activity</Text>
          <Text style={styles.subtitle}>
            Goal: {totalCompleted} of {weeklyGoal} completed this week
          </Text>
        </View>
        <View style={styles.goalPill}>
          <Text style={styles.goalText}>
            {Math.round((totalCompleted / Math.max(1, weeklyGoal)) * 100)}%
          </Text>
        </View>
      </View>

      <View style={styles.chartArea}>
        {data.map((item, idx) => {
          const heightPercent =
            item.interviews_count > 0
              ? Math.max(25, (item.interviews_count / maxInterviews) * 100)
              : 8;
          const hasActivity = item.interviews_count > 0;

          return (
            <View key={idx} style={styles.columnWrapper}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: hasActivity ? colors.primary : colors.surfaceLight,
                    },
                    hasActivity && styles.activeBarGlow,
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, hasActivity && styles.activeDayLabel]}>
                {item.day}
              </Text>
              {item.avg_score > 0 && (
                <Text style={styles.scoreText}>{item.avg_score.toFixed(1)}</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  goalPill: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
  },
  goalText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  columnWrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 22,
    height: 80,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  activeBarGlow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  dayLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 6,
  },
  activeDayLabel: {
    color: colors.text,
    fontWeight: '700',
  },
  scoreText: {
    fontSize: 9,
    color: colors.accent,
    fontWeight: '700',
    marginTop: 2,
  },
});
