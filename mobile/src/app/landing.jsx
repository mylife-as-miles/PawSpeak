import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
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

const goalOptions = [
  {
    id: "understand",
    label: "Understand my cat better",
    icon: "\u{1F43E}",
  },
  {
    id: "translate",
    label: "Turn my words into meows",
    icon: "\u{1F4AC}",
  },
  {
    id: "save",
    label: "Save favorite translations",
    icon: "\u2728",
  },
];

const focusOptions = [
  "Hungry meows",
  "Purring",
  "Morning chats",
  "Playtime",
  "Zoomies",
  "Cuddles",
  "Greetings",
  "Mood swings",
  "Attention",
  "Sleepy sounds",
  "Other",
];

const paceOptions = [
  {
    id: "slow",
    label: "Slow",
    value: "2",
    unit: "weeks",
    summaryTitle: "Ease into it over about 2 weeks",
    summaryBody:
      "A slower rhythm keeps things light while PawSpeak learns your cat's habits with you.",
  },
  {
    id: "optimal",
    label: "Optimal",
    value: "1",
    unit: "week",
    summaryTitle: "Feel more in sync in about 1 week",
    summaryBody:
      "This balanced pace gives PawSpeak enough daily moments to spot patterns without feeling intense.",
  },
  {
    id: "fast",
    label: "Fast",
    value: "3",
    unit: "days",
    summaryTitle: "Build momentum in about 3 days",
    summaryBody:
      "A faster pace works best if you want quick wins and plan to chat with your cat often.",
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
  const [talkFrequency, setTalkFrequency] = useState(4);
  const [selectedGoals, setSelectedGoals] = useState(["understand", "translate"]);
  const [selectedFocus, setSelectedFocus] = useState(["Hungry meows", "Purring"]);
  const [selectedPace, setSelectedPace] = useState("optimal");
  const isIntro = screen === "intro";
  const isSourceScreen = screen === "onboarding";
  const isFrequencyScreen = screen === "frequency";
  const isGoalsScreen = screen === "goals";
  const isFocusScreen = screen === "window";
  const isPaceScreen = screen === "pace";

  const selectedPaceConfig =
    paceOptions.find((option) => option.id === selectedPace) || paceOptions[1];
  const selectedPaceIndex = paceOptions.findIndex(
    (option) => option.id === selectedPace
  );
  const selectedPaceValue = selectedPaceIndex < 0 ? 1 : selectedPaceIndex;

  function toggleGoal(goalId) {
    setSelectedGoals((current) =>
      current.includes(goalId)
        ? current.filter((item) => item !== goalId)
        : [...current, goalId]
    );
  }

  function toggleFocus(label) {
    setSelectedFocus((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label]
    );
  }

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

      {(() => {
        if (isIntro) {
          return (
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
              width: "100%",
              maxWidth: 390,
              height: 360,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: -18,
            }}
          >
            <Image
              source="https://ucarecdn.com/d261e341-7dc4-4fdb-9bac-37a4d58bc0c0/-/format/auto/"
              contentFit="contain"
              style={{
                width: "165%",
                height: "165%",
                transform: [{ translateY: 12 }],
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
          );
        }

        if (isSourceScreen) {
          return (
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
                  width: "20%",
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
            onPress={() => setScreen("frequency")}
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
          );
        }

        if (isFrequencyScreen) {
          return (
        <View
          style={{
            width: "100%",
            maxWidth: 430,
            alignSelf: "center",
            minHeight: 820,
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
              onPress={() => setScreen("onboarding")}
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
                  width: "40%",
                  height: "100%",
                  borderRadius: 999,
                  backgroundColor: colors.accent,
                }}
              />
            </View>
          </View>

          <View
            style={{
              marginTop: 42,
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.card,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 22,
                marginRight: -16,
                zIndex: 2,
              }}
            >
              <Image
                source="https://ucarecdn.com/d261e341-7dc4-4fdb-9bac-37a4d58bc0c0/-/format/auto/"
                contentFit="contain"
                style={{
                  width: 64,
                  height: 64,
                }}
              />
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderRadius: 34,
                paddingVertical: 28,
                paddingHorizontal: 28,
                overflow: "visible",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  left: -11,
                  top: 52,
                  width: 28,
                  height: 28,
                  backgroundColor: colors.card,
                  transform: [{ rotate: "45deg" }],
                  borderRadius: 8,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  left: -3,
                  top: 38,
                  width: 26,
                  height: 42,
                  borderTopLeftRadius: 18,
                  borderBottomLeftRadius: 18,
                  backgroundColor: colors.card,
                }}
              />

              <Text
                style={{
                  color: colors.text,
                  fontSize: 30,
                  lineHeight: 36,
                  fontWeight: "900",
                }}
              >
                How many times a day do you usually talk to your cat?
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: 46,
              flex: 1,
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                alignItems: "center",
                gap: 12,
              }}
            >
              {[1, 2, 3, 4, 5].map((value) => {
                const isSelected = talkFrequency === value;

                return (
                  <TouchableOpacity
                    key={value}
                    activeOpacity={0.85}
                    onPress={() => setTalkFrequency(value)}
                    style={{
                      paddingVertical: isSelected ? 2 : 0,
                      paddingHorizontal: 20,
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected
                          ? colors.text
                          : isDark
                            ? "rgba(245, 245, 245, 0.18)"
                            : "rgba(30, 28, 32, 0.14)",
                        fontSize: isSelected ? 86 : 62,
                        lineHeight: isSelected ? 92 : 68,
                        fontWeight: isSelected ? "900" : "800",
                        textAlign: "center",
                      }}
                    >
                      {value}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => setScreen("goals")}
              style={{
                marginTop: 28,
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
        </View>
          );
        }

        if (isGoalsScreen) {
          return (
            <View
              style={{
                width: "100%",
                maxWidth: 430,
                alignSelf: "center",
                minHeight: 820,
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
                  onPress={() => setScreen("frequency")}
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
                      width: "60%",
                      height: "100%",
                      borderRadius: 999,
                      backgroundColor: colors.accent,
                    }}
                  />
                </View>
              </View>

              <View
                style={{
                  marginTop: 42,
                  flexDirection: "row",
                  alignItems: "flex-start",
                }}
              >
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: colors.card,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 22,
                    marginRight: -16,
                    zIndex: 2,
                  }}
                >
                  <Image
                    source="https://ucarecdn.com/d261e341-7dc4-4fdb-9bac-37a4d58bc0c0/-/format/auto/"
                    contentFit="contain"
                    style={{
                      width: 64,
                      height: 64,
                    }}
                  />
                </View>

                <View
                  style={{
                    flex: 1,
                    backgroundColor: colors.card,
                    borderRadius: 34,
                    paddingVertical: 28,
                    paddingHorizontal: 28,
                    overflow: "visible",
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      left: -11,
                      top: 52,
                      width: 28,
                      height: 28,
                      backgroundColor: colors.card,
                      transform: [{ rotate: "45deg" }],
                      borderRadius: 8,
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      left: -3,
                      top: 38,
                      width: 26,
                      height: 42,
                      borderTopLeftRadius: 18,
                      borderBottomLeftRadius: 18,
                      backgroundColor: colors.card,
                    }}
                  />

                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 30,
                      lineHeight: 36,
                      fontWeight: "900",
                    }}
                  >
                    What do you want PawSpeak to help with most?
                  </Text>
                </View>
              </View>

              <View
                style={{
                  marginTop: 96,
                  gap: 22,
                }}
              >
                {goalOptions.map((option) => {
                  const isSelected = selectedGoals.includes(option.id);

                  return (
                    <TouchableOpacity
                      key={option.id}
                      activeOpacity={0.9}
                      onPress={() => toggleGoal(option.id)}
                      style={{
                        minHeight: 108,
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
                          width: 60,
                          height: 60,
                          borderRadius: 20,
                          backgroundColor: isSelected ? colors.card : colors.onboardingBg,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 32,
                            lineHeight: 36,
                          }}
                        >
                          {option.icon}
                        </Text>
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

                      <Ionicons
                        name={isSelected ? "checkmark-circle" : "ellipse"}
                        size={36}
                        color={
                          isSelected
                            ? colors.accent
                            : isDark
                              ? "rgba(245, 245, 245, 0.12)"
                              : "rgba(30, 28, 32, 0.10)"
                        }
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => setScreen("window")}
                style={{
                  marginTop: 84,
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
          );
        }

        if (isFocusScreen) {
          return (
          <View
            style={{
              width: "100%",
              maxWidth: 430,
              alignSelf: "center",
              minHeight: 860,
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
                onPress={() => setScreen("goals")}
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
                      width: "80%",
                      height: "100%",
                      borderRadius: 999,
                      backgroundColor: colors.accent,
                  }}
                />
              </View>
            </View>

            <View
              style={{
                marginTop: 42,
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: colors.card,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 22,
                  marginRight: -16,
                  zIndex: 2,
                }}
              >
                <Image
                  source="https://ucarecdn.com/d261e341-7dc4-4fdb-9bac-37a4d58bc0c0/-/format/auto/"
                  contentFit="contain"
                  style={{
                    width: 64,
                    height: 64,
                  }}
                />
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.card,
                  borderRadius: 34,
                  paddingVertical: 28,
                  paddingHorizontal: 28,
                  overflow: "visible",
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    left: -11,
                    top: 52,
                    width: 28,
                    height: 28,
                    backgroundColor: colors.card,
                    transform: [{ rotate: "45deg" }],
                    borderRadius: 8,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    left: -3,
                    top: 38,
                    width: 26,
                    height: 42,
                    borderTopLeftRadius: 18,
                    borderBottomLeftRadius: 18,
                    backgroundColor: colors.card,
                  }}
                />

                <Text
                  style={{
                    color: colors.text,
                    fontSize: 30,
                    lineHeight: 36,
                    fontWeight: "900",
                  }}
                >
                  What kinds of cat moments should PawSpeak help with?
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 92,
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 14,
                paddingHorizontal: 8,
              }}
            >
              {focusOptions.map((label) => {
                const isSelected = selectedFocus.includes(label);
                const isOther = label === "Other";

                return (
                  <TouchableOpacity
                    key={label}
                    activeOpacity={0.9}
                    onPress={() => toggleFocus(label)}
                    style={{
                      minHeight: 70,
                      borderRadius: 26,
                      backgroundColor: colors.card,
                      paddingVertical: 18,
                      paddingHorizontal: isOther ? 24 : 20,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: isSelected ? colors.accentBorder : "transparent",
                    }}
                  >
                    {isOther ? (
                      <Ionicons
                        name="add"
                        size={22}
                        color={colors.text}
                        style={{ marginRight: 2 }}
                      />
                    ) : (
                      <Ionicons
                        name={isSelected ? "ellipse" : "ellipse-outline"}
                        size={14}
                        color={
                          isSelected
                            ? colors.accent
                            : isDark
                              ? "rgba(245, 245, 245, 0.16)"
                              : "rgba(30, 28, 32, 0.10)"
                        }
                      />
                    )}

                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 18,
                        lineHeight: 24,
                        fontWeight: "700",
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => setScreen("pace")}
                style={{
                  marginTop: 96,
                  alignSelf: "center",
                minWidth: 260,
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
                <Ionicons
                  name="checkmark"
                  size={28}
                  color={colors.buttonText}
                />
                <Text
                  style={{
                    color: colors.buttonText,
                    fontSize: 22,
                    fontWeight: "800",
                  }}
                >
                  Help with everything
                </Text>
              </TouchableOpacity>
            </View>
          );
        }

        if (isPaceScreen) {
          return (
          <View
            style={{
              width: "100%",
              maxWidth: 430,
              alignSelf: "center",
              minHeight: 860,
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
                onPress={() => setScreen("window")}
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
                    width: "100%",
                    height: "100%",
                    borderRadius: 999,
                    backgroundColor: colors.accent,
                  }}
                />
              </View>
            </View>

            <View
              style={{
                marginTop: 42,
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: colors.card,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 22,
                  marginRight: -16,
                  zIndex: 2,
                }}
              >
                <Image
                  source="https://ucarecdn.com/d261e341-7dc4-4fdb-9bac-37a4d58bc0c0/-/format/auto/"
                  contentFit="contain"
                  style={{
                    width: 64,
                    height: 64,
                  }}
                />
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.card,
                  borderRadius: 34,
                  paddingVertical: 28,
                  paddingHorizontal: 28,
                  overflow: "visible",
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    left: -11,
                    top: 52,
                    width: 28,
                    height: 28,
                    backgroundColor: colors.card,
                    transform: [{ rotate: "45deg" }],
                    borderRadius: 8,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    left: -3,
                    top: 38,
                    width: 26,
                    height: 42,
                    borderTopLeftRadius: 18,
                    borderBottomLeftRadius: 18,
                    backgroundColor: colors.card,
                  }}
                />

                <Text
                  style={{
                    color: colors.text,
                    fontSize: 30,
                    lineHeight: 36,
                    fontWeight: "900",
                  }}
                >
                  How fast do you want to understand your cat?
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 92,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors.muted,
                  fontSize: 18,
                  lineHeight: 24,
                  fontWeight: "700",
                  marginBottom: 10,
                }}
              >
                Understanding pace
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  gap: 10,
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 92,
                    lineHeight: 96,
                    fontWeight: "900",
                  }}
                >
                  {selectedPaceConfig.value}
                </Text>
                <Text
                  style={{
                    color: isDark
                      ? "rgba(245, 245, 245, 0.18)"
                      : "rgba(30, 28, 32, 0.16)",
                    fontSize: 46,
                    lineHeight: 54,
                    fontWeight: "800",
                    marginBottom: 8,
                  }}
                >
                  {selectedPaceConfig.unit}
                </Text>
              </View>

              <View
                style={{
                  marginTop: 52,
                  width: "92%",
                }}
              >
                {selectedPace === "optimal" ? (
                  <View
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: -58,
                      transform: [{ translateX: -78 }],
                      alignItems: "center",
                      zIndex: 2,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: colors.accent,
                        borderRadius: 16,
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 18,
                          fontWeight: "800",
                        }}
                      >
                        Recommended
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        backgroundColor: colors.accent,
                        transform: [{ rotate: "45deg" }, { translateY: -7 }],
                        borderBottomRightRadius: 4,
                      }}
                    />
                  </View>
                ) : null}

                <Slider
                  value={selectedPaceValue}
                  minimumValue={0}
                  maximumValue={paceOptions.length - 1}
                  step={1}
                  minimumTrackTintColor={colors.accent}
                  maximumTrackTintColor={colors.progressTrack}
                  thumbTintColor="#FFFFFF"
                  onValueChange={(value) =>
                    setSelectedPace(paceOptions[Math.round(value)]?.id || "optimal")
                  }
                  style={{
                    width: "100%",
                    height: 44,
                    transform: [{ scaleY: 1.35 }],
                  }}
                />

                <View
                  style={{
                    marginTop: 8,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  {paceOptions.map((option) => {
                    const isSelected = option.id === selectedPace;

                    return (
                      <TouchableOpacity
                        key={option.id}
                        activeOpacity={0.85}
                        onPress={() => setSelectedPace(option.id)}
                        style={{ minWidth: 82, alignItems: "center" }}
                      >
                        <Text
                          style={{
                            color: isSelected ? colors.text : colors.muted,
                            fontSize: isSelected ? 18 : 17,
                            fontWeight: isSelected ? "800" : "700",
                          }}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => router.replace("/(tabs)/home")}
              style={{
                marginTop: 132,
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
          );
        }

        return null;
      })()}
    </ScrollView>
  );
}
