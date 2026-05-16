import { Chat } from "@/types";
import { Image } from "expo-image";
import { View, Text, Pressable } from "react-native";
import { formatDistanceToNow } from "date-fns";
import { useSocketStore } from "@/lib/socket";
import { useModeStore, modeTheme } from "@/lib/modeStore";

const ChatItem = ({ chat, onPress }: { chat: Chat; onPress: () => void }) => {
  const { mode } = useModeStore();
  const theme = modeTheme[mode];
  const isGroup = chat.isGroup;
  
  // For DMs we use participant, for Groups we use the chat's name and avatar
  const name = isGroup ? chat.name : chat.participant?.name;
  const avatar = isGroup ? chat.avatar : chat.participant?.avatar;

  const { onlineUsers, typingUsers, unreadChats } = useSocketStore();

  const isOnline = !isGroup && chat.participant && onlineUsers.has(chat.participant._id);
  const typingUserId = typingUsers.get(chat._id);
  const isTyping = Boolean(typingUserId); // In groups, any typing user will show as typing...
  const hasUnread = unreadChats.has(chat._id);

  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: pressed ? `${theme.accent}10` : "transparent",
      })}
      onPress={onPress}
    >
      {/* Avatar + online dot */}
      <View style={{ position: "relative", marginRight: 14 }}>
        {avatar ? (
          <Image
            source={avatar}
            style={{ width: 54, height: 54, borderRadius: 27 }}
          />
        ) : (
          <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: theme.cardBg, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 20, color: theme.textMuted }}>{isGroup ? "👥" : "👤"}</Text>
          </View>
        )}
        {isOnline && (
          <View
            style={{
              position: "absolute",
              bottom: 1,
              right: 1,
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: "#10B981",
              borderWidth: 2,
              borderColor: theme.bg,
            }}
          />
        )}
      </View>

      {/* Chat info */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 3 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: hasUnread ? "700" : "500",
              color: hasUnread ? theme.accent : theme.text,
            }}
          >
            {name || "Unknown"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {hasUnread && (
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.accent }} />
            )}
            <Text style={{ fontSize: 12, color: theme.textMuted }}>
              {chat.lastMessageAt
                ? formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: false })
                : ""}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 13,
            color: isTyping ? "#F4A261" : hasUnread ? "#C0C0C8" : "#6B6B70",
            fontStyle: isTyping ? "italic" : "normal",
            fontWeight: hasUnread ? "500" : "400",
          }}
          numberOfLines={1}
        >
          {isTyping ? "typing…" : chat.lastMessage?.text ?? "No messages yet"}
        </Text>
      </View>
    </Pressable>
  );
};

export default ChatItem;
