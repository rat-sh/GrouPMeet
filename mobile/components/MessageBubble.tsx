import { Message } from "@/types";
import { View, Text } from "react-native";
import { Clock, CheckCheck } from "lucide-react-native";
import { format } from "date-fns";
import { Image } from "expo-image";
import { useAppTheme } from "@/lib/modeStore";

interface Props {
  message: Message;
  isFromMe: boolean;
  isTemp?: boolean;
  showAvatar?: boolean;
  previousMessageIsSameSender?: boolean;
}

export default function MessageBubble({ message, isFromMe, isTemp, showAvatar, previousMessageIsSameSender }: Props) {
  const theme = useAppTheme();
  const timeStr = message.createdAt
    ? format(new Date(message.createdAt), "h:mm a")
    : "";

  return (
    <View className={`flex-row ${isFromMe ? "justify-end" : "justify-start"} mb-1`}>
      <View
        style={{
          maxWidth: "80%",
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: 6,
          borderRadius: 18,
          backgroundColor: isFromMe ? theme.accent : theme.cardBg,
          borderBottomRightRadius: isFromMe ? 4 : 18,
          borderBottomLeftRadius: isFromMe ? 18 : 4,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        {message.attachments && message.attachments.length > 0 && (
          <View style={{ marginBottom: message.text ? 8 : 4, borderRadius: 12, overflow: "hidden" }}>
            {message.attachments.map((url, idx) => (
              <Image
                key={idx}
                source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${url}` }}
                style={{ width: 220, height: 220, borderRadius: 12, marginBottom: idx < message.attachments!.length - 1 ? 4 : 0 }}
                contentFit="cover"
              />
            ))}
          </View>
        )}

        {!!message.text && (
          <Text
            style={{
              fontSize: 15,
              lineHeight: 21,
              color: isFromMe ? "#FFF" : theme.text,
              marginBottom: 4,
            }}
          >
            {message.text}
          </Text>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
          <Text style={{ fontSize: 11, color: isFromMe ? `rgba(255,255,255,0.7)` : theme.textMuted }}>
            {timeStr}
          </Text>
          {isFromMe && (
            isTemp
              ? <Clock size={12} color="rgba(255,255,255,0.9)" />
              : <CheckCheck size={13} color="rgba(255,255,255,0.9)" />
          )}
        </View>
      </View>
    </View>
  );
}

