import { Redirect, Tabs } from "expo-router";
import React from "react";
import { useAuth } from "@clerk/expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";
import { useSocketStore } from "@/lib/socket";
import { useAppTheme, useModeStore } from "@/lib/modeStore";
import { MessageCircle, Users, User } from "lucide-react-native";

import { useMe } from "@/hooks/useUsers";

const TabsLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { data: me, isLoading: isLoadingMe } = useMe();
  const insets = useSafeAreaInsets();
  const unreadChats = useSocketStore((s) => s.unreadChats);
  const hasUnread = unreadChats.size > 0;

  const theme = useAppTheme();

  if (!isLoaded || (isSignedIn && isLoadingMe)) return null;
  if (!isSignedIn) return <Redirect href="/(auth)" />;
  
  // Intercept users who haven't completed their profile
  if (me && !me.phoneNumber) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.bg,
          borderTopColor: theme.cardBg,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <MessageCircle
                size={22}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
              {hasUnread && (
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -4,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.accent,
                  }}
                />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="group"
        options={{
          title: useModeStore.getState().mode === "education" ? "Channels" : useModeStore.getState().mode === "professional" ? "Workspaces" : "Groups",
          tabBarIcon: ({ color, size, focused }) => (
            <Users
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <User
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;