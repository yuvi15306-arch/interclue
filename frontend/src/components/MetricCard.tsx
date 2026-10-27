import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trend?: string;
  isPositive?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = colors.primary,
  trend,
  isPositive = true,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}1A` }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, isPositive ? styles.trendUp : styles.trendDown]}>
            <Ionicons
              name={isPositive ? 'arrow-up' : 'arrow-down'}
              size={11}
              color={isPositive ? colors.success : colors.danger}
            />
            <Text style={[styles.trendText, { color: isPositive ? colors.success : colors.danger }]}>
              {trend}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.valueText}>{value}</Text>
      <Text style={styles.titleText}>{title}</Text>
      {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  trendUp: {
    backgroundColor: colors.successLight,
  },
  trendDown: {
    backgroundColor: colors.dangerLight,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
  },
  valueText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  titleText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  subtitleText: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
});
