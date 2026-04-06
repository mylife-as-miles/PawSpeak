import { listFavorites } from "@/utils/pawspeakStorage";
import { useAppTheme } from "@/utils/themeStore";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PawPrint, Waves } from "lucide-react-native";
import { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    softBorder: isDark ? "#2A2A2A" : "#EEF2F7",
  };

  const favoritesQuery = useQuery({
    queryKey: ["pawspeak-favorites"],
    queryFn: listFavorites,
  });

  const favorites = favoritesQuery.data || [];
  const moodGroups = useMemo(() => {
    const grouped = favorites.reduce((accumulator, item) => {
      const moodKey = item?.mood || "Unknown";

      if (!accumulator[moodKey]) {
        accumulator[moodKey] = {
          mood: moodKey,
          emoji: item?.emoji || "🐾",
          items: [],
          latestAt: item?.createdAt || null,
        };
      }

      accumulator[moodKey].items.push(item);

      const currentLatest = accumulator[moodKey].latestAt
        ? new Date(accumulator[moodKey].latestAt).getTime()
        : 0;
      const nextLatest = item?.createdAt ? new Date(item.createdAt).getTime() : 0;

      if (nextLatest > currentLatest) {
        accumulator[moodKey].latestAt = item.createdAt;
      }

      return accumulator;
    }, {});

    return Object.values(grouped)
      .map((group) => {
        const sortedItems = [...group.items].sort((left, right) => {
          const leftTime = left?.createdAt ? new Date(left.createdAt).getTime() : 0;
          const rightTime = right?.createdAt
            ? new Date(right.createdAt).getTime()
            : 0;
          return rightTime - leftTime;
        });

        return {
          ...group,
          count: sortedItems.length,
          latestItem: sortedItems[0],
          previews: sortedItems.slice(0, 2),
        };
      })
      .sort((left, right) => {
        if (right.count !== left.count) {
          return right.count - left.count;
        }

        const leftTime = left.latestAt ? new Date(left.latestAt).getTime() : 0;
        const rightTime = right.latestAt ? new Date(right.latestAt).getTime() : 0;
        return rightTime - leftTime;
      });
  }, [favorites]);

  const isLoading = favoritesQuery.isLoading;
  const hasMoods = moodGroups.length > 0;

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
            <PawPrint color="#FF8C00" size={18} />
          </View>
        </View>

        {isLoading ? (
          <View
            style={{
              backgroundColor: theme.surface,
              borderRadius: 28,
              padding: 28,
              alignItems: "center",
              gap: 14,
              shadowColor: theme.cardElevationShadow,
              shadowOpacity: isDark ? 0.3 : 0.05,
              shadowRadius: 15,
              elevation: 4,
            }}
          >
            <ActivityIndicator color="#FF8C00" />
            <Text style={{ color: theme.text2, fontSize: 14 }}>
              Loading your saved moods...
            </Text>
          </View>
        ) : null}

        {!isLoading && hasMoods ? (
          <>
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontSize: 34,
                  fontWeight: "800",
                  color: theme.text1,
                  lineHeight: 40,
                }}
              >
                Your mood shelf
              </Text>
              <Text
                style={{
                  fontSize: 34,
                  fontWeight: "800",
                  color: "#FF8C00",
                  lineHeight: 40,
                }}
              >
                is alive now.
              </Text>
              <Text
                style={{
                  color: theme.text2,
                  fontSize: 15,
                  marginTop: 4,
                  lineHeight: 22,
                }}
              >
                Built from your saved translations, grouped by the moods
                PawSpeak keeps hearing most.
              </Text>
            </View>

            <View
              style={{
                backgroundColor: theme.surface,
                borderRadius: 28,
                padding: 20,
                shadowColor: theme.cardElevationShadow,
                shadowOpacity: isDark ? 0.3 : 0.05,
                shadowRadius: 15,
                elevation: 4,
                gap: 14,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    borderRadius: 20,
                    backgroundColor: theme.iconBg,
                    padding: 16,
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      color: theme.text2,
                      fontSize: 12,
                      fontWeight: "700",
                      letterSpacing: 0.8,
                      textTransform: "uppercase",
                    }}
                  >
                    Moods Found
                  </Text>
                  <Text
                    style={{
                      color: theme.text1,
                      fontSize: 30,
                      fontWeight: "800",
                    }}
                  >
                    {moodGroups.length}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    borderRadius: 20,
                    backgroundColor: theme.iconBg,
                    padding: 16,
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      color: theme.text2,
                      fontSize: 12,
                      fontWeight: "700",
                      letterSpacing: 0.8,
                      textTransform: "uppercase",
                    }}
                  >
                    Saved Lines
                  </Text>
                  <Text
                    style={{
                      color: theme.text1,
                      fontSize: 30,
                      fontWeight: "800",
                    }}
                  >
                    {favorites.length}
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  color: theme.text2,
                  fontSize: 14,
                  lineHeight: 22,
                }}
              >
                The more favorites you save, the more this library turns into a
                real map of your cat's personality.
              </Text>
            </View>

            {moodGroups.map((group) => (
              <View
                key={group.mood}
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: 28,
                  padding: 20,
                  shadowColor: theme.cardElevationShadow,
                  shadowOpacity: isDark ? 0.3 : 0.05,
                  shadowRadius: 15,
                  elevation: 4,
                  gap: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 27,
                        backgroundColor: theme.orangeIconBg,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{group.emoji}</Text>
                    </View>

                    <View style={{ gap: 2 }}>
                      <Text
                        style={{
                          fontSize: 21,
                          fontWeight: "800",
                          color: theme.text1,
                        }}
                      >
                        {group.mood}
                      </Text>
                      <Text style={{ fontSize: 13, color: theme.text2 }}>
                        {group.count} saved translation
                        {group.count === 1 ? "" : "s"}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      borderRadius: 999,
                      backgroundColor: theme.iconBg,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.text2,
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      {group.latestAt
                        ? new Date(group.latestAt).toLocaleDateString()
                        : "Recent"}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    borderRadius: 22,
                    backgroundColor: theme.iconBg,
                    padding: 18,
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      color: theme.text2,
                      fontSize: 11,
                      fontWeight: "800",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    Signature sound
                  </Text>
                  <Text
                    style={{
                      color: theme.text1,
                      fontSize: 24,
                      lineHeight: 32,
                      fontWeight: "800",
                      fontStyle: "italic",
                    }}
                  >
                    "{group.latestItem?.catPhrase}"
                  </Text>
                  <Text
                    style={{
                      color: theme.text2,
                      fontSize: 14,
                      lineHeight: 21,
                    }}
                  >
                    {group.latestItem?.interpretation ||
                      "A strong little emotional weather report from your cat."}
                  </Text>
                </View>

                <View
                  style={{
                    borderRadius: 22,
                    borderWidth: 1,
                    borderColor: theme.softBorder,
                    padding: 16,
                    gap: 10,
                  }}
                >
                  <Text
                    style={{
                      color: theme.text1,
                      fontSize: 15,
                      fontWeight: "700",
                    }}
                  >
                    Recent examples
                  </Text>

                  {group.previews.map((item) => (
                    <View
                      key={item.id}
                      style={{
                        borderRadius: 16,
                        backgroundColor: theme.iconBg,
                        padding: 14,
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.text2,
                          fontSize: 11,
                          fontWeight: "800",
                          letterSpacing: 1,
                          textTransform: "uppercase",
                        }}
                      >
                        Original
                      </Text>
                      <Text
                        style={{
                          color: theme.text1,
                          fontSize: 15,
                          fontWeight: "600",
                          lineHeight: 22,
                        }}
                      >
                        {item.humanText}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        ) : null}

        {!isLoading && !hasMoods ? (
          <>
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
                Save one first.
              </Text>
              <Text
                style={{
                  color: theme.text2,
                  fontSize: 15,
                  marginTop: 4,
                  lineHeight: 22,
                }}
              >
                This shelf grows from your saved translations, so heart the cat
                moments you want to keep.
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
                Save a translation from the main screen and this tab will start
                grouping your cat's energy into real moods.
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
                  - detected moods{"\n"}- signature cat phrases{"\n"}- saved
                  translation examples
                </Text>
              </View>
            </View>
          </>
        ) : null}
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
            MAKE NEW TRANSLATION
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
