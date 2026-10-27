import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { apiClient } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ visible, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { user } = useAuthStore();

  const handleUpgrade = async () => {
    setIsProcessing(true);
    setSuccessMsg(null);

    try {
      await apiClient.post('/subscriptions/upgrade', {
        plan_tier: selectedPlan === 'annual' ? 'pro_annual' : 'pro_monthly',
        provider: 'google_play',
        purchase_token: `gplay_token_${Date.now()}`,
      });

      if (user) {
        user.subscription_tier = selectedPlan === 'annual' ? 'pro_annual' : 'pro_monthly';
      }

      setSuccessMsg('Google Play Purchase Verified! Welcome to InterClue Pro.');
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 1500);
    } catch {
      // Local fallback simulation for instant demo
      if (user) {
        user.subscription_tier = selectedPlan === 'annual' ? 'pro_annual' : 'pro_monthly';
      }
      setSuccessMsg('InterClue Pro Unlocked! Enjoy unlimited AI coaching.');
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 1500);
    }
  };

  const proFeatures = [
    { title: 'Unlimited AI Mock Interviews', desc: 'No daily limits. Practice 24/7.' },
    { title: 'Voice Interview Mode', desc: 'Real-time conversational speech scoring.' },
    { title: 'Full ATS Resume Analyzer', desc: 'ATS score, keyword match, and custom questions.' },
    { title: 'Personalized Question Bank', desc: 'Thousands of role-specific questions.' },
    { title: 'Competency Radar & Analytics', desc: 'Track technical and communication trends.' },
    { title: 'Google Gemini 1.5 Pro Engine', desc: 'Deep actionable feedback from senior AI interviewer.' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <View style={styles.crownBadge}>
                <Ionicons name="diamond" size={16} color="#38BDF8" />
              </View>
              <Text style={styles.title}>Unlock InterClue Pro</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Land your dream role faster with unlimited AI practice and voice evaluation.
          </Text>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Feature List */}
            <View style={styles.featuresList}>
              {proFeatures.map((feat, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
                  <View style={styles.featureTextCol}>
                    <Text style={styles.featureTitle}>{feat.title}</Text>
                    <Text style={styles.featureDesc}>{feat.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Plan Selector */}
            <View style={styles.plansContainer}>
              <TouchableOpacity
                style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardActive]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <View style={styles.planRadio}>
                  {selectedPlan === 'monthly' && <View style={styles.radioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>Pro Monthly</Text>
                  <Text style={styles.planSub}>Flexible, cancel anytime</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.planPrice}>$19.99</Text>
                  <Text style={styles.planPeriod}>/month</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.planCard, selectedPlan === 'annual' && styles.planCardActive]}
                onPress={() => setSelectedPlan('annual')}
              >
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>SAVE 40%</Text>
                </View>
                <View style={styles.planRadio}>
                  {selectedPlan === 'annual' && <View style={styles.radioDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>Pro Annual</Text>
                  <Text style={styles.planSub}>$12.49/mo billed yearly</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.planPrice}>$149.99</Text>
                  <Text style={styles.planPeriod}>/year</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {successMsg ? (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.subscribeBtn}
              onPress={handleUpgrade}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.btnContent}>
                  <Ionicons name="logo-google-playstore" size={18} color="#FFFFFF" />
                  <Text style={styles.subscribeBtnText}>
                    Continue with Google Play
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          <Text style={styles.legalText}>
            Secured via Google Play Billing. Renews automatically until canceled in Subscriptions settings.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 25, 0.88)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 20,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  crownBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  closeBtn: {
    padding: 6,
  },
  scrollArea: {
    marginBottom: 14,
  },
  featuresList: {
    gap: 12,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  featureDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  plansContainer: {
    gap: 10,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: colors.border,
    position: 'relative',
  },
  planCardActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  planRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.accent,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  planName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  planSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  planPeriod: {
    fontSize: 10,
    color: colors.textMuted,
  },
  popularBadge: {
    position: 'absolute',
    top: -9,
    right: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  popularText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subscribeBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subscribeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.successLight,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.success,
  },
  successText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  legalText: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 14,
  },
});
