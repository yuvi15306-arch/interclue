import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { MetricCard } from '../components/MetricCard';

export const AdminScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'subscriptions'>('metrics');
  const [searchUser, setSearchUser] = useState('');

  const [usersList, setUsersList] = useState([
    { id: 1, name: 'Alex Rivera', email: 'demo@interclue.ai', role: 'Full Stack Developer', tier: 'Pro Monthly', interviews: 6, score: 8.4, active: true },
    { id: 2, name: 'Jordan Smith', email: 'jordan.s@mit.edu', role: 'Frontend Developer', tier: 'Free', interviews: 3, score: 7.9, active: true },
    { id: 3, name: 'Priya Sharma', email: 'priya.ai@stanford.edu', role: 'Data Scientist', tier: 'Pro Monthly', interviews: 12, score: 9.1, active: true },
    { id: 4, name: 'Marcus Chen', email: 'mchen@berkeley.edu', role: 'Backend Developer', tier: 'Pro Annual', interviews: 8, score: 8.6, active: true },
    { id: 5, name: 'Elena Rostova', email: 'elena@gmail.com', role: 'Product Manager', tier: 'Free', interviews: 1, score: 6.8, active: false },
  ]);

  const toggleUserStatus = (id: number) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.role.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Admin Title */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Ionicons name="shield-checkmark" size={16} color={colors.accent} />
          <Text style={styles.badgeText}>ADMIN CONSOLE</Text>
        </View>
        <Text style={styles.title}>InterClue Platform Control</Text>
        <Text style={styles.subtitle}>Platform metrics, user directories, and subscriptions</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(['metrics', 'users', 'subscriptions'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'metrics' && (
        <View style={styles.metricsContainer}>
          <View style={styles.gridRow}>
            <MetricCard
              title="Total Candidates"
              value="1,420"
              icon="people"
              trend="+18.2%"
              isPositive={true}
              iconColor={colors.accent}
            />
            <MetricCard
              title="Pro Subscriptions"
              value="385"
              icon="diamond"
              trend="+24.5%"
              isPositive={true}
              iconColor="#38BDF8"
            />
          </View>

          <View style={styles.gridRow}>
            <MetricCard
              title="Interviews Conducted"
              value="8,940"
              icon="mic"
              trend="+32.0%"
              isPositive={true}
              iconColor={colors.success}
            />
            <MetricCard
              title="Monthly Run Rate (MRR)"
              value="$7,696"
              icon="card"
              trend="+21.4%"
              isPositive={true}
              iconColor="#F59E0B"
            />
          </View>

          <View style={styles.serviceHealthCard}>
            <Text style={styles.cardHeading}>Infrastructure Health</Text>
            <View style={styles.healthItem}>
              <View style={styles.healthDot} />
              <Text style={styles.healthName}>FastAPI Core Backend</Text>
              <Text style={styles.healthStatus}>Operational (99.98%)</Text>
            </View>
            <View style={styles.healthItem}>
              <View style={styles.healthDot} />
              <Text style={styles.healthName}>Google Gemini 1.5 Pro</Text>
              <Text style={styles.healthStatus}>142ms Avg Latency</Text>
            </View>
            <View style={styles.healthItem}>
              <View style={styles.healthDot} />
              <Text style={styles.healthName}>Neon PostgreSQL Pool</Text>
              <Text style={styles.healthStatus}>12/50 Connections</Text>
            </View>
            <View style={styles.healthItem}>
              <View style={styles.healthDot} />
              <Text style={styles.healthName}>STT Engine (Deepgram/Whisper)</Text>
              <Text style={styles.healthStatus}>Ready</Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'users' && (
        <View style={styles.usersContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search candidate by name, email, or role..."
            placeholderTextColor={colors.textMuted}
            value={searchUser}
            onChangeText={setSearchUser}
          />

          {filteredUsers.map((u) => (
            <View key={u.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{u.name}</Text>
                <Text style={styles.userEmail}>{u.email}</Text>
                <Text style={styles.userMeta}>
                  {u.role} • {u.tier} • {u.interviews} Sessions (Avg: {u.score})
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.statusToggleBtn, u.active ? styles.statusActive : styles.statusDisabled]}
                onPress={() => toggleUserStatus(u.id)}
              >
                <Text style={styles.statusToggleText}>{u.active ? 'Active' : 'Disabled'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {activeTab === 'subscriptions' && (
        <View style={styles.subsContainer}>
          <View style={styles.planManagerCard}>
            <Text style={styles.cardHeading}>Active Subscription Tiers</Text>

            <View style={styles.subTierRow}>
              <View>
                <Text style={styles.tierName}>Free Student Starter</Text>
                <Text style={styles.tierMeta}>3 interviews/day • Basic evaluations</Text>
              </View>
              <Text style={styles.tierPrice}>$0.00</Text>
            </View>

            <View style={styles.subTierRow}>
              <View>
                <Text style={styles.tierName}>InterClue Pro Monthly</Text>
                <Text style={styles.tierMeta}>Unlimited • Voice Mode • Full ATS Scanner</Text>
              </View>
              <Text style={styles.tierPrice}>$19.99/mo</Text>
            </View>

            <View style={styles.subTierRow}>
              <View>
                <Text style={styles.tierName}>InterClue Pro Annual</Text>
                <Text style={styles.tierMeta}>All Pro features • Billed $149.99 yearly</Text>
              </View>
              <Text style={styles.tierPrice}>$149.99/yr</Text>
            </View>
          </View>
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
  header: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
  },
  metricsContainer: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceHealthCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 6,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 10,
  },
  healthName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  healthStatus: {
    fontSize: 11,
    color: colors.textMuted,
  },
  usersContainer: {
    gap: 10,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    color: colors.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 6,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  userEmail: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  userMeta: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 4,
  },
  statusToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: colors.successLight,
  },
  statusDisabled: {
    backgroundColor: colors.dangerLight,
  },
  statusToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  subsContainer: {
    gap: 12,
  },
  planManagerCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subTierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  tierName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  tierMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  tierPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accent,
  },
});
