import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { listFavorites, saveFavorite } from "@/utils/pawspeakStorage";
import useUpload from "@/utils/useUpload";
import { useAppTheme } from "@/utils/themeStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAudioPlayer,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Heart,
  Mic,
  Moon,
  PauseCircle,
  Share as ShareIcon,
  Volume2,
  Edit3,
  Waves,
} from "lucide-react-native";

function formatShareText(result) {
  return [
    "PawSpeak 🐾",
    `Human: ${result.humanText}`,
    `Mood: ${result.mood}`,
    `Cat: ${result.catPhrase}`,
    `${result.interpretation}`,
  ].join("\n");
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useAppTheme();

  const theme = {
    bg: isDark ? "#121212" : "#F8F9FA",
    text1: isDark ? "#F5F5F5" : "#111111",
    text2: isDark ? "#9CA3AF" : "#6B7280",
    surface: isDark ? "#1E1E1E" : "#FFFFFF",
    border: isDark ? "#2C2C2C" : "#F3F4F6",
    orangeIconBg: isDark ? "#3A2411" : "#FFF7ED",
    statusStyle: isDark ? "light" : "dark",
    cardElevatedBg: isDark ? "#262626" : "#FFFFFF",
    cardElevationShadow: isDark ? "#000" : "#000",
    errorBg: isDark ? "#3F1D1D" : "#FEE2E2",
    errorText: isDark ? "#FCA5A5" : "#DC2626",
    infoText: isDark ? "#FDBA74" : "#EA580C",
    iconBtnBg: isDark ? "#2C2C2C" : "#F3F4F6",
    iconBtnActive: isDark ? "#3A2411" : "#FFEDD5",
    iconBtnColor: isDark ? "#E5E7EB" : "#111111",
  };

  const queryClient = useQueryClient();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const playerRef = useRef(null);
  const [upload, { loading: uploadLoading }] = useUpload();
  const [message, setMessage] = useState("");
  const [latestResult, setLatestResult] = useState(null);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState("");
  const [hasMicPermission, setHasMicPermission] = useState(false);

  const favoritesQuery = useQuery({
    queryKey: ["pawspeak-favorites"],
    queryFn: listFavorites,
  });

  const favorites = favoritesQuery.data || [];
  const hasResult = Boolean(latestResult);
  const currentIsSaved = useMemo(() => {
    if (!latestResult) {
      return false;
    }

    return favorites.some((favorite) => favorite.id === latestResult.id);
  }, [favorites, latestResult]);

  useEffect(() => {
    async function prepare() {
      const permission = await requestRecordingPermissionsAsync();
      setHasMicPermission(Boolean(permission?.granted));
    }

    prepare();
  }, []);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.remove();
      }
    };
  }, []);

  const translateMutation = useMutation({
    mutationFn: async (inputText) => {
      const response = await fetch("/api/pawspeak/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error(
          `When fetching /api/pawspeak/translate, the response was [${response.status}] ${response.statusText}`,
        );
      }
      return response.json();
    },
    onMutate: () => {
      setError(null);
      setInfo("Listening for cat energy...");
    },
    onSuccess: async (data, inputText) => {
      const nextResult = {
        ...data.result,
        id: `pawspeak-${Date.now()}`,
        humanText: inputText,
        createdAt: new Date().toISOString(),
        audioUrl: null,
        audioProvider: null,
      };

      setLatestResult(nextResult);
      setInfo("");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: async (mutationError) => {
      console.error(mutationError);
      setError("Could not translate that message right now.");
      setInfo("");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
      setError("Could not make cat audio right now.");
    },
  });

  const transcribeMutation = useMutation({
    mutationFn: async (audioUrl) => {
      const response = await fetch("/api/pawspeak/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audioUrl }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(
          errorPayload?.error ||
            `When fetching /api/pawspeak/transcribe, the response was [${response.status}] ${response.statusText}`,
        );
      }
      return response.json();
    },
    onError: (mutationError) => {
      console.error(mutationError);
      setError(
        mutationError.message || "Could not understand that voice note.",
      );
      setInfo("");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (item) => saveFavorite(item),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pawspeak-favorites"] });
      setInfo("Saved to Favorites!");
      await Haptics.selectionAsync();
    },
    onError: (mutationError) => {
      console.error(mutationError);
      setError("Could not save that favorite.");
    },
  });

  const handleTranslate = useCallback(async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setError("Type something dramatic first.");
      return;
    }

    await Haptics.selectionAsync();
    translateMutation.mutate(trimmedMessage);
  }, [message, translateMutation]);

  const handlePromptPress = useCallback(async (prompt) => {
    setMessage(prompt);
    setError(null);
    await Haptics.selectionAsync();
  }, []);

  const playAudio = useCallback((audioUrl) => {
    try {
      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current.remove();
      }

      const player = createAudioPlayer(audioUrl);
      playerRef.current = player;
      player.play();
      setInfo("Playing cat audio...");
    } catch (playerError) {
      console.error(playerError);
      setError("Could not play the audio.");
    }
  }, []);

  const handleHearResult = useCallback(async () => {
    if (!latestResult) {
      return;
    }

    await Haptics.selectionAsync();

    if (latestResult.audioUrl) {
      playAudio(latestResult.audioUrl);
      return;
    }

    speakMutation.mutate(latestResult.catPhrase, {
      onSuccess: async (data) => {
        setLatestResult((currentValue) => {
          if (!currentValue) {
            return currentValue;
          }

          return {
            ...currentValue,
            audioUrl: data.audioUrl,
            audioProvider: data.provider,
          };
        });
        playAudio(data.audioUrl);

        if (data.provider === "elevenlabs") {
          setInfo("Voiced with ElevenLabs.");
        } else {
          setInfo("Using the backup cat voice for now.");
        }
      },
    });
  }, [latestResult, playAudio, speakMutation]);

  const handleSaveFavorite = useCallback(async () => {
    if (!latestResult) {
      return;
    }

    if (currentIsSaved) {
      setInfo("Already in Favorites.");
      return;
    }

    saveMutation.mutate(latestResult);
  }, [currentIsSaved, latestResult, saveMutation]);

  const handleShare = useCallback(async () => {
    if (!latestResult) {
      return;
    }

    try {
      await Share.share({
        message: formatShareText(latestResult),
      });
    } catch (shareError) {
      console.error(shareError);
      Alert.alert("Share issue", "Could not open the share sheet.");
    }
  }, [latestResult]);

  const handleMicPress = useCallback(async () => {
    setError(null);

    if (recorderState.isRecording) {
      try {
        await recorder.stop();
        const recordedUri = recorder.uri;

        if (!recordedUri) {
          setError("No voice note was captured.");
          return;
        }

        setInfo("Turning your meow into text...");
        const audioResponse = await fetch(recordedUri);
        const audioBlob = await audioResponse.blob();

        if (audioBlob.size > 3 * 1024 * 1024) {
          setError("Keep voice notes short so transcription stays under 3MB.");
          setInfo("");
          return;
        }

        const audioBuffer = await audioBlob.arrayBuffer();
        const uploadedAudio = await upload({ buffer: audioBuffer });

        if (uploadedAudio?.error || !uploadedAudio?.url) {
          setError(uploadedAudio?.error || "Could not upload the voice note.");
          setInfo("");
          return;
        }

        transcribeMutation.mutate(uploadedAudio.url, {
          onSuccess: async (data) => {
            const transcribedText =
              typeof data?.text === "string" ? data.text.trim() : "";

            if (!transcribedText) {
              setError(
                "That recording was a little too mysterious. Try again.",
              );
              setInfo("");
              return;
            }

            setMessage(transcribedText);
            setInfo("Voice captured. Translating it now...");
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            );
            translateMutation.mutate(transcribedText);
          },
        });
      } catch (recordingError) {
        console.error(recordingError);
        setError("Could not stop and process that voice note.");
        setInfo("");
      }

      return;
    }

    const permission = await requestRecordingPermissionsAsync();
    const granted = Boolean(permission?.granted);
    setHasMicPermission(granted);

    if (!granted) {
      Alert.alert(
        "Microphone needed",
        "Please allow microphone access so PawSpeak can hear you.",
      );
      return;
    }

    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
      setInfo("Recording... keep it short and dramatic.");
      await Haptics.selectionAsync();
    } catch (recordingError) {
      console.error(recordingError);
      setError("Could not start recording.");
      setInfo("");
    }
  }, [
    recorder,
    recorderState.isRecording,
    transcribeMutation,
    translateMutation,
    upload,
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={theme.statusStyle} />
      <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: insets.top + 16,
            paddingBottom: 32,
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
            <Text
              style={{ fontSize: 22, fontWeight: "800", color: theme.text1 }}
            >
              🐾 PawSpeak
            </Text>
            <TouchableOpacity
              onPress={toggleTheme}
              style={{
                padding: 8,
                backgroundColor: theme.surface,
                borderRadius: 999,
                shadowColor: "#000",
                shadowOpacity: isDark ? 0.2 : 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Moon color={theme.text1} size={20} />
            </TouchableOpacity>
          </View>

          {info || error || uploadLoading || transcribeMutation.isPending ? (
            <View
              style={{
                borderRadius: 16,
                padding: 12,
                backgroundColor: error ? theme.errorBg : theme.orangeIconBg,
              }}
            >
              {uploadLoading || transcribeMutation.isPending ? (
                <ActivityIndicator color="#FF8C00" />
              ) : null}
              {info ? (
                <Text
                  style={{
                    color: theme.infoText,
                    fontSize: 13,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  {info}
                </Text>
              ) : null}
              {error ? (
                <Text
                  style={{
                    color: theme.errorText,
                    fontSize: 13,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  {error}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={{ position: "relative", gap: 16 }}>
            {/* Input Card */}
            <View
              style={{
                backgroundColor: theme.surface,
                borderRadius: 24,
                padding: 20,
                shadowColor: theme.cardElevationShadow,
                shadowOpacity: isDark ? 0.3 : 0.05,
                shadowRadius: 15,
                elevation: 4,
                paddingBottom: 36,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color: theme.text2,
                    letterSpacing: 1,
                  }}
                >
                  HUMAN 🧑
                </Text>
                <Edit3 color={theme.text2} size={16} />
              </View>

              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Type or speak something..."
                placeholderTextColor={theme.text2}
                multiline
                style={{
                  minHeight: 80,
                  color: theme.text1,
                  fontSize: 20,
                  fontWeight: "600",
                  textAlignVertical: "top",
                }}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 12,
                }}
              >
                <TouchableOpacity
                  onPress={handleMicPress}
                  style={{
                    backgroundColor: recorderState.isRecording
                      ? "#EF4444"
                      : "#FF8C00",
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: recorderState.isRecording
                      ? "#EF4444"
                      : "#FF8C00",
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 5,
                  }}
                >
                  {recorderState.isRecording ? (
                    <PauseCircle color="#FFFFFF" size={24} />
                  ) : (
                    <Mic color="#FFFFFF" size={24} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Floating Translate Button */}
            <View
              style={{
                alignItems: "center",
                zIndex: 10,
                marginTop: -32,
                marginBottom: -16,
              }}
            >
              <TouchableOpacity
                onPress={handleTranslate}
                disabled={
                  translateMutation.isPending ||
                  transcribeMutation.isPending ||
                  uploadLoading
                }
                style={{
                  backgroundColor: "#FF8C00",
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 999,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  shadowColor: "#FF8C00",
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 5 },
                  elevation: 6,
                  opacity:
                    translateMutation.isPending ||
                    transcribeMutation.isPending ||
                    uploadLoading
                      ? 0.7
                      : 1,
                }}
              >
                {translateMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : null}
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontWeight: "800",
                    letterSpacing: 1,
                  }}
                >
                  TRANSLATE ⚡
                </Text>
              </TouchableOpacity>
            </View>

            {/* Output Card */}
            <View
              style={{
                backgroundColor: theme.surface,
                borderRadius: 24,
                padding: 20,
                paddingTop: 32,
                shadowColor: theme.cardElevationShadow,
                shadowOpacity: isDark ? 0.3 : 0.05,
                shadowRadius: 15,
                elevation: 4,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color: theme.text2,
                    letterSpacing: 1,
                  }}
                >
                  CAT 🐱
                </Text>
                <Waves color={theme.text2} size={18} />
              </View>

              {hasResult ? (
                <>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "800",
                      fontStyle: "italic",
                      color: theme.text1,
                      lineHeight: 32,
                      marginBottom: 12,
                    }}
                  >
                    "{latestResult.catPhrase}"
                  </Text>

                  <Text
                    style={{
                      color: theme.text2,
                      fontSize: 15,
                      lineHeight: 22,
                      marginBottom: 20,
                    }}
                  >
                    {latestResult.interpretation}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                      justifyContent: "center",
                      marginBottom: 24,
                      height: 40,
                    }}
                  >
                    {[1, 2, 3, 2, 4, 3, 1, 2, 5, 2, 1, 3, 2, 1].map(
                      (val, i) => (
                        <View
                          key={i}
                          style={{
                            width: 4,
                            height: val * 8,
                            backgroundColor: "#FF8C00",
                            borderRadius: 999,
                            opacity: 0.7,
                          }}
                        />
                      ),
                    )}
                  </View>
                </>
              ) : (
                <View
                  style={{
                    borderRadius: 24,
                    backgroundColor: theme.orangeIconBg,
                    paddingHorizontal: 22,
                    paddingVertical: 28,
                    alignItems: "center",
                    gap: 14,
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      backgroundColor: theme.surface,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Waves color="#FF8C00" size={30} />
                  </View>

                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "800",
                      color: theme.text1,
                      textAlign: "center",
                    }}
                  >
                    Your first cat reading appears here
                  </Text>

                  <Text
                    style={{
                      color: theme.text2,
                      fontSize: 14,
                      lineHeight: 22,
                      textAlign: "center",
                      maxWidth: 260,
                    }}
                  >
                    Type something dramatic or record a voice note. PawSpeak
                    will return a mood, a cat phrase, and a funny read
                    instantly.
                  </Text>
                </View>
              )}

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: theme.border,
                }}
              >
                <TouchableOpacity
                  onPress={handleHearResult}
                  disabled={!latestResult || speakMutation.isPending}
                  style={{
                    padding: 12,
                    backgroundColor: theme.iconBtnBg,
                    borderRadius: 999,
                    opacity: latestResult ? 1 : 0.45,
                  }}
                >
                  {speakMutation.isPending ? (
                    <ActivityIndicator
                      color={theme.iconBtnColor}
                      size="small"
                    />
                  ) : (
                    <Volume2 color={theme.iconBtnColor} size={20} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleShare}
                  disabled={!latestResult}
                  style={{
                    padding: 12,
                    backgroundColor: theme.iconBtnBg,
                    borderRadius: 999,
                    opacity: latestResult ? 1 : 0.45,
                  }}
                >
                  <ShareIcon color={theme.iconBtnColor} size={20} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveFavorite}
                  disabled={!latestResult || saveMutation.isPending}
                  style={{
                    padding: 12,
                    backgroundColor: currentIsSaved
                      ? theme.iconBtnActive
                      : theme.iconBtnBg,
                    borderRadius: 999,
                    opacity: latestResult ? 1 : 0.45,
                  }}
                >
                  <Heart
                    color={currentIsSaved ? "#FF8C00" : theme.iconBtnColor}
                    fill={currentIsSaved ? "#FF8C00" : "transparent"}
                    size={20}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingAnimatedView>
    </View>
  );
}
