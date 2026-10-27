import React, { useEffect, useState } from 'react';
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
import { useAuthStore } from '../store/useAuthStore';
import { useInterviewStore } from '../store/useInterviewStore';
import { QuestionBankItem, QuestionCategory } from '../types';
import { apiClient } from '../services/api';
import { speakText, stopSpeaking } from '../services/speech';

interface QuestionBankScreenProps {
  onPracticeQuestion: (qText: string) => void;
}

const INITIAL_QUESTIONS: QuestionBankItem[] = [
  {
    id: 1,
    question_text:
      'Explain how React Virtual DOM diffing reconciles updates to minimize direct DOM writes compared to manual DOM manipulation.',
    category: 'Technical',
    role: 'Frontend Developer',
    difficulty: 'Junior',
    source: 'Curated Bank',
    is_bookmarked: true,
  },
  {
    id: 2,
    question_text:
      'How do you design an idempotent RESTful API, and why is idempotency crucial for payment and order processing systems?',
    category: 'Technical',
    role: 'Backend Developer',
    difficulty: 'Mid-Level',
    source: 'Curated Bank',
    is_bookmarked: false,
  },
  {
    id: 3,
    question_text:
      'Tell me about a time you had a technical disagreement with a team member about system architecture. How did you resolve it?',
    category: 'Behavioral',
    role: 'Full Stack Developer',
    difficulty: 'Junior',
    source: 'Curated Bank',
    is_bookmarked: true,
  },
  {
    id: 4,
    question_text:
      'Walk me through the system architecture of the most complex web application mentioned in your work history or resume.',
    category: 'Technical',
    role: 'Full Stack Developer',
    difficulty: 'Junior',
    source: 'Generated from Resume',
    is_bookmarked: false,
  },
  {
    id: 5,
    question_text:
      'How would you handle a production severity-1 outage where response latency suddenly spikes to 10 seconds under peak traffic?',
    category: 'Situational',
    role: 'Backend Developer',
    difficulty: 'Senior',
    source: 'Curated Bank',
    is_bookmarked: false,
  },
  {
    id: 6,
    question_text:
      'Where do you see yourself in three years, and how does this engineering role align with your long-term career progression?',
    category: 'HR',
    role: 'General',
    difficulty: 'Junior',
    source: 'Curated Bank',
    is_bookmarked: false,
  },
];

