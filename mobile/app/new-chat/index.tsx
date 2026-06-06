import UserItem from "@/components/UserItem";
import { useGetOrCreateChat } from "@/hooks/useChats";
import { useUsers } from "@/hooks/useUsers";
import { useSocketStore } from "@/lib/socket";
import { User as UserType } from "@/types";
import { X, Search, User } from "lucide-react-native";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/lib/modeStore";

const NewChatScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const theme = useAppTheme();

  const { data: allUsers, isLoading } = useUsers();
  const { mutate: getOrCreateChat, isPending: isCreatingChat } = useGetOrCreateChat();
  const { onlineUsers } = useSocketStore();

  // client-side filtering
  const users = allUsers?.filter((u) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    
    return u.displayName?.toLowerCase().includes(query) || 
           u.username?.toLowerCase().includes(query) || 
           u.email?.toLowerCase().includes(query);
  });

  const handleUserSelect = (user: UserType) => {
    getOrCreateChat(user._id, {
      onSuccess: (chat) => {
        router.dismiss(); // go -1

        setTimeout(() => {
          router.push({
            pathname: "/chat/[id]" as any,
            params: {
              id: chat._id,
              participantId: chat.participant?._id,
              name: chat.participant?.name,
              avatar: chat.participant?.avatar,
            },
          });
        }, 100);
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={["top"]}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: theme.cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "95%", overflow: "hidden" }}>
          
          <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, backgroundColor: theme.cardBg, borderBottomWidth: 1, borderBottomColor: theme.border, flexDirection: "row", alignItems: "center" }}>
            <Pressable
              style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginRight: 8, backgroundColor: theme.border }}
              onPress={() => router.back()}
            >
              <X size={20} color={theme.accent} />
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontSize: 20, fontWeight: "600" }}>New chat</Text>
              <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>
                Search for a user by name or email
              </Text>
            </View>
          </View>

          {/* SEARCH BAR */}
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, backgroundColor: theme.cardBg }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: theme.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: theme.border }}>
              <Search size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Search users"
                placeholderTextColor={theme.textMuted}
                style={{ flex: 1, color: theme.text, fontSize: 16 }}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* USERS LIST */}
          <View style={{ flex: 1, backgroundColor: theme.cardBg }}>
            {isCreatingChat || isLoading ? (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={theme.accent} />
              </View>
            ) : (!users || users.length === 0) ? (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 }}>
                <User size={64} color={theme.textMuted} />
                <Text style={{ color: theme.textMuted, fontSize: 18, marginTop: 16 }}>No users found</Text>
                <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 4, textAlign: "center" }}>
                  Try a different search term.
                </Text>
              </View>
            ) : (
              <ScrollView
                style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                <Text style={{ color: theme.textMuted, fontSize: 12, marginBottom: 12, fontWeight: "600", letterSpacing: 1 }}>
                  ALL USERS
                </Text>
                {users?.map((user) => (
                  <UserItem
                    key={user._id}
                    user={user}
                    isOnline={onlineUsers.has(user._id)}
                    onPress={() => handleUserSelect(user)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NewChatScreen;
