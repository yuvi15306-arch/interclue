import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuthStore } from '../store/useAuthStore';
import { RoleType, ExperienceLevel, QuestionCategory } from '../types';

const ROLES: RoleType[] = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Python Developer',
  'Java Developer',
  'Data Analyst',
  'Data Scientist',
  'Product Manager',
  'UI/UX Designer',
];

const LEVELS: ExperienceLevel[] = ['Beginner', 'Junior', 'Mid-Level', 'Senior'];
const TYPES: QuestionCategory[] = ['Mixed', 'Technical', 'Behavioral', 'HR', 'Situational'];

export const OnboardingScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [authProvider, setAuthProvider] = useState<'supabase' | 'standard'>('supabase');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleType>('Full Stack Developer');
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel>('Junior');
  const [selectedType, setSelectedType] = useState<QuestionCategory>('Mixed');

  const { login, register, supabaseLogin, supabaseSignup, demoLogin, isLoading, error } = useAuthStore();

  const handleSubmit = async () => {
    if (isSignUp) {
      if (!email || !password || !fullName) return;
      if (authProvider === 'supabase') {
        await supabaseSignup(email, password, fullName, selectedRole, selectedLevel, selectedType);
      } else {
        await register(email, password, fullName, selectedRole, selectedLevel, selectedType);
      }
    } else {
      if (!email || !password) return;
      if (authProvider === 'supabase') {
        await supabaseLogin(email, password);
      } else {
        await login(email, password);
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Brand Hero */}
      <View style={styles.heroSection}>
        <View style={styles.logoBadge}>
          <Ionicons name="sparkles" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.brandTitle}>InterClue</Text>
        <Text style={styles.tagline}>Practice Smarter. Interview Better.</Text>
        <Text style={styles.heroDesc}>
          AI-powered mock interviews, instant answer evaluation, ATS resume scoring, and speech analytics.
        </Text>
      </View>

      {/* Auth Box */}
      <View style={styles.card}>
        {/* Toggle Mode */}
        <View style={styles.tabToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, isSignUp && styles.toggleBtnActive]}
            onPress={() => setIsSignUp(true)}
          >
            <Text style={[styles.toggleBtnText, isSignUp && styles.toggleBtnTextActive]}>
              Create Account
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, !isSignUp && styles.toggleBtnActive]}
            onPress={() => setIsSignUp(false)}
          >
            <Text style={[styles.toggleBtnText, !isSignUp && styles.toggleBtnTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Inputs */}
        {isSignUp && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alex Rivera"
              placeholderTextColor={colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="candidate@university.edu"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Role & Experience Selection on Signup */}
        {isSignUp && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Role</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsRow}>
                {ROLES.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.rolePill, selectedRole === r && styles.rolePillActive]}
                    onPress={() => setSelectedRole(r)}
                  >
                    <Text style={[styles.rolePillText, selectedRole === r && styles.rolePillTextActive]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Experience Level</Text>
              <View style={styles.levelsRow}>
                {LEVELS.map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    style={[styles.levelPill, selectedLevel === lvl && styles.levelPillActive]}
                    onPress={() => setSelectedLevel(lvl)}
                  >
                    <Text style={[styles.levelPillText, selectedLevel === lvl && styles.levelPillTextActive]}>
                      {lvl}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Auth Provider Toggle */}
        <View style={styles.providerSelector}>
          <TouchableOpacity
            style={[styles.providerToggleBtn, authProvider === 'supabase' && styles.providerToggleBtnActive]}
            onPress={() => setAuthProvider('supabase')}
          >
            <Ionicons name="shield-checkmark" size={14} color={authProvider === 'supabase' ? colors.accent : colors.textMuted} />
            <Text style={[styles.providerToggleText, authProvider === 'supabase' && styles.providerToggleTextActive]}>
              Supabase Auth
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.providerToggleBtn, authProvider === 'standard' && styles.providerToggleBtnActive]}
            onPress={() => setAuthProvider('standard')}
          >
            <Ionicons name="mail-outline" size={14} color={authProvider === 'standard' ? colors.accent : colors.textMuted} />
            <Text style={[styles.providerToggleText, authProvider === 'standard' && styles.providerToggleTextActive]}>
              Direct Auth
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>
              {isSignUp
                ? authProvider === 'supabase'
                  ? 'Sign Up with Supabase'
                  : 'Start Free Interview Prep'
                : authProvider === 'supabase'
                ? 'Sign In with Supabase'
                : 'Sign In to InterClue'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Instant Demo One-Click Access */}
        <TouchableOpacity style={styles.demoBtn} onPress={demoLogin}>
          <Ionicons name="flash" size={16} color={colors.accent} />
          <Text style={styles.demoBtnText}>One-Click Demo Student Access</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 4,
  },
  heroDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    maxWidth: 320,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.dangerLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rolePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rolePillActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderColor: colors.primary,
  },
  rolePillText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  rolePillTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  levelsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  levelPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  levelPillActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderColor: colors.primary,
  },
  levelPillText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  levelPillTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  providerSelector: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  providerToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  providerToggleBtnActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: colors.accent,
  },
  providerToggleText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  providerToggleTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  demoBtnText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
});
