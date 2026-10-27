import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuthStore } from '../store/useAuthStore';
import { useInterviewStore } from '../store/useInterviewStore';
import { Header } from '../components/Header';
import { RoleSelectorModal } from '../components/RoleSelectorModal';
import { PaywallModal } from '../components/PaywallModal';

// Screens
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { InterviewRoomScreen } from '../screens/InterviewRoomScreen';
import { EvaluationReportScreen } from '../screens/EvaluationReportScreen';
import { ResumeAnalyzerScreen } from '../screens/ResumeAnalyzerScreen';
import { QuestionBankScreen } from '../screens/QuestionBankScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { SubscriptionScreen } from '../screens/SubscriptionScreen';
import { AdminScreen } from '../screens/AdminScreen';

type TabName = 'dashboard' | 'resume' | 'questions' | 'analytics' | 'subscription' | 'admin';
type SubScreen = 'none' | 'interview_room' | 'evaluation_report';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, user, updateTargetRole } = useAuthStore();
  const { currentQuestion, activeSession, resetInterview } = useInterviewStore();

  const [activeTab, setActiveTab] = useState<TabName>('dashboard');
  const [activeSubScreen, setActiveSubScreen] = useState<SubScreen>('none');
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);

  if (!isAuthenticated) {
    return <OnboardingScreen />;
  }

  const handleStartInterview = () => {
    setActiveSubScreen('interview_room');
  };

  const handleEvaluationReady = () => {
    setActiveSubScreen('evaluation_report');
  };

  const handleContinueNextQuestion = () => {
    if (currentQuestion) {
      setActiveSubScreen('interview_room');
    } else {
      setActiveSubScreen('none');
      setActiveTab('dashboard');
    }
  };

  const handleFinishInterview = () => {
    resetInterview();
    setActiveSubScreen('none');
    setActiveTab('dashboard');
  };

  const handleExitInterview = () => {
    resetInterview();
    setActiveSubScreen('none');
  };

  const handlePracticeQuestionFromOtherScreens = (qText: string) => {
    setActiveSubScreen('interview_room');
  };

  return (
    <View style={styles.container}>
      {/* Top Universal App Header */}
      <Header
        onOpenProfile={() => setRoleModalVisible(true)}
        onOpenUpgrade={() => setPaywallVisible(true)}
      />

      {/* Screen Body */}
      <View style={styles.content}>
        {activeSubScreen === 'interview_room' ? (
          <InterviewRoomScreen
            onEvaluationReady={handleEvaluationReady}
            onExit={handleExitInterview}
          />
        ) : activeSubScreen === 'evaluation_report' ? (
          <EvaluationReportScreen
            onContinue={handleContinueNextQuestion}
            onFinish={handleFinishInterview}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardScreen
                onStartInterview={handleStartInterview}
                onOpenRoleModal={() => setRoleModalVisible(true)}
                onOpenUpgrade={() => setPaywallVisible(true)}
                onOpenResume={() => setActiveTab('resume')}
                onOpenQuestionBank={() => setActiveTab('questions')}
              />
            )}
            {activeTab === 'resume' && (
              <ResumeAnalyzerScreen
                onPracticeQuestion={handlePracticeQuestionFromOtherScreens}
                onOpenUpgrade={() => setPaywallVisible(true)}
              />
            )}
            {activeTab === 'questions' && (
              <QuestionBankScreen
                onPracticeQuestion={handlePracticeQuestionFromOtherScreens}
              />
            )}
            {activeTab === 'analytics' && <AnalyticsScreen />}
            {activeTab === 'subscription' && (
              <SubscriptionScreen onOpenUpgrade={() => setPaywallVisible(true)} />
            )}
            {activeTab === 'admin' && <AdminScreen />}
          </>
        )}
      </View>

      {/* Bottom Modern Navigation Bar (hidden during active interview room to minimize distraction) */}
      {activeSubScreen === 'none' && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('dashboard')}
          >
            <Ionicons
              name={activeTab === 'dashboard' ? 'home' : 'home-outline'}
              size={22}
              color={activeTab === 'dashboard' ? colors.accent : colors.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'dashboard' && styles.tabLabelActive,
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('resume')}
          >
            <Ionicons
              name={activeTab === 'resume' ? 'document-text' : 'document-text-outline'}
              size={22}
              color={activeTab === 'resume' ? colors.accent : colors.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'resume' && styles.tabLabelActive,
              ]}
            >
              Resume
            </Text>
          </TouchableOpacity>

          {/* Central Mock Interview CTA Tab */}
          <TouchableOpacity
            style={styles.centerTabBtn}
            onPress={handleStartInterview}
          >
            <Ionicons name="mic" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('questions')}
          >
            <Ionicons
              name={activeTab === 'questions' ? 'library' : 'library-outline'}
              size={22}
              color={activeTab === 'questions' ? colors.accent : colors.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'questions' && styles.tabLabelActive,
              ]}
            >
              Questions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('analytics')}
          >
            <Ionicons
              name={activeTab === 'analytics' ? 'stats-chart' : 'stats-chart-outline'}
              size={22}
              color={activeTab === 'analytics' ? colors.accent : colors.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'analytics' && styles.tabLabelActive,
              ]}
            >
              Analytics
            </Text>
          </TouchableOpacity>

          {user?.is_admin && (
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('admin')}
            >
              <Ionicons
                name={activeTab === 'admin' ? 'shield-checkmark' : 'shield-outline'}
                size={22}
                color={activeTab === 'admin' ? colors.accent : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'admin' && styles.tabLabelActive,
                ]}
              >
                Admin
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Role Picker Modal */}
      <RoleSelectorModal
        visible={roleModalVisible}
        currentRole={(user?.profile?.target_role as any) || 'Full Stack Developer'}
        currentLevel={(user?.profile?.experience_level as any) || 'Junior'}
        onClose={() => setRoleModalVisible(false)}
        onSave={(role, level) => updateTargetRole(role, level)}
      />

      {/* Google Play Billing Paywall Modal */}
      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabItem: {
    alignItems: 'center',
    paddingVertical: 4,
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.accent,
    fontWeight: '800',
  },
  centerTabBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: colors.surface,
  },
});
