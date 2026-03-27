import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  sender: "user" | "admin";
  senderName?: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "admin",
    senderName: "Adeola Funmilayo",
    text: "Hello!\nI'm Adeola, your virtual assistance.\nHow can I help you pls",
    time: "2:00pm",
  },
  {
    id: "2",
    sender: "user",
    text: "Hi! I have issue with my account, I have not been able to lock my funds",
    time: "2:10pm",
  },
  {
    id: "3",
    sender: "admin",
    senderName: "Adeola Funmilayo",
    text: "Sorry about that, We are working on it now",
    time: "2:00pm",
  },
  {
    id: "4",
    sender: "admin",
    senderName: "Adeola Funmilayo",
    text: "It's done now,\nYou can try lock your funds again",
    time: "2:00pm",
  },
  {
    id: "5",
    sender: "user",
    text: "Oh, it's working now, thank you.\nI really appreciate.\n🥳🥳",
    time: "2:10pm",
  },
  {
    id: "6",
    sender: "admin",
    senderName: "Adeola Funmilayo",
    text: "You are welcome",
    time: "2:00pm",
  },
];

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      time: new Date()
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        .toLowerCase()
        .replace(" ", ""),
    };
    setMessages([...messages, newMessage]);
    setInputText("");
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isAdmin = item.sender === "admin";
    return (
      <View
        className={`flex-row mb-5 max-w-[85%] ${isAdmin ? "self-start" : "self-end flex-row-reverse"}`}
      >
        {isAdmin && (
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
            }}
            className="w-8 h-8 rounded-full mr-2 mt-[18px]"
          />
        )}
        <View className="flex-1">
          {isAdmin && (
            <Text className="text-[13px] font-bold text-[#155D5F] mb-1">
              {item.senderName}
            </Text>
          )}
          <View
            className={`rounded-xl p-3 ${isAdmin ? "bg-[#F3F4F6] rounded-tl-none" : "bg-[#E7F5F5] rounded-tr-none"}`}
          >
            <Text
              className={`text-sm leading-5 ${isAdmin ? "text-[#323232]" : "text-[#155D5F]"}`}
            >
              {item.text}
            </Text>
            <Text
              className={`text-[10px] mt-1 self-end ${isAdmin ? "text-[#9CA3AF]" : "text-[#408688]"}`}
            >
              {item.time}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <View className="flex-row items-center justify-between px-4 h-14">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-[#323232]">
          Customer Support
        </Text>
        <View className="w-11" />
      </View>

      <View className="flex-row items-center px-5 my-3">
        <View className="flex-1 h-[1px] bg-[#E5E5E5]" />
        <Text className="text-[12px] text-[#9CA3AF] mx-3">
          Adeola Funmilayo is available for you
        </Text>
        <View className="flex-1 h-[1px] bg-[#E5E5E5]" />
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View className="flex-row items-center px-3 py-3 border-t border-[#F3F4F6] bg-white">
          <TouchableOpacity className="p-2">
            <Ionicons name="add" size={24} color="#6B7280" />
          </TouchableOpacity>
          <View className="flex-1 bg-[#F9FAFB] rounded-xl mx-2 px-4 max-h-[100px]">
            <TextInput
              className="text-base py-2 text-[#323232]"
              placeholder="Write a message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </View>
          <TouchableOpacity className="p-2" onPress={handleSend}>
            {inputText.trim() ? (
              <Ionicons name="send" size={24} color="#155D5F" />
            ) : (
              <MaterialCommunityIcons
                name="microphone-outline"
                size={24}
                color="#6B7280"
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
