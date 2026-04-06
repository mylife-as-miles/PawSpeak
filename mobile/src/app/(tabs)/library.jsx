import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sparkles, Waves } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/utils/themeStore";

export default function MoodLibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark } = useAppTheme();

  const theme = {
    bg: isDark ? "#121212" : "#F8F9FA",
    text1: isDark ? "#F5F5F5" : "#111111",
    text2: isDark ? "#9CA3AF" : "#6B7280",
    surface: isDark ? "#1E1E1E" : "#FFFFFF",
    iconBg: isDark ? "#2C2C2C" : "#F3F4F6",
    statusStyle: isDark ? "light" : "dark",
    cardElevationShadow: isDark ? "#000" : "#000",
    orangeIconBg: isDark ? "#3A2411" : "#FFF7ED",
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={theme.statusStyle} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "800", color: theme.text1 }}>
            Mood Library
          </Text>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.surface,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: theme.cardElevationShadow,
              shadowOpacity: isDark ? 0.2 : 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Sparkles color="#FF8C00" size={18} />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontSize: 34,
              fontWeight: "800",
              color: theme.text1,
              lineHeight: 40,
            }}
          >
            No moods yet.
          </Text>
          <Text
            style={{
              fontSize: 34,
              fontWeight: "800",
              color: "#FF8C00",
              lineHeight: 40,
            }}
          >
            Make one first.
          </Text>
          <Text
            style={{
              color: theme.text2,
              fontSize: 15,
              marginTop: 4,
              lineHeight: 22,
            }}
          >
            We removed the mocked mood cards. This tab now stays clean until
            real PawSpeak translations exist.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 28,
            padding: 28,
            alignItems: "center",
            shadowColor: theme.cardElevationShadow,
            shadowOpacity: isDark ? 0.3 : 0.05,
            shadowRadius: 15,
            elevation: 4,
            gap: 16,
          }}
        >
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: theme.orangeIconBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Waves color="#FF8C00" size={34} />
          </View>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: theme.text1,
              textAlign: "center",
            }}
          >
            The premium mood shelf is waiting
          </Text>

          <Text
            style={{
              fontSize: 14,
              lineHeight: 22,
              color: theme.text2,
              textAlign: "center",
            }}
          >
            As soon as you translate a real message, PawSpeak can grow this
            space with genuine moods instead of filler content.
          </Text>

          <View
            style={{
              width: "100%",
              borderRadius: 22,
              backgroundColor: theme.iconBg,
              padding: 18,
              gap: 8,
            }}
          >
            <Text
              style={{ color: theme.text1, fontWeight: "700", fontSize: 15 }}
            >
              What shows up here later
            </Text>
            <Text style={{ color: theme.text2, fontSize: 14, lineHeight: 21 }}>
              • detected mood
              {"\n"}• cat phrase audio
              {"\n"}• funny interpretation cards
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 20,
          left: 20,
          right: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home")}
          style={{
            backgroundColor: "#FF8C00",
            paddingVertical: 18,
            borderRadius: 999,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            shadowColor: "#FF8C00",
            shadowOpacity: 0.3,
            shadowRadius: 15,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 15,
              fontWeight: "800",
              letterSpacing: 1,
            }}
          >
            CREATE FIRST TRANSLATION
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
