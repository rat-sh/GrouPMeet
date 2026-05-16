import { Stack } from "expo-router";
import "../global.css";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MMKV } from "react-native-mmkv";
import AuthSync from "@/components/AuthSync";
import SocketConnection from "@/components/SocketConnection";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// Initialize ultra-fast MMKV storage for Clerk tokens using Nitro/JSI
const clerkStorage = new MMKV({ id: 'clerk-cache' });

const customTokenCache = {
  getToken: (key: string) => {
    try {
      return clerkStorage.getString(key) || null;
    } catch (err) {
      return null;
    }
  },
  saveToken: (key: string, value: string) => {
    try {
      clerkStorage.set(key, value);
    } catch (err) {
      return;
    }
  },
};

// Prevent the splash screen from auto-hiding before auth is loaded.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env.local"
  );
}

const SplashHandler = () => {
  const { isLoaded } = useAuth();
  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);
  return null;
};

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={customTokenCache} publishableKey={publishableKey}>
      <QueryClientProvider client={queryClient}>
        <SplashHandler />
        <AuthSync />
        <SocketConnection />
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0D0D0F" },
          }}
        >
          <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
          <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
          <Stack.Screen
            name="new-chat"
            options={{
              animation: "slide_from_bottom",
              presentation: "modal",
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="new-group"
            options={{
              animation: "slide_from_bottom",
              presentation: "modal",
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="chat"
            options={{ animation: "slide_from_right" }}
          />
        </Stack>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
