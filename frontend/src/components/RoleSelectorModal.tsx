import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { RoleType, ExperienceLevel, QuestionCategory } from '../types';

interface RoleSelectorModalProps {
  visible: boolean;
  currentRole: RoleType;
  currentLevel: ExperienceLevel;
  onClose: () => void;
  onSave: (role: RoleType, level: ExperienceLevel) => void;
}

const ROLES: RoleType[] = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Java Developer',
  'Python Developer',
  'Data Analyst',
  'Data Scientist',
  'Product Manager',
  'UI/UX Designer',
];

const LEVELS: ExperienceLevel[] = ['Beginner', 'Junior', 'Mid-Level', 'Senior'];

export const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({
  visible,
  currentRole,
  currentLevel,
  onClose,
  onSave,
}) => {
  const [selectedRole, setSelectedRole] = useState<RoleType>(currentRole);
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel>(currentLevel);

  const handleSave = () => {
    onSave(selectedRole, selectedLevel);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Target Role & Seniority</Text>
              <Text style={styles.subtitle}>AI questions adjust dynamically to this role</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Seniority Level */}
            <Text style={styles.sectionTitle}>Seniority Level</Text>
            <View style={styles.levelsRow}>
              {LEVELS.map((lvl) => {
                const isActive = selectedLevel === lvl;
                return (
                  <TouchableOpacity
                    key={lvl}
                    style={[styles.levelPill, isActive && styles.levelPillActive]}
                    onPress={() => setSelectedLevel(lvl)}
                  >
                    <Text style={[styles.levelText, isActive && styles.levelTextActive]}>
                      {lvl}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Target Role List */}
            <Text style={styles.sectionTitle}>Select Role</Text>
            <View style={styles.rolesList}>
              {ROLES.map((r) => {
                const isSelected = selectedRole === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleCard, isSelected && styles.roleCardSelected]}
                    onPress={() => setSelectedRole(r)}
                  >
                    <View style={styles.roleInfo}>
                      <Ionicons
                        name={
                          r.includes('Developer')
                            ? 'code-slash'
                            : r.includes('Data')
                            ? 'analytics'
                            : r.includes('Product')
                            ? 'briefcase'
                            : 'color-palette'
                        }
                        size={20}
                        color={isSelected ? colors.accent : colors.textMuted}
                      />
                      <Text style={[styles.roleName, isSelected && styles.roleNameSelected]}>
                        {r}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Confirm & Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 25, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
  },
  scrollArea: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 10,
  },
  levelsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  levelPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  levelPillActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderColor: colors.primary,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  levelTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  rolesList: {
    gap: 8,
  },
  roleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleCardSelected: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderColor: colors.primary,
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  roleNameSelected: {
    color: colors.text,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
