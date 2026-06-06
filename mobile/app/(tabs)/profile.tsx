import { useAuth, useUser } from "@clerk/expo";
import { View, Text, ScrollView, Pressable, Switch } from "react-native";
import { Image } from "expo-image";
import { ArrowLeft, Camera, Moon, Lock, AtSign, Phone, MessageSquare, BookOpen, Briefcase } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useModeStore, useAppTheme, colorPalettes } from "@/lib/modeStore";

const ProfileTab = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { mode, setMode, paletteIndex, setPalette } = useModeStore();
  const theme = useAppTheme();

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48, alignItems: "center" }}
      >
        <View style={{ width: "100%", maxWidth: 600 }}>
          
          {/* ── Header ── */}
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 }}>
            <Pressable style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.cardBg, alignItems: "center", justifyContent: "center", marginRight: 16 }}>
              <ArrowLeft size={20} color={theme.accent} />
            </Pressable>
            <Text style={{ fontSize: 24, fontWeight: "700", color: "#FFFFFF" }}>Settings</Text>
          </View>

          {/* ── Avatar + Name ── */}
          <View style={{ alignItems: "center", paddingBottom: 24 }}>
            <View style={{ position: "relative" }}>
              <View style={{ borderRadius: 999, borderWidth: 4, borderColor: theme.accent, padding: 4 }}>
                <Image
                  source={user?.imageUrl}
                  style={{ width: 100, height: 100, borderRadius: 999, backgroundColor: theme.cardBg }}
                />
              </View>
              <Pressable style={{ position: "absolute", bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: theme.accent, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: theme.bg }}>
                <Camera size={14} color="#FFFFFF" />
              </Pressable>
            </View>

            <Text style={{ fontSize: 22, fontWeight: "800", color: "#FFFFFF", marginTop: 16 }}>
              {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Angel Wing"}
            </Text>
            <View style={{ backgroundColor: theme.cardBg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 }}>
              <Text style={{ color: theme.accent, fontSize: 13, fontWeight: "500" }}>
                @{user?.username || "username"}
              </Text>
            </View>
          </View>

          {/* ── Life Mode Switcher ── */}
          <View style={{ paddingHorizontal: 20, width: "100%", marginBottom: 32 }}>
            <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, marginLeft: 4 }}>
              LIFE MODE
            </Text>
            <View style={{ flexDirection: "row", backgroundColor: theme.cardBg, borderRadius: 16, padding: 6 }}>
              {(["personal", "education", "professional"] as const).map((m) => {
                const isActive = mode === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMode(m)}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isActive ? theme.accent : "transparent",
                      borderRadius: 12,
                    }}
                  >
                    {m === "personal" && <MessageSquare size={18} color={isActive ? "#000000" : theme.textMuted} />}
                    {m === "education" && <BookOpen size={18} color={isActive ? "#000000" : theme.textMuted} />}
                    {m === "professional" && <Briefcase size={18} color={isActive ? "#000000" : theme.textMuted} />}
                    <Text style={{ color: isActive ? "#000000" : theme.textMuted, fontSize: 13, fontWeight: "700", marginTop: 6, textTransform: "capitalize" }}>
                      {m}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ── Appearance Card ── */}
          <View style={{ paddingHorizontal: 20, width: "100%", marginBottom: 32 }}>
            <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, marginLeft: 4 }}>
              APPEARANCE
            </Text>
            <View style={{ backgroundColor: theme.cardBg, borderRadius: 20, padding: 20 }}>
              
              {/* Dark Mode Row */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(99, 102, 241, 0.1)", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                  <Moon size={20} color="#6366F1" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>Dark Mode</Text>
                  <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>Transforms UI to Neon mode</Text>
                </View>
                <Switch 
                  value={true} 
                  onValueChange={() => {}} 
                  trackColor={{ false: theme.border, true: "rgba(99, 102, 241, 0.5)" }}
                  thumbColor="#6366F1"
                />
              </View>

              <View style={{ height: 1, backgroundColor: theme.border, marginBottom: 20 }} />

              {/* Theme Color Row */}
              <View>
                <Text style={{ color: theme.textMuted, fontSize: 14, fontWeight: "600", marginBottom: 16 }}>
                  Theme Color
                </Text>
                <View style={{ flexDirection: "row", gap: 16 }}>
                  {colorPalettes.map((palette, idx) => (
                    <Pressable
                      key={palette.name}
                      onPress={() => setPalette(idx)}
                      style={{
                        width: 44, height: 44, borderRadius: 22,
                        backgroundColor: palette.accent,
                        borderWidth: 2,
                        borderColor: paletteIndex === idx ? "#FFFFFF" : "transparent",
                      }}
                    />
                  ))}
                </View>
              </View>
              
            </View>
          </View>

          {/* ── Top Secret Card ── */}
          <View style={{ paddingHorizontal: 20, width: "100%", marginBottom: 32 }}>
            <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, marginLeft: 4 }}>
              TOP SECRET (ONLY YOU CAN SEE THIS)
            </Text>
            <View style={{ backgroundColor: theme.cardBg, borderRadius: 20, padding: 20 }}>
              
              {/* Email Row */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(59, 130, 246, 0.1)", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                  <AtSign size={20} color="#3B82F6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: "500" }}>Registered Email</Text>
                  <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600", marginTop: 2 }}>
                    {user?.emailAddresses[0]?.emailAddress || "awing7748@gmail.com"}
                  </Text>
                </View>
                <Lock size={18} color={theme.textMuted} />
              </View>

              <View style={{ height: 1, backgroundColor: theme.border, marginBottom: 20 }} />

              {/* Phone Row */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(16, 185, 129, 0.1)", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                  <Phone size={20} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.textMuted, fontSize: 13, fontWeight: "500" }}>Verified Phone Number</Text>
                  <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600", marginTop: 2 }}>
                    {user?.phoneNumbers?.[0]?.phoneNumber || "Not Set"}
                  </Text>
                </View>
                <Lock size={18} color={theme.textMuted} />
              </View>
              
            </View>
          </View>

          {/* ── Sign Out ── */}
          <View style={{ paddingHorizontal: 20, width: "100%" }}>
            <Pressable
              onPress={() => signOut()}
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderRadius: 20,
                paddingVertical: 16,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(239, 68, 68, 0.2)",
              }}
            >
              <Text style={{ color: "#EF4444", fontWeight: "700", fontSize: 16 }}>Sign Out</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileTab;