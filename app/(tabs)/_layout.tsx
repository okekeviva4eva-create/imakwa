import { Bell, Compass, Home, PenSquare, User } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { useStore } from '@/lib/store';

export default function TabLayout() {
  const unread = useStore((s) => s.notifications.filter((n) => !n.read).length);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'hsl(150 65% 22%)',
        tabBarInactiveTintColor: 'hsl(150 10% 50%)',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        headerTitleStyle: { fontWeight: '700', fontSize: 20 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Imakwa',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size ?? 22} />,
        }}
      />
      <Tabs.Screen
        name="topics"
        options={{
          title: 'Topics',
          headerTitle: 'Topics',
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size ?? 22} />,
        }}
      />
      <Tabs.Screen
        name="ask-tab"
        options={{
          title: 'Ask',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <PenSquare color={color} size={size ?? 22} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Activity',
          headerTitle: 'Activity',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Bell color={color} size={size ?? 22} />
              {unread > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -4,
                    minWidth: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: 'hsl(0 75% 50%)',
                  }}
                />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size ?? 22} />,
        }}
      />
    </Tabs>
  );
}
