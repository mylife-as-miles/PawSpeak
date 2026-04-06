import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/utils/themeStore";

const onboardingOptions = [
  {
    id: "twitter",
    label: "X/Twitter",
    iconType: "ionicon",
    icon: "logo-twitter",
    iconColor: "#111111",
  },
  {
    id: "instagram",
    label: "Instagram",
    iconType: "ionicon",
    icon: "logo-instagram",
    iconColor: "#E1306C",
  },
  {
    id: "tiktok",
    label: "TikTok",
    iconType: "ionicon",
    icon: "logo-tiktok",
    iconColor: "#111111",
  },
  {
    id: "youtube",
    label: "Youtube",
    iconType: "ionicon",
    icon: "logo-youtube",
    iconColor: "#FF2D20",
  },
  {
    id: "friends",
    label: "Friends/family",
    iconType: "emoji",
    icon: "\u{1F642}",
  },
];

function OptionIcon({ option }) {
  if (option.iconType === "emoji") {
    return (
      <Text
        style={{
          fontSize: 42,
          lineHeight: 46,
        }}
      >
        {option.icon}
      </Text>
    );
  }

  return (
    <Ionicons name={option.icon} size={40} color={option.iconColor || "#111111"} />
  );
}

export default function LandingScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const [screen, setScreen] = useState("intro");
  const [selectedOption, setSelectedOption] = useState(onboardingOptions[0].id);
  const isIntro = screen === "intro";

  const colors = {
    heroBg: isDark ? "#121212" : "#F8F9FA",
    onboardingBg: isDark ? "#121212" : "#F3F2F8",
    card: isDark ? "#1E1E1E" : "#FFFFFF",
    text: isDark ? "#F5F5F5" : "#1E1C20",
    muted: isDark ? "#B2B0B8" : "#6B7280",
    accent: "#FF8C00",
    accentSoft: isDark ? "#3A2411" : "#FFF5E8",
    accentBorder: isDark ? "#A55B15" : "#FF8C00",
    button: isDark ? "#F5F5F5" : "#232024",
    buttonText: isDark ? "#121212" : "#FFFFFF",
    progressTrack: isDark ? "#3A3A3A" : "#E7E5EF",
    surface: isDark ? "#1E1E1E" : "#FFFFFF",
    orangeIconBg: isDark ? "#3A2411" : "#FFF7ED",
    border: isDark ? "#2C2C2C" : "#ECE9F4",
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{
        flex: 1,
        backgroundColor: isIntro ? colors.heroBg : colors.onboardingBg,
      }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: isIntro ? "center" : "flex-start",
        paddingTop: isIntro ? insets.top + 24 : insets.top + 6,
        paddingBottom: insets.bottom + 34,
        paddingHorizontal: 24,
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {isIntro ? (
        <View
          style={{
            width: "100%",
            maxWidth: 430,
            alignSelf: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 200,
              height: 200,
              backgroundColor: colors.orangeIconBg,
              borderRadius: 100,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32,
              shadowColor: colors.accent,
              shadowOpacity: isDark ? 0.2 : 0.12,
              shadowRadius: 30,
              shadowOffset: { width: 0, height: 10 },
              elevation: 10,
            }}
          >
            <Image
              source="https://ucarecdn.com/d261e341-7dc4-4fdb-9bac-37a4d58bc0c0/-/format/auto/"
              contentFit="contain"
              style={{
                width: 118,
                height: 118,
              }}
            />
          </View>

          <Text
            style={{
              fontSize: 42,
              fontWeight: "800",
              color: isDark ? "#F5F5F5" : "#111111",
              textAlign: "center",
              lineHeight: 46,
            }}
          >
            Finally.
          </Text>
          <Text
            style={{
              fontSize: 42,
              fontWeight: "800",
              color: colors.accent,
              textAlign: "center",
              lineHeight: 46,
              marginBottom: 16,
            }}
          >
            Speak Cat.
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: colors.muted,
              textAlign: "center",
              lineHeight: 24,
              marginBottom: 24,
              paddingHorizontal: 20,
            }}
          >
            Translate your words into purrs, meows and chirps your cat actually
            understands.
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 32,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="star" size={14} color="#FBBF24" />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: isDark ? "#E5E7EB" : "#374151",
              }}
            >
              4.6 loved by 10k+ cats
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => setScreen("onboarding")}
            style={{
              backgroundColor: colors.accent,
              width: "100%",
              paddingVertical: 18,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 10,
              shadowColor: colors.accent,
              shadowOpacity: 0.3,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "800",
                letterSpacing: 0.4,
              }}
            >
              Start Translating
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={{
            width: "100%",
            maxWidth: 430,
            alignSelf: "center",
          }}
        >
          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setScreen("intro")}
              style={{
                width: 28,
                height: 28,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <View
              style={{
                flex: 1,
                height: 4,
                borderRadius: 999,
                backgroundColor: colors.progressTrack,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: "33%",
                  height: "100%",
                  borderRadius: 999,
                  backgroundColor: colors.accent,
                }}
              />
            </View>
          </View>

          <Text
            style={{
              marginTop: 64,
              fontSize: 50,
              lineHeight: 56,
              fontWeight: "900",
              color: colors.text,
              textAlign: "center",
              paddingHorizontal: 20,
            }}
          >
            How did you hear about us?
          </Text>

          <View
            style={{
              marginTop: 66,
              gap: 18,
            }}
          >
            {onboardingOptions.map((option) => {
              const isSelected = selectedOption === option.id;

              return (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={0.92}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setSelectedOption(option.id)}
                  style={{
                    minHeight: 98,
                    borderRadius: 30,
                    backgroundColor: isSelected ? colors.accentSoft : colors.card,
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: isSelected ? colors.accentBorder : "transparent",
                    paddingHorizontal: 24,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <View
                    style={{
                      width: 62,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <OptionIcon option={option} />
                  </View>

                  <Text
                    style={{
                      flex: 1,
                      color: colors.text,
                      fontSize: 22,
                      lineHeight: 28,
                      fontWeight: "700",
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => router.replace("/(tabs)/home")}
            style={{
              marginTop: 38,
              alignSelf: "center",
              minWidth: 220,
              borderRadius: 999,
              backgroundColor: colors.button,
              paddingVertical: 22,
              paddingHorizontal: 34,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <Text
              style={{
                color: colors.buttonText,
                fontSize: 22,
                fontWeight: "800",
              }}
            >
              Next
            </Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.buttonText}
            />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
