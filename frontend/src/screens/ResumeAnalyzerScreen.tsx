import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useResumeStore } from '../store/useResumeStore';
import { useAuthStore } from '../store/useAuthStore';
import { useInterviewStore } from '../store/useInterviewStore';

interface ResumeAnalyzerScreenProps {
  onPracticeQuestion: (questionText: string) => void;
  onOpenUpgrade: () => void;
}

export const ResumeAnalyzerScreen: React.FC<ResumeAnalyzerScreenProps> = ({
  onPracticeQuestion,
  onOpenUpgrade,
}) => {
  const { resume, isAnalyzing, analyzeResumeText, uploadResumeFile, error } = useResumeStore();
  const { user } = useAuthStore();
  const { startInterview } = useInterviewStore();

  const [inputResume, setInputResume] = useState('');
  const isPro = user?.subscription_tier !== 'free';

  const handleAnalyze = async () => {
    if (!inputResume.trim()) return;
    const role = user?.profile?.target_role || 'Full Stack Developer';
    await analyzeResumeText(inputResume, role);
  };

  const handlePickResumeFile = () => {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.txt,application/pdf,text/plain';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const role = user?.profile?.target_role || 'Full Stack Developer';
      await uploadResumeFile(file, role);
    };
    input.click();
  };

  const handlePracticeFromResume = async (qText: string) => {
    const role = user?.profile?.target_role || 'Full Stack Developer';
    const level = user?.profile?.experience_level || 'Junior';

    await startInterview({
      role,
      difficulty: level,
      duration: 15,
      interview_type: 'Technical',
      is_voice: false,
      total_questions: 3,
    });
    onPracticeQuestion(qText);
  };

  const atsScore = resume?.ats_score || 88.5;
  let atsColor = colors.success;
  if (atsScore < 60) atsColor = colors.danger;
  else if (atsScore < 80) atsColor = colors.warning;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>ATS Resume Intelligence</Text>
          <Text style={styles.subtitle}>
            Send a PDF/TXT resume or paste text. Gemini scores ATS fit and writes interview questions from your experience.
          </Text>
        </View>
      </View>

      {/* Input / Upload Box */}
      <View style={styles.uploadCard}>
        <Text style={styles.boxTitle}>Paste Resume Text or Experience</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Paste resume summary, skills, and work history here..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          value={inputResume}
          onChangeText={setInputResume}
        />

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.sampleFillBtn} onPress={handlePickResumeFile}>
            <Ionicons name="cloud-upload-outline" size={13} color={colors.accent} />
            <Text style={styles.sampleFillText}>Send resume file (PDF / TXT)</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.uploadError}>{error}</Text> : null}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.sampleFillBtn}
            onPress={() =>
              setInputResume(
                `Jane Smith | Software Engineer\njanesmith@gmail.com | github.com/janesmith\n\nEXPERIENCE:\nSoftware Engineer at CloudScale (2022 - Present)\n- Developed microservices in FastAPI and PostgreSQL processing 100k events/day.\n- Decreased average API response latency by 35% using Redis caching and asynchronous workers.\n- Implemented OAuth2 JWT authentication and automated CI/CD test suites with 92% coverage.\n\nSKILLS:\nPython, TypeScript, React, FastAPI, PostgreSQL, Docker, AWS, Redis, GraphQL, Git.\n\nEDUCATION:\nB.S. in Computer Science (2018 - 2022)`
              )
            }
          >
            <Ionicons name="sparkles-outline" size={13} color={colors.accent} />
            <Text style={styles.sampleFillText}>Load Sample Resume</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.analyzeBtn, !inputResume.trim() && styles.analyzeBtnDisabled]}
            onPress={handleAnalyze}
            disabled={!inputResume.trim() || isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.analyzeBtnText}>Analyze Resume</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Section */}
      {resume && (
        <View style={styles.resultsContainer}>
          {/* ATS Gauge Scorecard */}
          <View style={styles.atsScorecard}>
            <View style={styles.atsScoreCircle}>
              <Text style={[styles.atsNumber, { color: atsColor }]}>{atsScore.toFixed(0)}</Text>
              <Text style={styles.atsScale}>/ 100</Text>
            </View>
            <View style={styles.atsDetails}>
              <Text style={styles.atsTitle}>
                {atsScore >= 80
                  ? 'Strong ATS Match (Interview Ready) 🎯'
                  : atsScore >= 65
                  ? 'Moderate ATS Score (Room for Optimization)'
                  : 'Low ATS Score (Action Required)'}
              </Text>
              <Text style={styles.atsSub}>
                Detected Role: <Text style={{ color: colors.accent, fontWeight: '700' }}>{resume.detected_role || 'Software Engineer'}</Text>
                {' • '}Gemini ATS evaluation
              </Text>
            </View>
          </View>

          {/* Parsed Skills Badges */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Detected Skills ({resume.parsed_skills.length})</Text>
            <View style={styles.skillsWrap}>
              {resume.parsed_skills.map((skill, idx) => (
                <View key={idx} style={styles.skillPill}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Strengths & Weaknesses */}
          <View style={styles.sectionCard}>
            <View style={styles.subHeadingRow}>
              <Ionicons name="shield-checkmark" size={16} color={colors.success} />
              <Text style={[styles.sectionHeading, { color: colors.success }]}>ATS Strengths</Text>
            </View>
            {resume.strengths.map((str, idx) => (
              <View key={idx} style={styles.pointRow}>
                <Ionicons name="checkmark" size={14} color={colors.success} />
                <Text style={styles.pointText}>{str}</Text>
              </View>
            ))}

            <View style={[styles.subHeadingRow, { marginTop: 14 }]}>
              <Ionicons name="alert-circle" size={16} color={colors.warning} />
              <Text style={[styles.sectionHeading, { color: colors.warning }]}>
                ATS Weaknesses & Keywords to Add
              </Text>
            </View>
            {resume.weaknesses.map((w, idx) => (
              <View key={idx} style={styles.pointRow}>
                <Ionicons name="close" size={14} color={colors.warning} />
                <Text style={styles.pointText}>{w}</Text>
              </View>
            ))}
          </View>

          {/* Tailored Interview Questions Generated from Resume */}
          <View style={styles.sectionCard}>
            <View style={styles.subHeadingRow}>
              <Ionicons name="help-circle" size={18} color={colors.accent} />
              <Text style={[styles.sectionHeading, { color: colors.accent }]}>
                Interview Questions Generated from Resume
              </Text>
            </View>
            <Text style={styles.questionsIntro}>
              Hiring managers will probe these specific areas based on your resume achievements:
            </Text>

            {resume.generated_questions.map((q, idx) => (
              <View key={idx} style={styles.questionItem}>
                <Text style={styles.questionIndex}>0{idx + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.questionText}>"{q}"</Text>
                  <TouchableOpacity
                    style={styles.practiceBtn}
                    onPress={() => handlePracticeFromResume(q)}
                  >
                    <Ionicons name="play" size={12} color="#FFFFFF" />
                    <Text style={styles.practiceBtnText}>Practice in Mock Room</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  uploadCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  boxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 12,
    color: colors.text,
    fontSize: 13,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sampleFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sampleFillText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '600',
  },
  analyzeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  analyzeBtnDisabled: {
    opacity: 0.5,
  },
  analyzeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  uploadError: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultsContainer: {
    gap: 16,
  },
  atsScorecard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.4)',
    gap: 16,
  },
  atsScoreCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  atsNumber: {
    fontSize: 26,
    fontWeight: '900',
  },
  atsScale: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '700',
  },
  atsDetails: {
    flex: 1,
  },
  atsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 18,
  },
  atsSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  subHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  skillPill: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skillText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  pointText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  questionsIntro: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 15,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questionIndex: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accent,
    marginTop: 2,
  },
  questionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 18,
  },
  practiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
    gap: 4,
  },
  practiceBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
