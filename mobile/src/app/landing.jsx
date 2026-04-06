import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/utils/themeStore";

const onboardingOptions = [
  {
    id: "decode",
    icon: "CAT",
    label: "Decode my cat's mood",
    hint: "Make sense of every chirp, stare, and slow blink.",
  },
  {
    id: "translate",
    icon: "TALK",
    label: "Translate my words",
    hint: "Turn everyday phrases into playful cat-speak.",
  },
  {
    id: "bond",
    icon: "LOVE",
    label: "Build a closer bond",
    hint: "Use PawSpeak as a fun ritual with my cat.",
  },
  {
    id: "save",
    icon: "STAR",
    label: "Save favorite translations",
    hint: "Keep the funniest and sweetest meows handy.",
  },
  {
    id: "explore",
    icon: "PAW",
    label: "Just exploring",
    hint: "I want to poke around and see what it can do.",
  },
];

function renderOptionBadge(icon, theme, isSelected) {
  const badgeText = {
    CAT: "C",
    TALK: "T",
    LOVE: "L",
    STAR: "S",
    PAW: "P",
  }[icon];

  return (
    <View
      style={{
        width: 54,
        height: 54,
        borderRadius: 18,
        backgroundColor: isSelected ? theme.surface : theme.orangeIconBg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: theme.accent,
          fontSize: 18,
          fontWeight: "900",
          letterSpacing: 0.6,
        }}
      >
        {badgeText}
      </Text>
    </View>
  );
}

export default function LandingScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const [selectedOption, setSelectedOption] = useState(onboardingOptions[0].id);

  const theme = {
    bg: isDark ? "#121212" : "#F8F9FA",
    text1: isDark ? "#F5F5F5" : "#111111",
    text2: isDark ? "#9CA3AF" : "#6B7280",
    surface: isDark ? "#1E1E1E" : "#FFFFFF",
    border: isDark ? "#2C2C2C" : "#F3F4F6",
    orangeIconBg: isDark ? "#3A2411" : "#FFF7ED",
    statusStyle: isDark ? "light" : "dark",
    accent: "#FF8C00",
    selectedSurface: isDark ? "#2B1D12" : "#FFF4E6",
    selectedBorder: isDark ? "#A55B15" : "#FDBA74",
    shadow: isDark ? "#000000" : "#111827",
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{
        flex: 1,
        backgroundColor: theme.bg,
      }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: insets.top + 12,
        paddingBottom: Math.max(insets.bottom, 20) + 20,
        paddingHorizontal: 24,
      }}
    >
      <StatusBar style={theme.statusStyle} />

      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          gap: 28,
        }}
      >
        <View style={{ gap: 28 }}>
          <View
            style={{
              alignItems: "center",
              gap: 18,
              paddingTop: 10,
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
                shadowColor: theme.accent,
                shadowOpacity: isDark ? 0.26 : 0.14,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 10 },
                elevation: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "900",
                  color: theme.accent,
                  letterSpacing: 1,
                }}
              >
                PAW
              </Text>
            </View>

            <View
              style={{
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 999,
                paddingVertical: 8,
                paddingHorizontal: 14,
              }}
            >
              <Text
                style={{
                  color: theme.text2,
                  fontSize: 12,
                  fontWeight: "800",
                  letterSpacing: 0.8,
                }}
              >
                FIRST ONBOARDING
              </Text>
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <Text
              style={{
                fontSize: 40,
                fontWeight: "900",
                color: theme.text1,
                textAlign: "center",
                lineHeight: 44,
              }}
            >
              What brings you to PawSpeak?
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: theme.text2,
                textAlign: "center",
                lineHeight: 24,
                paddingHorizontal: 6,
              }}
            >
              Choose the vibe that fits best. We&apos;ll shape your first cat
              translation session around it.
            </Text>
          </View>

          <View style={{ gap: 14 }}>
            {onboardingOptions.map((option) => {
              const isSelected = selectedOption === option.id;

              return (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={0.9}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setSelectedOption(option.id)}
                  style={{
                    backgroundColor: isSelected
                      ? theme.selectedSurface
                      : theme.surface,
                    borderRadius: 28,
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected
                      ? theme.selectedBorder
                      : theme.border,
                    paddingVertical: 18,
                    paddingHorizontal: 18,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    shadowColor: isSelected ? theme.accent : theme.shadow,
                    shadowOpacity: isSelected ? 0.18 : isDark ? 0.2 : 0.06,
                    shadowRadius: isSelected ? 18 : 12,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: isSelected ? 8 : 3,
                  }}
                >
                  {renderOptionBadge(option.icon, theme, isSelected)}

                  <View style={{ flex: 1, gap: 4 }}>
                    <Text
                      style={{
                        fontSize: 19,
                        fontWeight: "800",
                        color: theme.text1,
                      }}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        lineHeight: 20,
                        color: theme.text2,
                      }}
                    >
                      {option.hint}
                    </Text>
                  </View>

                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: isSelected
                        ? theme.accent
                        : theme.orangeIconBg,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ChevronRight
                      color={isSelected ? "#FFFFFF" : theme.accent}
                      size={18}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 14, paddingTop: 6 }}>
          <Text
            style={{
              fontSize: 13,
              color: theme.text2,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            You can change this later after your first translation.
          </Text>

          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => router.replace("/(tabs)/home")}
            style={{
              backgroundColor: theme.accent,
              width: "100%",
              paddingVertical: 18,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 10,
              shadowColor: theme.accent,
              shadowOpacity: 0.28,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 },
              elevation: 8,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 17,
                fontWeight: "800",
                letterSpacing: 0.3,
              }}
            >
              Next
            </Text>
            <ChevronRight color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
