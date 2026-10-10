import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';

// Phase 4 will connect this to real farmer data and API
export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.greeting}>{t('home.greeting', { name: '...' })}</Text>
        <Text style={styles.note}>Phase 4 — Farmer Home Dashboard</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 12, textAlign: 'center' },
  note: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
});
