import { View, ActivityIndicator, Text } from "react-native";
import { useAuth } from "@clerk/expo";
import { useEffect } from "react";
import { router } from "expo-router";

export default function SSOCallback() {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    // Once the session is loaded and active, redirect the user
    if (isLoaded && isSignedIn) {
      router.replace("/(tabs)");
    } else if (isLoaded && !isSignedIn) {
      // In case the authentication flow failed or was cancelled
      // we might want to go back to the auth screen after a short delay
      const timer = setTimeout(() => {
        router.replace("/(auth)");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0D0D0F", justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#fbbf24" />
      <Text style={{ color: "#fff", marginTop: 20, fontFamily: "monospace" }}>Completing sign in...</Text>
    </View>
  );
}
