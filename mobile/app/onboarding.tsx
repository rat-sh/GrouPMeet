import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useApi } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function OnboardingScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const { apiWithAuth } = useApi();
  const queryClient = useQueryClient();

  const { mutate: verifyPhone, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await apiWithAuth({
        method: "POST",
        url: "/users/verify-phone",
        data: { phoneNumber },
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate user data so the app knows we are verified
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      Alert.alert(
        "Verification Failed",
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    },
  });

  const handleNext = () => {
    if (phoneNumber.length < 5) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number.");
      return;
    }
    verifyPhone();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0D0D0F" }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 40 }}>
          {/* Header */}
          <Pressable 
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#1A1A1D", alignItems: "center", justifyContent: "center", marginBottom: 32 }}
          >
            <Ionicons name="arrow-back" size={20} color="#F4A261" />
          </Pressable>

          <Text style={{ color: "#FFF", fontSize: 28, fontWeight: "800", marginBottom: 8 }}>
            What's your number?
          </Text>
          <Text style={{ color: "#6B6B70", fontSize: 15, marginBottom: 40, lineHeight: 22 }}>
            We need your phone number to uniquely identify your account and connect you with friends.
          </Text>

          {/* Input Area */}
          <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 2, borderBottomColor: "#F4A261", paddingBottom: 8 }}>
            <Ionicons name="call" size={20} color="#F4A261" style={{ marginRight: 12 }} />
            <TextInput
              style={{ flex: 1, color: "#FFF", fontSize: 20, fontWeight: "600" }}
              placeholder="+1 234 567 8900"
              placeholderTextColor="#3A3A45"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              autoFocus
            />
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Next Button */}
          <Pressable
            onPress={handleNext}
            disabled={isPending}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#E08F50" : "#F4A261",
              paddingVertical: 16,
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              opacity: isPending ? 0.7 : 1,
            })}
          >
            {isPending ? (
              <ActivityIndicator color="#0D0D0F" />
            ) : (
              <Text style={{ color: "#0D0D0F", fontSize: 16, fontWeight: "700" }}>
                Complete Profile
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
