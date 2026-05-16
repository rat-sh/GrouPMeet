import { useAuth, useUser } from "@clerk/expo";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useModeStore, modeTheme } from "@/lib/modeStore";

const MENU_SECTIONS = [
  {
    title: "Account",
    items: [
      { icon: "person-outline", label: "Edit Profile", color: "#F4A261" },
      { icon: "shield-checkmark-outline", label: "Privacy & Security", color: "#10B981" },
      { icon: "notifications-outline", label: "Notifications", value: "On", color: "#8B5CF6" },
    ],
  },
  {
    title: "Appearance",
    items: [
      { icon: "moon-outline", label: "Dark Mode", value: "On", color: "#6366F1" },
      { icon: "color-palette-outline", label: "Theme Color", value: "Green", color: "#EC4899" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: "help-circle-outline", label: "Help Center", color: "#F59E0B" },
      { icon: "star-outline", label: "Rate the App", color: "#F4A261" },
      { icon: "information-circle-outline", label: "About GrouPMeet", color: "#3B82F6" },
    ],
  },
];

const ProfileTab = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { mode, setMode } = useModeStore();
  const theme = modeTheme[mode];

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48, alignItems: "center" }}
      >
        <View style={{ width: "100%", maxWidth: 600 }}>
          {/* ── Avatar + Name ── */}
          <View style={{ alignItems: "center", paddingTop: 24, paddingBottom: 8 }}>
            <View style={{ position: "relative" }}>
              <View style={{ borderRadius: 999, borderWidth: 3, borderColor: theme.accent }}>
                <Image
                  source={user?.imageUrl}
                  style={{ width: 96, height: 96, borderRadius: 999 }}
                />
              </View>
              <Pressable style={{ position: "absolute", bottom: 2, right: 2, width: 30, height: 30, borderRadius: 15, backgroundColor: theme.accent, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: theme.bg }}>
                <Ionicons name="camera" size={14} color={theme.bg} />
              </Pressable>
            </View>

            <Text style={{ fontSize: 22, fontWeight: "800", color: theme.text, marginTop: 14 }}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={{ color: theme.textMuted, marginTop: 4, fontSize: 13 }}>
              {user?.emailAddresses[0]?.emailAddress}
            </Text>

            {/* Life Mode Switcher */}
            <View style={{ marginTop: 24, paddingHorizontal: 20, width: "100%" }}>
              <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8, marginLeft: 4 }}>
                Life Mode
              </Text>
              <View style={{ flexDirection: "row", backgroundColor: theme.cardBg, borderRadius: 16, padding: 4 }}>
                {(["personal", "education", "professional"] as const).map((m) => {
                  const isActive = mode === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => setMode(m)}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isActive ? theme.accent : "transparent",
                        borderRadius: 12,
                      }}
                    >
                      <Ionicons 
                        name={m === "personal" ? "chatbubbles" : m === "education" ? "school" : "briefcase"} 
                        size={18} 
                        color={isActive ? "#FFF" : theme.textMuted} 
                      />
                      <Text style={{ color: isActive ? "#FFF" : theme.textMuted, fontSize: 12, fontWeight: "600", marginTop: 4, textTransform: "capitalize" }}>
                        {m}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          {/* ── Menu Sections ── */}
          {MENU_SECTIONS.map((section) => (
            <View key={section.title} style={{ marginTop: 16, marginHorizontal: 20 }}>
              <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8, marginLeft: 4 }}>
                {section.title}
              </Text>
              <View style={{ backgroundColor: theme.cardBg, borderRadius: 16, overflow: "hidden" }}>
                {section.items.map((item, idx) => (
                  <Pressable
                    key={item.label}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      backgroundColor: pressed ? `${theme.accent}10` : "transparent",
                      borderBottomWidth: idx < section.items.length - 1 ? 1 : 0,
                      borderBottomColor: theme.border,
                    })}
                  >
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${item.color}20`, alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={{ flex: 1, marginLeft: 12, color: theme.text, fontWeight: "500", fontSize: 15 }}>{item.label}</Text>
                    {item.value && <Text style={{ color: theme.textMuted, fontSize: 13, marginRight: 6 }}>{item.value}</Text>}
                    <Ionicons name="chevron-forward" size={17} color={theme.textMuted} />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          {/* ── Sign Out ── */}
          <Pressable
            onPress={() => signOut()}
            style={({ pressed }) => ({
              marginHorizontal: 20,
              marginTop: 24,
              backgroundColor: pressed ? "#EF444420" : "#EF444415",
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#EF444430",
            })}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={{ color: "#EF4444", fontWeight: "700", fontSize: 15 }}>Log Out</Text>
            </View>
          </Pressable>

          {/* App version */}
          <Text style={{ color: "#3A3A45", fontSize: 12, textAlign: "center", marginTop: 20 }}>
            GrouPMeet v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileTab;