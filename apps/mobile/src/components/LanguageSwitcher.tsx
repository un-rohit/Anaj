/**
 * Language Switch Component (for Settings screen)
 * Allows users to change their language at any time from the Profile/Settings screen.
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '@/hooks/useLanguage';
import type { AppLanguage } from '@/i18n';

const OPTIONS: { code: AppLanguage; label: string; sublabel: string }[] = [
  { code: 'HI', label: 'हिन्दी', sublabel: 'Hindi' },
  { code: 'EN', label: 'English', sublabel: 'अंग्रेज़ी' },
];

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('settings.selectLanguage')}</Text>
      <View style={styles.options}>
        {OPTIONS.map((opt) => {
          const isActive = language === opt.code;
          return (
            <TouchableOpacity
              key={opt.code}
              onPress={() => void setLanguage(opt.code)}
              style={[styles.option, isActive && styles.optionActive]}
              activeOpacity={0.75}
              accessibilityRole="radio"
              accessibilityState={{ checked: isActive }}
            >
              <Text style={[styles.optionLabel, isActive && styles.optionLabelActive]}>
                {opt.label}
              </Text>
              <Text style={styles.optionSublabel}>{opt.sublabel}</Text>
              {isActive && <Text style={styles.tick}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  options: { flexDirection: 'row', gap: 12 },
  option: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  optionActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  optionLabelActive: { color: '#16a34a' },
  optionSublabel: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  tick: { fontSize: 18, color: '#16a34a', marginTop: 8 },
});
