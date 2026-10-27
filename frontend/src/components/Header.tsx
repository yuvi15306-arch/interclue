import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuthStore } from '../store/useAuthStore';

interface HeaderProps {
  title?: string;
  onOpenProfile?: () => void;
  onOpenUpgrade?: () => void;
  onBack?: () => void;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onOpenProfile, onOpenUpgrade, onBack, onRefresh }) => {
  const { user } = useAuthStore();
  const streak = user?.profile?.current_streak || 1;
  const isPro = user?.subscription_tier !== 'free';

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Ionicons name="sparkles" size={18} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.brandName}>InterClue</Text>
          <Text style={styles.tagline}>Practice Smarter. Interview Better.</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.navIconBtn} onPress={onBack} accessibilityLabel="Back page">
          <Ionicons name="arrow-back" size={16} color={colors.text} />
          <Text style={styles.navIconText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navIconBtn} onPress={onRefresh} accessibilityLabel="Refresh page">
          <Ionicons name="refresh" size={16} color={colors.text} />
          <Text style={styles.navIconText}>Refresh</Text>
        </TouchableOpacity>

        {/* Streak Counter */}
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color="#F59E0B" />
          <Text style={styles.streakText}>{streak}d</Text>
        </View>

        {/* Pro Pill or Upgrade */}
        <TouchableOpacity
          style={[styles.proBadge, isPro ? styles.proActive : styles.proUpgrade]}
          onPress={onOpenUpgrade}
        >
          <Ionicons name="diamond" size={14} color={isPro ? '#38BDF8' : '#F59E0B'} />
          <Text style={[styles.proText, isPro ? styles.proActiveText : styles.proUpgradeText]}>
            {isPro ? 'PRO' : 'UPGRADE'}
          </Text>
        </TouchableOpacity>

        {/* Avatar */}
        <TouchableOpacity style={styles.avatarButton} onPress={onOpenProfile}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {user?.full_name ? user.full_name[0] : 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navIconText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  streakText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  proActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  proUpgrade: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  proText: {
    fontSize: 11,
    fontWeight: '800',
  },
  proActiveText: {
    color: '#38BDF8',
  },
  proUpgradeText: {
    color: '#F59E0B',
  },
  avatarButton: {
    marginLeft: 2,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
