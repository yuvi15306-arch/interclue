import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { MetricsBreakdown } from '../types';

interface RadarChartProps {
  metrics: MetricsBreakdown;
  title?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  metrics,
  title = 'Candidate Competency Radar',
}) => {
  const dimensions = [
    { label: 'Technical Knowledge', value: metrics.technical_avg, color: '#38BDF8' },
    { label: 'Communication & Structure', value: metrics.communication_avg, color: '#10B981' },
    { label: 'Confidence & Delivery', value: metrics.confidence_avg, color: '#F59E0B' },
    { label: 'Clarity & Articulation', value: metrics.clarity_avg, color: '#818CF8' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.barsContainer}>
        {dimensions.map((dim, idx) => {
          const percentage = Math.min(100, Math.max(10, (dim.value / 10) * 100));
          return (
            <View key={idx} style={styles.barRow}>
              <View style={styles.labelRow}>
                <Text style={styles.dimensionLabel}>{dim.label}</Text>
                <Text style={[styles.dimensionScore, { color: dim.color }]}>
                  {dim.value.toFixed(1)} <Text style={styles.maxText}>/ 10</Text>
                </Text>
              </View>

              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: dim.color,
                    },
                  ]}
                />
              </View>
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
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  barsContainer: {
    gap: 12,
  },
  barRow: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dimensionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dimensionScore: {
    fontSize: 13,
    fontWeight: '700',
  },
  maxText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '400',
  },
  track: {
    height: 7,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