export const QuestionBankScreen: React.FC<QuestionBankScreenProps> = ({ onPracticeQuestion }) => {
  const { user } = useAuthStore();
  const { startInterview } = useInterviewStore();

  const [questions, setQuestions] = useState<QuestionBankItem[]>(INITIAL_QUESTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingBank, setIsLoadingBank] = useState(false);
  const [bankMeta, setBankMeta] = useState({ questions_per_category: 55, free_tier_limit: 5, is_pro: false });

  const isPro = user?.subscription_tier !== 'free';
  const categories = ['All', 'Technical', 'Behavioral', 'HR', 'Situational', 'Aptitude', 'Bookmarked'];

  useEffect(() => {
    const loadBank = async () => {
      setIsLoadingBank(true);
      try {
        const params: Record<string, string> = {
          role: user?.profile?.target_role || 'Full Stack Developer',
        };
        if (selectedCat !== 'All' && selectedCat !== 'Bookmarked') {
          params.category = selectedCat;
        }
        const res = await apiClient.get('/question-bank/', { params });
        setBankMeta({
          questions_per_category: res.data.questions_per_category || 55,
          free_tier_limit: res.data.free_tier_limit || 5,
          is_pro: !!res.data.is_pro,
        });
        if (Array.isArray(res.data.questions) && res.data.questions.length > 0) {
          setQuestions(res.data.questions);
        }
      } catch {
        // keep local starter list
      } finally {
        setIsLoadingBank(false);
      }
    };
    loadBank();
    return () => stopSpeaking();
  }, [selectedCat, user?.profile?.target_role, user?.subscription_tier]);

  const filteredQuestions = questions.filter((q) => {
    const matchesCat =
      selectedCat === 'All'
        ? true
        : selectedCat === 'Bookmarked'
        ? q.is_bookmarked
        : q.category.toLowerCase() === selectedCat.toLowerCase();

    const matchesSearch =
      searchQuery === '' ||
      q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.role.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  const toggleBookmark = (id: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, is_bookmarked: !q.is_bookmarked } : q))
    );
  };

  const handleGeneratePersonalized = async () => {
    setIsGenerating(true);
    try {
      const res = await apiClient.post('/question-bank/generate-personalized', null, {
        params: { category: selectedCat === 'All' || selectedCat === 'Bookmarked' ? 'Technical' : selectedCat },
      });
      const newQ: QuestionBankItem = {
        id: Date.now(),
        question_text: res.data.question_text,
        category: (res.data.category as QuestionCategory) || 'Technical',
        role: res.data.role || user?.profile?.target_role || 'Full Stack Developer',
        difficulty: res.data.difficulty || 'Junior',
        source: 'Gemini AI Personalized',
        is_bookmarked: true,
      };
      setQuestions((prev) => [newQ, ...prev]);
    } catch {
      // Local dynamic fallback
      const role = user?.profile?.target_role || 'Full Stack Developer';
      const newQ: QuestionBankItem = {
        id: Date.now(),
        question_text: `Explain how you would architect a real-time event-driven system with WebSocket feeds in ${role}.`,
        category: 'Technical',
        role,
        difficulty: 'Junior',
        source: 'Gemini AI Personalized',
        is_bookmarked: true,
      };
      setQuestions((prev) => [newQ, ...prev]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePractice = async (q: QuestionBankItem) => {
    if (q.is_locked) return;
    await startInterview({
      role: (q.role as any) || 'Full Stack Developer',
      difficulty: (q.difficulty as any) || 'Junior',
      duration: 15,
      interview_type: q.category,
      is_voice: false,
      total_questions: 3,
    });
    onPracticeQuestion(q.question_text);
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions by keyword or role..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Categories Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, selectedCat === cat && styles.catPillActive]}
              onPress={() => setSelectedCat(cat)}
            >
              <Text style={[styles.catText, selectedCat === cat && styles.catTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* AI Generate Prompt Bar */}
      <View style={styles.generateBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.generateTitle}>Personalized Question Engine</Text>
          <Text style={styles.generateSub}>
            {bankMeta.questions_per_category} questions per category. Free tier unlocks {bankMeta.free_tier_limit}. Gemini generates extras for your role.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={handleGeneratePersonalized}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              <Text style={styles.generateBtnText}>Generate</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {!isPro ? (
        <View style={styles.freeBanner}>
          <Ionicons name="lock-closed" size={14} color="#F59E0B" />
          <Text style={styles.freeBannerText}>
            Free plan: {bankMeta.free_tier_limit} questions visible per category. Upgrade to open all {bankMeta.questions_per_category}.
          </Text>
        </View>
      ) : null}

      {/* Questions List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {isLoadingBank ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />
        ) : filteredQuestions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No questions found</Text>
            <Text style={styles.emptySub}>Try adjusting your search query or category filters.</Text>
          </View>
        ) : (
          filteredQuestions.map((q) => (
            <View key={q.id} style={styles.questionCard}>
              <View style={styles.cardTop}>
                <View style={styles.tagWrap}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{q.category}</Text>
                  </View>
                  <View style={styles.sourceBadge}>
                    <Text style={styles.sourceBadgeText}>{q.source}</Text>
                  </View>
                </View>

                <TouchableOpacity onPress={() => toggleBookmark(q.id)} style={styles.bookmarkBtn}>
                  <Ionicons
                    name={q.is_bookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={18}
                    color={q.is_bookmarked ? colors.accent : colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.qText}>"{q.question_text}"</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.roleSub}>
                  {q.role} • {q.difficulty}
                </Text>
                {q.is_locked ? (
                  <View style={styles.lockedBtn}>
                    <Ionicons name="lock-closed" size={12} color="#F59E0B" />
                    <Text style={styles.lockedText}>Pro only</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity style={styles.listenMini} onPress={() => speakText(q.question_text)}>
                      <Ionicons name="volume-high" size={12} color={colors.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.practiceBtn} onPress={() => handlePractice(q)}>
                      <Ionicons name="play" size={12} color="#FFFFFF" />
                      <Text style={styles.practiceText}>Practice Now</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },
  catScroll: {
    flexDirection: 'row',
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catPillActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    borderColor: colors.primary,
  },
  catText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  catTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  generateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  generateTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  generateSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  generateBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  freeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  freeBannerText: {
    flex: 1,
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
  },
  lockedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  lockedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  listenMini: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  questionCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tagWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: '700',
  },
  sourceBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sourceBadgeText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  bookmarkBtn: {
    padding: 4,
  },
  qText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    paddingTop: 10,
  },
  roleSub: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  practiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  practiceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
