import UserItem from "@/components/UserItem";
import { useGetOrCreateChat } from "@/hooks/useChats";
import { useUsers, useSyncContacts } from "@/hooks/useUsers";
import { useSocketStore } from "@/lib/socket";
import { User } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Contacts from "expo-contacts";

const NewChatScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [discoveredUsers, setDiscoveredUsers] = useState<User[]>([]);

  const { data: allUsers, isLoading } = useUsers();
  const { mutate: getOrCreateChat, isPending: isCreatingChat } = useGetOrCreateChat();
  const { mutate: syncContacts, isPending: isSyncing } = useSyncContacts();
  const { onlineUsers } = useSocketStore();

  const handleSyncContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Allow contacts access to discover friends.");
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    if (data.length > 0) {
      const phones: string[] = [];
      data.forEach((contact) => {
        if (contact.phoneNumbers) {
          contact.phoneNumbers.forEach((pn) => {
            if (pn.number) phones.push(pn.number);
          });
        }
      });

      syncContacts(phones, {
        onSuccess: (foundUsers) => {
          setDiscoveredUsers(foundUsers);
          if (foundUsers.length > 0) {
            Alert.alert("Success!", `We found ${foundUsers.length} friends from your contacts!`);
          } else {
            Alert.alert("No friends found", "None of your contacts are currently using GrouPMeet.");
          }
        },
      });
    }
  };

  // client-side filtering
  const users = allUsers?.filter((u) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    // Exclude users that are already in discoveredUsers so we don't show duplicates
    if (discoveredUsers.some(d => d._id === u._id)) return false;
    
    return u.displayName?.toLowerCase().includes(query) || 
           u.username?.toLowerCase().includes(query) || 
           u.email?.toLowerCase().includes(query);
  });

  const handleUserSelect = (user: User) => {
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
    <SafeAreaView className="flex-1 bg-black" edges={["top"]}>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-surface rounded-t-3xl h-[95%] overflow-hidden">
          <View className="px-5 pt-3 pb-3 bg-surface border-b border-surface-light flex-row items-center">
            <Pressable
              className="w-9 h-9 rounded-full items-center justify-center mr-2 bg-surface-card"
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={20} color="#F4A261" />
            </Pressable>

            <View className="flex-1">
              <Text className="text-foreground text-xl font-semibold">New chat</Text>
              <Text className="text-muted-foreground text-xs mt-0.5">
                Search for a user or discover friends
              </Text>
            </View>
          </View>

          {/* SEARCH BAR */}
          <View className="px-5 pt-3 pb-2 bg-surface flex-row items-center gap-2">
            <View className="flex-1 flex-row items-center bg-surface-card rounded-full px-3 py-1.5 gap-2 border border-surface-light">
              <Ionicons name="search" size={18} color="#6B6B70" />
              <TextInput
                placeholder="Search users"
                placeholderTextColor="#6B6B70"
                className="flex-1 text-foreground text-sm"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
            </View>
            <Pressable 
              onPress={handleSyncContacts}
              disabled={isSyncing}
              className={`w-10 h-10 rounded-full items-center justify-center ${isSyncing ? "bg-[#E08F50]" : "bg-[#F4A261]"}`}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#0D0D0F" />
              ) : (
                <Ionicons name="sync" size={20} color="#0D0D0F" />
              )}
            </Pressable>
          </View>

          {/* USERS LIST */}

          <View className="flex-1 bg-surface">
            {isCreatingChat || isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#F4A261" />
              </View>
            ) : (!users || users.length === 0) && discoveredUsers.length === 0 ? (
              <View className="flex-1 items-center justify-center px-5">
                <Ionicons name="person-outline" size={64} color="#6B6B70" />
                <Text className="text-muted-foreground text-lg mt-4">No users found</Text>
                <Text className="text-subtle-foreground text-sm mt-1 text-center">
                  Try a different search term or sync your contacts
                </Text>
              </View>
            ) : (
              <ScrollView
                className="flex-1 px-5 pt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                {discoveredUsers.length > 0 && (
                  <View className="mb-6">
                    <View className="flex-row items-center gap-2 mb-3">
                      <Ionicons name="star" size={14} color="#F4A261" />
                      <Text className="text-[#F4A261] text-xs font-bold uppercase tracking-wider">
                        From your contacts
                      </Text>
                    </View>
                    {discoveredUsers.map((user) => (
                      <UserItem
                        key={user._id}
                        user={user}
                        isOnline={onlineUsers.has(user._id)}
                        onPress={() => handleUserSelect(user)}
                      />
                    ))}
                  </View>
                )}

                <Text className="text-muted-foreground text-xs mb-3 font-bold tracking-wider">
                  {discoveredUsers.length > 0 ? "OTHER USERS" : "ALL USERS"}
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
