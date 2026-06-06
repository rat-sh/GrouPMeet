import { useCreateGroup } from "@/hooks/useChats";
import { useUsers } from "@/hooks/useUsers";
import { User as UserType } from "@/types";
import { X, Users, Search, XCircle, User, Check } from "lucide-react-native";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useModeStore, useAppTheme, AppMode } from "@/lib/modeStore";

const NewGroupScreen = () => {
  const { mode: currentMode } = useModeStore();
  const theme = useAppTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Map<string, UserType>>(new Map());
  const [selectedMode, setSelectedMode] = useState<AppMode>(currentMode);

  const { data: allUsers, isLoading } = useUsers();
  const { mutate: createGroup, isPending: isCreatingGroup } = useCreateGroup();

  const users = allUsers?.filter((u) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return u.name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query);
  });

  const toggleUser = (user: UserType) => {
    const newSelected = new Map(selectedUsers);
    if (newSelected.has(user._id)) {
      newSelected.delete(user._id);
    } else {
      newSelected.set(user._id, user);
    }
    setSelectedUsers(newSelected);
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedUsers.size === 0) return;

    createGroup(
      { name: groupName, memberIds: Array.from(selectedUsers.keys()), mode: selectedMode },
      {
        onSuccess: (chat) => {
          router.dismiss();
          setTimeout(() => {
            router.push({
              pathname: "/chat/[id]" as any,
              params: {
                id: chat._id,
                name: chat.name,
                avatar: chat.avatar,
                isGroup: "true"
              },
            });
          }, 100);
        },
      }
    );
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
              <Text style={{ color: theme.text, fontSize: 20, fontWeight: "600" }}>New group</Text>
              <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>
                {selectedUsers.size > 0 ? `${selectedUsers.size} member${selectedUsers.size > 1 ? "s" : ""} selected` : "Add members"}
              </Text>
            </View>

            {selectedUsers.size > 0 && (
              <Pressable
                onPress={handleCreateGroup}
                disabled={isCreatingGroup || !groupName.trim()}
                style={{
                  paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: !groupName.trim() ? theme.border : theme.accent
                }}
              >
                {isCreatingGroup ? (
                  <ActivityIndicator size="small" color={theme.bg} />
                ) : (
                  <Text style={{ color: !groupName.trim() ? theme.textMuted : theme.bg, fontWeight: "600" }}>Create</Text>
                )}
              </Pressable>
            )}
          </View>

          {/* Group Name Input */}
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, backgroundColor: theme.cardBg }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: theme.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: theme.border }}>
              <Users size={20} color={theme.accent} style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Group Name"
                placeholderTextColor={theme.textMuted}
                style={{ flex: 1, color: theme.text, fontSize: 16 }}
                value={groupName}
                onChangeText={setGroupName}
              />
            </View>
          </View>

          {/* Mode Selector */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 12, backgroundColor: theme.cardBg }}>
            <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8, marginLeft: 4 }}>
              Group Mode
            </Text>
            <View style={{ flexDirection: "row", backgroundColor: theme.border, borderRadius: 12, padding: 4 }}>
              {(["personal", "education", "professional"] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setSelectedMode(m)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: selectedMode === m ? theme.accent : "transparent",
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: selectedMode === m ? theme.bg : theme.textMuted, fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>
                    {m}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Search Bar */}
          <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, backgroundColor: theme.cardBg }}>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: theme.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Search size={18} color={theme.textMuted} />
              <TextInput
                placeholder="Search users to add"
                placeholderTextColor={theme.textMuted}
                style={{ flex: 1, color: theme.text, fontSize: 14, marginLeft: 8 }}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Selected Users Horizontal List */}
          {selectedUsers.size > 0 && (
            <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                {Array.from(selectedUsers.values()).map(user => (
                  <View key={`selected-${user._id}`} style={{ alignItems: "center" }}>
                    <View style={{ position: "relative" }}>
                      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.border, alignItems: "center", justifyContent: "center" }}>
                        <User size={24} color={theme.textMuted} />
                      </View>
                      <Pressable
                        onPress={() => toggleUser(user)}
                        style={{ position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: theme.cardBg, alignItems: "center", justifyContent: "center" }}
                      >
                        <XCircle size={20} color={theme.textMuted} />
                      </Pressable>
                    </View>
                    <Text style={{ color: theme.text, fontSize: 11, marginTop: 4 }} numberOfLines={1} ellipsizeMode="tail">
                      {(user.name || user.displayName || user.username || "User").split(" ")[0]}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Users List */}
          <View style={{ flex: 1, backgroundColor: theme.cardBg }}>
            {isLoading ? (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={theme.accent} />
              </View>
            ) : !users || users.length === 0 ? (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 }}>
                <User size={64} color={theme.textMuted} />
                <Text style={{ color: theme.textMuted, fontSize: 18, marginTop: 16 }}>No users found</Text>
              </View>
            ) : (
              <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }} contentContainerStyle={{ paddingBottom: 24 }}>
                <Text style={{ color: theme.textMuted, fontSize: 12, marginBottom: 12, fontWeight: "600" }}>CONTACTS</Text>
                {users.map((user) => {
                  const isSelected = selectedUsers.has(user._id);
                  return (
                    <Pressable
                      key={user._id}
                      onPress={() => toggleUser(user)}
                      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border }}
                    >
                      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.border, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                        <User size={20} color={theme.textMuted} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.text, fontSize: 15, fontWeight: "500" }}>{user.name || user.displayName || user.username || "User"}</Text>
                        <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>{user.email}</Text>
                      </View>
                      <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: isSelected ? 0 : 1, borderColor: theme.textMuted, backgroundColor: isSelected ? theme.accent : "transparent", alignItems: "center", justifyContent: "center" }}>
                        {isSelected && <Check size={16} color={theme.bg} />}
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NewGroupScreen;
