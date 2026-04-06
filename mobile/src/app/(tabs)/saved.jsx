import { listFavorites, removeFavorite } from "@/utils/pawspeakStorage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Heart,
  Trash2,
  Volume2,
  Share as ShareIcon,
  User,
  Settings,
} from "lucide-react-native";
import { useAppTheme } from "@/utils/themeStore";

function formatShareText(result) {
  return [
    "PawSpeak favorite 🐾",
    `Human: ${result.humanText}`,
    `Mood: ${result.mood}`,
    `Cat: ${result.catPhrase}`,
    `${result.interpretation}`,
  ].join("\n");
}

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const playerRef = useRef(null);
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
    iconBtnColor: isDark ? "#E5E7EB" : "#111111",
    originalBg: isDark ? "#2C2C2C" : "#F3F4F6",
    originalText: isDark ? "#D1D5DB" : "#374151",
    shareBg: isDark ? "#2C2C2C" : "#F3F4F6",
    shareText: isDark ? "#9CA3AF" : "#4B5563",
    trashBg: isDark ? "#3F1D1D" : "#FEE2E2",
    trashIcon: isDark ? "#FCA5A5" : "#EF4444",
  };

  const favoritesQuery = useQuery({
    queryKey: ["pawspeak-favorites"],
    queryFn: listFavorites,
  });

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.remove();
      }
    };
  }, []);

  const removeMutation = useMutation({
    mutationFn: async (id) => removeFavorite(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pawspeak-favorites"] });
      await Haptics.selectionAsync();
    },
    onError: (mutationError) => {
      console.error(mutationError);
      Alert.alert("Save issue", "Could not remove that favorite right now.");
    },
  });

  const speakMutation = useMutation({
    mutationFn: async (text) => {
      const response = await fetch("/api/pawspeak/speak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(
          `When fetching /api/pawspeak/speak, the response was [${response.status}] ${response.statusText}`,
        );
      }

      return response.json();
    },
    onError: (mutationError) => {
      console.error(mutationError);
      Alert.alert("Audio issue", "Could not make audio for that saved line.");
    },
  });

  const playAudio = useCallback((audioUrl) => {
    try {
      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.remove();
      }

      const player = createAudioPlayer(audioUrl);
      playerRef.current = player;
      player.play();
    } catch (playerError) {
      console.error(playerError);
      Alert.alert("Audio issue", "Could not play that clip.");
    }
  }, []);

  const handleRemove = useCallback(
    (id) => {
      Alert.alert("Remove favorite", "Delete this saved translation?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeMutation.mutate(id),
        },
      ]);
    },
    [removeMutation],
  );

  const handleShare = useCallback(async (item) => {
    try {
      await Share.share({ message: formatShareText(item) });
    } catch (shareError) {
      console.error(shareError);
      Alert.alert("Share issue", "Could not open the share sheet.");
    }
  }, []);

  const handleHear = useCallback(
    (item) => {
      if (item.audioUrl) {
        playAudio(item.audioUrl);
        return;
      }

      speakMutation.mutate(item.catPhrase, {
        onSuccess: (data) => {
          playAudio(data.audioUrl);
        },
      });
    },
    [playAudio, speakMutation],
  );

  const favorites = favoritesQuery.data || [];
  const isLoading = favoritesQuery.isLoading;
  const emptyState = !isLoading && favorites.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={theme.statusStyle} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
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
            Profile
          </Text>
          <TouchableOpacity
            style={{
              padding: 8,
              backgroundColor: theme.surface,
              borderRadius: 999,
              shadowColor: theme.cardElevationShadow,
              shadowOpacity: isDark ? 0.2 : 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Settings color={theme.text1} size={20} />
          </TouchableOpacity>
        </View>

        {/* Profile Header Block */}
        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 24,
            padding: 20,
            alignItems: "center",
            shadowColor: theme.cardElevationShadow,
            shadowOpacity: isDark ? 0.3 : 0.05,
            shadowRadius: 15,
            elevation: 4,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.orangeIconBg,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <User color="#FF8C00" size={32} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: "800", color: theme.text1 }}>
            Cat Whisperer
          </Text>
          <Text style={{ fontSize: 14, color: theme.text2, marginTop: 4 }}>
            {favorites.length} Translations Saved
          </Text>
        </View>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "800",
            color: theme.text1,
            marginTop: 8,
          }}
        >
          Saved Translations
        </Text>

        {isLoading ? (
          <View style={{ padding: 24, alignItems: "center", gap: 12 }}>
            <ActivityIndicator color="#FF8C00" />
            <Text style={{ color: theme.text2, fontSize: 14 }}>
              Loading saved translations...
            </Text>
          </View>
        ) : null}

        {emptyState ? (
          <View
            style={{
              backgroundColor: theme.surface,
              borderRadius: 28,
              padding: 32,
              alignItems: "center",
              shadowColor: theme.cardElevationShadow,
              shadowOpacity: isDark ? 0.3 : 0.05,
              shadowRadius: 15,
              elevation: 4,
              gap: 14,
            }}
          >
            <View
              style={{
                width: 76,
                height: 76,
                borderRadius: 38,
                backgroundColor: theme.orangeIconBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Heart color="#FF8C00" size={28} />
            </View>
            <Text
              style={{ fontSize: 20, fontWeight: "800", color: theme.text1 }}
            >
              Your saved shelf is empty
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.text2,
                textAlign: "center",
                lineHeight: 22,
                maxWidth: 260,
              }}
            >
              When a translation feels too good to lose, tap the heart on the
              translator screen and it will live here.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/home")}
              style={{
                marginTop: 6,
                backgroundColor: "#FF8C00",
                borderRadius: 999,
                paddingHorizontal: 20,
                paddingVertical: 12,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: "800",
                  letterSpacing: 0.8,
                }}
              >
                MAKE A TRANSLATION
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {favorites.map((item) => {
          const moodText = `${item.emoji || "🐾"} ${item.mood}`;
          return (
            <View
              key={item.id}
              style={{
                backgroundColor: theme.surface,
                borderRadius: 24,
                padding: 20,
                shadowColor: theme.cardElevationShadow,
                shadowOpacity: isDark ? 0.3 : 0.05,
                shadowRadius: 15,
                elevation: 4,
                gap: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "800",
                    color: "#FF8C00",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  {moodText}
                </Text>
                <Text style={{ color: theme.text2, fontSize: 12 }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  fontStyle: "italic",
                  color: theme.text1,
                  lineHeight: 28,
                }}
              >
                "{item.catPhrase}"
              </Text>

              <View
                style={{
                  backgroundColor: theme.originalBg,
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "800",
                    color: theme.text2,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  Original
                </Text>
                <Text style={{ fontSize: 14, color: theme.originalText }}>
                  {item.humanText}
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                <TouchableOpacity
                  onPress={() => handleHear(item)}
                  style={{
                    flex: 1,
                    backgroundColor: theme.orangeIconBg,
                    borderRadius: 999,
                    paddingVertical: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  <Volume2 color="#FF8C00" size={18} />
                  <Text
                    style={{
                      color: "#FF8C00",
                      fontSize: 13,
                      fontWeight: "800",
                    }}
                  >
                    Hear
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleShare(item)}
                  style={{
                    flex: 1,
                    backgroundColor: theme.shareBg,
                    borderRadius: 999,
                    paddingVertical: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 8,
                  }}
                >
                  <ShareIcon color={theme.shareText} size={18} />
                  <Text
                    style={{
                      color: theme.shareText,
                      fontSize: 13,
                      fontWeight: "800",
                    }}
                  >
                    Share
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRemove(item.id)}
                  style={{
                    width: 44,
                    backgroundColor: theme.trashBg,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Trash2 color={theme.trashIcon} size={18} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
