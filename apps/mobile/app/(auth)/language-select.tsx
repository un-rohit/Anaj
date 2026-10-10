/**
 * Language Selection Screen
 *
 * Shown ONLY on first launch (no saved language preference).
 * After the user selects a language and taps Continue:
 *  - The preference is persisted to AsyncStorage
 *  - i18next switches to the selected language immediately
 *  - The user is navigated to the Welcome screen
 *  - This screen will NOT appear again until app data is cleared
 *
 * Design principles:
 *  - Large, easily tappable buttons (min 64px height)
 *  - Shows both Hindi and English labels on every element
 *    so the user can understand the screen regardless of current language
 *  - No login or registration required
 */

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import type { AppLanguage } from '@/i18n';
import { useLanguageStore } from '@/store/language-store';

// ---------------------------------------------------------------------------
// Static strings shown before i18n is switched
// Both Hindi and English are shown simultaneously so the screen is universally
// understandable regardless of what language was previously set.
// ---------------------------------------------------------------------------
const STATIC = {
  title: {
    hi: 'अपनी पसंदीदा भाषा चुनें',
    en: 'Choose Your Preferred Language',
  },
  continue: {
    hi: 'जारी रखें',
    en: 'Continue',
  },
} as const;

const LANGUAGE_OPTIONS: { code: AppLanguage; label: string; sublabel: string; flag: string }[] = [
  { code: 'HI', label: 'हिन्दी', sublabel: 'Hindi', flag: '🇮🇳' },
  { code: 'EN', label: 'English', sublabel: 'अंग्रेज़ी', flag: '🇬🇧' },
];

export default function LanguageSelectScreen() {
  const [selected, setSelected] = useState<AppLanguage>('HI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const continueLabel =
    selected === 'HI'
      ? STATIC.continue.hi
      : STATIC.continue.en;

  async function handleContinue() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Persists to AsyncStorage + updates i18next + marks isFirstLaunch = false
      await setLanguage(selected);
      router.replace('/(auth)/welcome');
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />

      <View style={styles.container}>
        {/* Logo / App name */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🌾</Text>
          </View>
          <Text style={styles.appNameHindi}>अनाज</Text>
          <Text style={styles.appNameEnglish}>ANAJ</Text>
        </View>

        {/* Title — shown in both languages simultaneously */}
        <View style={styles.titleSection}>
          <Text style={styles.titleHindi}>{STATIC.title.hi}</Text>
          <Text style={styles.titleEnglish}>{STATIC.title.en}</Text>
        </View>

        {/* Language options */}
        <View style={styles.optionsContainer}>
          {LANGUAGE_OPTIONS.map((option) => {
            const isSelected = selected === option.code;
            return (
              <TouchableOpacity
                key={option.code}
                onPress={() => setSelected(option.code)}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`${option.label} — ${option.sublabel}`}
              >
                {/* Selection indicator */}
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>

                {/* Flag + Labels */}
                <View style={styles.optionContent}>
                  <Text style={styles.optionFlag}>{option.flag}</Text>
                  <View>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {option.label}
                    </Text>
                    <Text style={styles.optionSublabel}>{option.sublabel}</Text>
                  </View>
                </View>

                {/* Checkmark */}
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Continue button */}
        <TouchableOpacity
          onPress={() => void handleContinue()}
          style={[styles.continueButton, isSubmitting && styles.continueButtonDisabled]}
          activeOpacity={0.8}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel={continueLabel}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>{continueLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const COLORS = {
  background: '#ffffff',
  primary: '#16a34a',       // ANAJ agricultural green
  primaryLight: '#f0fdf4',  // Very light green for selected state
  primaryBorder: '#86efac',
  text: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  white: '#ffffff',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Logo section
  logoSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 44,
  },
  appNameHindi: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    fontFamily: Platform.select({ android: 'sans-serif-medium', default: undefined }),
  },
  appNameEnglish: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    letterSpacing: 4,
    marginTop: 2,
  },

  // Title
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  titleHindi: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 8,
  },
  titleEnglish: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Language options
  optionsContainer: {
    width: '100%',
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 80,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionFlag: {
    fontSize: 32,
  },
  optionLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 30,
  },
  optionLabelSelected: {
    color: COLORS.primary,
  },
  optionSublabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },

  // Continue button
  continueButton: {
    width: '100%',
    height: 64,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
