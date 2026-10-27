import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface ScoreBadgeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, maxScore = 10, size = 'md' }) => {
  let badgeColor = colors.success;
  let bgColor = colors.successLight;

  if (score < 6.0) {
    badgeColor = colors.danger;
    bgColor = colors.dangerLight;
  } else if (score < 8.0) {
    badgeColor = colors.warning;
    bgColor = colors.warningLight;
  }

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bgColor, borderColor: badgeColor },
        isSmall && styles.badgeSm,
        isLarge && styles.badgeLg,
      ]}
    >
      <Text
        style={[
          styles.scoreText,
          { color: badgeColor },
          isSmall && styles.scoreSm,
          isLarge && styles.scoreLg,
        ]}
      >
        {score.toFixed(1)}
      </Text>
      <Text
        style={[
          styles.maxText,
          { color: badgeColor },
          isSmall && styles.maxSm,
          isLarge && styles.maxLg,
        ]}
      >
        /{maxScore}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    gap: 1,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeLg: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '800',
  },
  scoreSm: {
    fontSize: 11,
  },
  scoreLg: {
    fontSize: 20,
  },
  maxText: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.8,
  },
  maxSm: {
    fontSize: 8,
  },
  maxLg: {
    fontSize: 13,
  },
});
