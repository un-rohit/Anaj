import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function FarmerLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { borderTopColor: '#e5e7eb', height: 64 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: t('nav.home', 'होम'), tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} /> }}
      />
      <Tabs.Screen
        name="products"
        options={{ title: t('nav.products', 'उत्पाद'), tabBarIcon: ({ color }) => <TabIcon emoji="🌾" color={color} /> }}
      />
      <Tabs.Screen
        name="requests"
        options={{ title: t('nav.requests', 'अनुरोध'), tabBarIcon: ({ color }) => <TabIcon emoji="📋" color={color} /> }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: t('nav.history', 'इतिहास'), tabBarIcon: ({ color }) => <TabIcon emoji="📊" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('nav.profile', 'प्रोफाइल'), tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} /> }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 22, opacity: color === '#16a34a' ? 1 : 0.5 }}>{emoji}</Text>;
}
