import ChatItem from "@/components/ChatItem";
import EmptyUI from "@/components/EmptyUI";
import { useChats } from "@/hooks/useChats";
import { useModeStore, modeTheme } from "@/lib/modeStore";
import { Chat } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Header ─────────────────────────────────────────────────────────────────
function Header({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (v: string) => void;
}) {
  const router = useRouter();
  const { mode } = useModeStore();
  const theme = modeTheme[mode];

  return (
    <View style={{ paddingTop: 8, paddingBottom: 12 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 26, fontWeight: "800", color: theme.text }}>
          GrouPMeet
        </Text>
        <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
          <Pressable
            onPress={() => router.push("/new-chat" as any)}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: theme.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="create-outline" size={20} color={theme.bg} />
          </Pressable>
        </View>
      </View>

      {/* Search bar */}
      <View style={{ paddingHorizontal: 20 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.cardBg,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            gap: 8,
          }}
        >
          <Ionicons name="search" size={16} color={theme.textMuted} />
          <TextInput
            placeholder="Search conversations…"
            placeholderTextColor={theme.textMuted}
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, color: theme.text, fontSize: 14 }}
          />
        </View>
      </View>
    </View>
  );
}

// ─── Chats Tab ───────────────────────────────────────────────────────────────
const ChatsTab = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { mode } = useModeStore();
  const theme = modeTheme[mode];

  const { data: allChats, isLoading, error, refetch } = useChats();

  // Filter for DMs only
  const chats = allChats?.filter((c) => {
    if (c.isGroup) return false;
    // NOTE: Professional mode will later be implemented via email API.
    // For now, only show DMs in Personal mode (or all modes if you prefer).
    // Let's hide DMs from Professional/Education to strictly segregate.
    if (mode !== "personal") return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.participant?.name?.toLowerCase().includes(q);
  });

  const handleChatPress = (chat: Chat) => {
    router.push({
      pathname: "/chat/[id]" as any,
      params: {
        id: chat._id,
        participantId: chat.participant?._id,
        name: chat.participant?.name,
        avatar: chat.participant?.avatar,
        isGroup: "false"
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 1, backgroundColor: theme.bg }}
      >
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 1, backgroundColor: theme.bg }}
      >
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Ionicons name="wifi-outline" size={48} color={theme.textMuted} />
          <Text style={{ color: theme.textMuted, fontSize: 16, marginTop: 12 }}>
            Failed to load chats
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={{
              marginTop: 16,
              backgroundColor: theme.accent,
              paddingHorizontal: 24,
              paddingVertical: 10,
              borderRadius: 24,
            }}
          >
            <Text style={{ color: theme.bg, fontWeight: "700" }}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: theme.bg }}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ChatItem chat={item} onPress={() => handleChatPress(item)} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0, paddingBottom: 24 }}
        ListHeaderComponent={
          <>
            <Header search={search} setSearch={setSearch} />
            {(chats?.length ?? 0) > 0 && (
              <Text
                style={{
                  color: theme.textMuted,
                  fontSize: 11,
                  fontWeight: "600",
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  paddingHorizontal: 20,
                  marginBottom: 6,
                  marginTop: 8
                }}
              >
                💬 Messages
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          <EmptyUI
            title="No conversations yet"
            subtitle="Start a conversation with someone!"
            iconName="chatbubbles-outline"
            iconColor="#6B6B70"
            iconSize={64}
            buttonLabel="New Chat"
            onPressButton={() => router.push("/new-chat" as any)}
          />
        }
      />
    </SafeAreaView>
  );
};

export default ChatsTab;