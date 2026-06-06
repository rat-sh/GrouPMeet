import EmptyUI from "@/components/EmptyUI";
import MessageBubble from "@/components/MessageBubble";
import { useCurrentUser } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { useSocketStore } from "@/lib/socket";
import { useModeStore, useAppTheme } from "@/lib/modeStore";
import { MessageSender } from "@/types";
import { ArrowLeft, Phone, Video, Plus, Send, Clock, CheckCheck, Users, User } from "lucide-react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useApi } from "@/lib/axios";
import {
  View, Text, Pressable, KeyboardAvoidingView,
  ScrollView, Platform, ActivityIndicator, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ChatParams = { id: string; participantId?: string; name: string; avatar?: string; isGroup?: string };

const ChatDetailScreen = () => {
  const { id: chatId, avatar, name, participantId, isGroup } = useLocalSearchParams<ChatParams>();
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { apiWithAuth } = useApi();
  const theme = useAppTheme();

  const { data: currentUser } = useCurrentUser();
  const { data: messages, isLoading } = useMessages(chatId);
  const { joinChat, leaveChat, sendMessage, sendTyping, isConnected, onlineUsers, typingUsers } = useSocketStore();

  const isOnline = participantId ? onlineUsers.has(participantId) : false;
  const isTyping = typingUsers.get(chatId) === participantId || (isGroup === "true" && typingUsers.has(chatId));

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (chatId && isConnected) joinChat(chatId);
    return () => { if (chatId) leaveChat(chatId); };
  }, [chatId, isConnected, joinChat, leaveChat]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleTyping = useCallback((text: string) => {
    setMessageText(text);
    if (!isConnected || !chatId) return;
    if (text.length > 0) {
      sendTyping(chatId, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => sendTyping(chatId, false), 2000);
    } else {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      sendTyping(chatId, false);
    }
  }, [chatId, isConnected, sendTyping]);

  const handleSend = () => {
    if ((!messageText.trim()) || isSending || !isConnected || !currentUser) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    sendTyping(chatId, false);
    setIsSending(true);
    sendMessage(chatId, messageText.trim(), {
      _id: currentUser._id,
      name: currentUser.name,
      email: currentUser.email,
      avatar: currentUser.avatar,
    });
    setMessageText("");
    setIsSending(false);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handlePickImage = async () => {
    if (!currentUser || !isConnected) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setIsSending(true);
      try {
        const asset = result.assets[0];
        
        // Prepare FormData
        const formData = new FormData();
        formData.append("file", {
          uri: asset.uri,
          name: asset.fileName || "upload.jpg",
          type: asset.mimeType || "image/jpeg",
        } as any);

        const response = await apiWithAuth<{ url: string }>({
          method: "POST",
          url: "/upload",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const url = response.data.url;
        sendMessage(
          chatId,
          "",
          {
            _id: currentUser._id,
            name: currentUser.name,
            email: currentUser.email,
            avatar: currentUser.avatar,
          },
          [url]
        );
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      } catch (error) {
        console.error("Image upload failed:", error);
      } finally {
        setIsSending(false);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={["top", "bottom"]}>
      {/* ── Header ── */}
      <View style={{
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 14, paddingVertical: 10,
        backgroundColor: theme.bg,
        borderBottomWidth: 1, borderBottomColor: theme.cardBg,
      }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={24} color={theme.accent} />
        </Pressable>

        <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginLeft: 8 }}>
          <View style={{ position: "relative" }}>
            {avatar
              ? <Image source={avatar} style={{ width: 40, height: 40, borderRadius: 20 }} />
              : <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.cardBg, alignItems: "center", justifyContent: "center" }}>
                  {isGroup === "true"
                    ? <Users size={20} color={theme.textMuted} />
                    : <User size={20} color={theme.textMuted} />}
                </View>
            }
            {isOnline && isGroup !== "true" && (
              <View style={{ position: "absolute", bottom: 0, right: 0, width: 11, height: 11, borderRadius: 6, backgroundColor: "#10B981", borderWidth: 2, borderColor: theme.bg }} />
            )}
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={{ color: theme.text, fontWeight: "700", fontSize: 16 }} numberOfLines={1}>{name}</Text>
            <Text style={{ fontSize: 12, color: isTyping ? theme.accent : theme.textMuted }}>
              {isTyping ? "typing…" : isGroup === "true" ? "Group" : isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
          <View style={{ flexDirection: "row", gap: 4 }}>
            <Pressable style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" }}>
              <Phone size={20} color={theme.textMuted} />
            </Pressable>
            <Pressable style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" }}>
              <Video size={20} color={theme.textMuted} />
            </Pressable>
          </View>
      </View>

      {/* ── Messages + Input ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
          {isLoading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="large" color={theme.accent} />
            </View>
          ) : !messages || messages.length === 0 ? (
            <EmptyUI
              title="No messages yet"
              subtitle="Say hello! 👋"
              iconName="chatbubbles-outline"
              iconColor={theme.textMuted}
              iconSize={56}
            />
          ) : (
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 14, gap: 2 }}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((message) => {
                const senderId = (message.sender as MessageSender)._id;
                const isFromMe = currentUser ? senderId === currentUser._id : false;
                const isTemp = message._id.startsWith("temp-");
                return <MessageBubble key={message._id} message={message} isFromMe={isFromMe} isTemp={isTemp} />;
              })}
            </ScrollView>
          )}

          {/* ── Input Bar ── */}
          <View style={{ paddingHorizontal: 12, paddingBottom: 12, paddingTop: 8, backgroundColor: theme.bg, borderTopWidth: 1, borderTopColor: theme.cardBg }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", backgroundColor: theme.cardBg, borderRadius: 28, paddingHorizontal: 14, paddingVertical: 8, gap: 10 }}>
              <Pressable
                onPress={handlePickImage}
                disabled={isSending}
                style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}
              >
              <Plus size={24} color={isSending ? theme.textMuted : theme.accent} />
              </Pressable>

              <TextInput
                placeholder="Type a message…"
                placeholderTextColor={theme.textMuted}
                style={{ flex: 1, color: theme.text, fontSize: 15, maxHeight: 100, paddingBottom: 2 }}
                multiline
                value={messageText}
                onChangeText={handleTyping}
                editable={!isSending}
              />

              <Pressable
                onPress={handleSend}
                disabled={!messageText.trim() || isSending}
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: messageText.trim() ? theme.accent : theme.cardBg,
                  alignItems: "center", justifyContent: "center",
                }}
              >
                {isSending
                  ? <ActivityIndicator size="small" color={theme.bg} />
                  : <Send size={17} color={messageText.trim() ? theme.bg : theme.textMuted} />
                }
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatDetailScreen;
