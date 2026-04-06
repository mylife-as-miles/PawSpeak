import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import appFetch from "@/__create/fetch";
import { listFavorites, saveFavorite } from "@/utils/pawspeakStorage";
import useUpload from "@/utils/useUpload";
import { useAppTheme } from "@/utils/themeStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
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
  Animated,
  Alert,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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

const DEFAULT_VISUALIZER_LEVELS = [1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1];
const SHARE_PREVIEW_LEVELS = [1, 2, 4, 5, 7, 9, 7, 5, 4, 2, 1];
const LIKE_PARTICLES = [
  { x: -34, y: -34, size: 10, color: "#FFB84D" },
  { x: -18, y: -58, size: 8, color: "#FFD27D" },
  { x: 0, y: -66, size: 12, color: "#FF8C00" },
  { x: 18, y: -56, size: 8, color: "#FFC36B" },
  { x: 34, y: -34, size: 10, color: "#FF9D2E" },
];

function legacyFormatShareText(result) {
  return [
    "PawSpeak 🐾",
    `Human: ${result.humanText}`,
    `Mood: ${result.mood}`,
    `Cat: ${result.catPhrase}`,
    `${result.interpretation}`,
  ].join("\n");
}

function formatShareText(result) {
  const lines = [
    "PawSpeak",
    result?.humanText ? `You said: ${result.humanText}` : null,
    result?.catPhrase ? `Cat reply: "${result.catPhrase}"` : null,
    "Shared from PawSpeak.",
  ];

  return lines.filter(Boolean).join("\n");
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
  const playerStatusSubscriptionRef = useRef(null);
  const playerSampleSubscriptionRef = useRef(null);
  const visualizerFallbackRef = useRef(null);
  const [upload, { loading: uploadLoading }] = useUpload();
  const [message, setMessage] = useState("");
  const [latestResult, setLatestResult] = useState(null);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState("");
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [visualizerLevels, setVisualizerLevels] = useState(
    DEFAULT_VISUALIZER_LEVELS,
  );
  const [isVisualizerActive, setIsVisualizerActive] = useState(false);
  const [isShareCardVisible, setIsShareCardVisible] = useState(false);
  const shareSheetOpacity = useRef(new Animated.Value(0)).current;
  const shareSheetTranslateY = useRef(new Animated.Value(44)).current;
  const shareBackdropOpacity = useRef(new Animated.Value(0)).current;
  const likeButtonScale = useRef(new Animated.Value(1)).current;
  const likeBurstProgress = useRef(new Animated.Value(0)).current;
  const likeBadgeOpacity = useRef(new Animated.Value(0)).current;
  const likeBadgeTranslateY = useRef(new Animated.Value(10)).current;

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

  const stopVisualizerFallback = useCallback(() => {
    if (visualizerFallbackRef.current) {
      clearInterval(visualizerFallbackRef.current);
      visualizerFallbackRef.current = null;
    }
  }, []);

  const resetVisualizer = useCallback(() => {
    stopVisualizerFallback();
    setIsVisualizerActive(false);
    setVisualizerLevels(DEFAULT_VISUALIZER_LEVELS);
  }, [stopVisualizerFallback]);

  const clearPlayerSubscriptions = useCallback(() => {
    if (playerStatusSubscriptionRef.current?.remove) {
      playerStatusSubscriptionRef.current.remove();
    }

    if (playerSampleSubscriptionRef.current?.remove) {
      playerSampleSubscriptionRef.current.remove();
    }

    playerStatusSubscriptionRef.current = null;
    playerSampleSubscriptionRef.current = null;
  }, []);

  const updateVisualizerFromSample = useCallback(
    (sample) => {
      const frames = sample?.channels?.[0]?.frames;

      if (!frames?.length) {
        return;
      }

      stopVisualizerFallback();
      setIsVisualizerActive(true);

      const bucketSize = Math.max(
        1,
        Math.floor(frames.length / DEFAULT_VISUALIZER_LEVELS.length),
      );

      const nextLevels = DEFAULT_VISUALIZER_LEVELS.map((_, index) => {
        const start = index * bucketSize;
        const end =
          index === DEFAULT_VISUALIZER_LEVELS.length - 1
            ? frames.length
            : start + bucketSize;
        const slice = Array.from(frames.slice(start, end));

        if (!slice.length) {
          return 1;
        }

        const averageAmplitude =
          slice.reduce((sum, value) => sum + Math.abs(value), 0) / slice.length;
        const amplified = Math.min(1, averageAmplitude * 18);
        return Math.max(1, Math.min(9, Math.round(1 + amplified * 8)));
      });

      setVisualizerLevels(nextLevels);
    },
    [stopVisualizerFallback],
  );

  const startVisualizerFallback = useCallback(() => {
    stopVisualizerFallback();
    setIsVisualizerActive(true);

    let tick = 0;
    visualizerFallbackRef.current = setInterval(() => {
      tick += 1;

      setVisualizerLevels((currentLevels) =>
        currentLevels.map((_, index) => {
          const wave = Math.sin(tick * 0.65 + index * 0.8);
          const shimmer = Math.cos(tick * 0.45 + index * 0.55);
          const nextValue = Math.round(
            4 + wave * 2.2 + shimmer * 1.2 + (index === 6 ? 1.2 : 0),
          );

          return Math.max(1, Math.min(9, nextValue));
        }),
      );
    }, 90);
  }, [stopVisualizerFallback]);

  const disposeCurrentPlayer = useCallback(() => {
    clearPlayerSubscriptions();
    resetVisualizer();

    if (playerRef.current) {
      try {
        playerRef.current.pause();
      } catch (pauseError) {
        console.error(pauseError);
      }

      try {
        playerRef.current.remove();
      } catch (removeError) {
        console.error(removeError);
      }

      playerRef.current = null;
    }
  }, [clearPlayerSubscriptions, resetVisualizer]);

  const triggerLikeCelebration = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    likeButtonScale.stopAnimation();
    likeBurstProgress.stopAnimation();
    likeBadgeOpacity.stopAnimation();
    likeBadgeTranslateY.stopAnimation();

    likeButtonScale.setValue(1);
    likeBurstProgress.setValue(0);
    likeBadgeOpacity.setValue(0);
    likeBadgeTranslateY.setValue(10);

    Animated.parallel([
      Animated.sequence([
        Animated.spring(likeButtonScale, {
          toValue: 1.18,
          friction: 5,
          tension: 220,
          useNativeDriver: true,
        }),
        Animated.spring(likeButtonScale, {
          toValue: 1,
          friction: 7,
          tension: 180,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(likeBurstProgress, {
          toValue: 1,
          duration: 620,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(likeBurstProgress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.parallel([
          Animated.timing(likeBadgeOpacity, {
            toValue: 1,
            duration: 160,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(likeBadgeTranslateY, {
            toValue: -18,
            duration: 280,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(380),
        Animated.parallel([
          Animated.timing(likeBadgeOpacity, {
            toValue: 0,
            duration: 180,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(likeBadgeTranslateY, {
            toValue: -28,
            duration: 180,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [
    likeBadgeOpacity,
    likeBadgeTranslateY,
    likeBurstProgress,
    likeButtonScale,
  ]);

  useEffect(() => {
    async function prepare() {
      const permission = await requestRecordingPermissionsAsync();
      setHasMicPermission(Boolean(permission?.granted));
    }

    prepare();
  }, []);

  useEffect(() => {
    return () => {
      clearPlayerSubscriptions();
      stopVisualizerFallback();

      if (playerRef.current) {
        try {
          playerRef.current.pause();
          playerRef.current.remove();
        } catch (cleanupError) {
          console.error(cleanupError);
        }
      }
    };
  }, [clearPlayerSubscriptions, stopVisualizerFallback]);

  const translateMutation = useMutation({
    mutationFn: async (inputText) => {
      const response = await appFetch("/api/pawspeak/translate", {
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
      const response = await appFetch("/api/pawspeak/speak", {
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
      const response = await appFetch("/api/pawspeak/transcribe", {
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

  const playAudio = useCallback(
    (audioUrl) => {
      try {
        disposeCurrentPlayer();

        const player = createAudioPlayer(audioUrl);
        playerRef.current = player;

        startVisualizerFallback();

        if (player.isAudioSamplingSupported) {
          player.setAudioSamplingEnabled(true);
          playerSampleSubscriptionRef.current = player.addListener(
            "audioSampleUpdate",
            updateVisualizerFromSample,
          );
        }

        playerStatusSubscriptionRef.current = player.addListener(
          "playbackStatusUpdate",
          (status) => {
            const isPlaying = Boolean(status?.playing);
            const reachedEnd =
              typeof status?.duration === "number" &&
              typeof status?.currentTime === "number" &&
              status.duration > 0 &&
              status.currentTime >= status.duration - 0.05;

            if (isPlaying) {
              setIsVisualizerActive(true);
              return;
            }

            if (status?.paused || reachedEnd) {
              resetVisualizer();
            }
          },
        );

        player.play();
        setInfo("Playing cat audio...");
      } catch (playerError) {
        console.error(playerError);
        resetVisualizer();
        setError("Could not play the audio.");
      }
    },
    [
      disposeCurrentPlayer,
      resetVisualizer,
      startVisualizerFallback,
      updateVisualizerFromSample,
    ],
  );

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

    triggerLikeCelebration();

    if (currentIsSaved) {
      setInfo("Already in Favorites.");
      return;
    }

    saveMutation.mutate(latestResult);
  }, [currentIsSaved, latestResult, saveMutation, triggerLikeCelebration]);

  const openShareCard = useCallback(async () => {
    if (!latestResult) {
      return;
    }

    await Haptics.selectionAsync();
    setIsShareCardVisible(true);
    shareBackdropOpacity.setValue(0);
    shareSheetOpacity.setValue(0);
    shareSheetTranslateY.setValue(44);

    Animated.parallel([
      Animated.timing(shareBackdropOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(shareSheetOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(shareSheetTranslateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [
    latestResult,
    shareBackdropOpacity,
    shareSheetOpacity,
    shareSheetTranslateY,
  ]);

  const closeShareCard = useCallback(() => {
    Animated.parallel([
      Animated.timing(shareBackdropOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(shareSheetOpacity, {
          toValue: 0,
          duration: 160,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(shareSheetTranslateY, {
          toValue: 36,
          duration: 200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) {
        setIsShareCardVisible(false);
      }
    });
  }, [shareBackdropOpacity, shareSheetOpacity, shareSheetTranslateY]);

  const handleCopyShareText = useCallback(async () => {
    if (!latestResult) {
      return;
    }

    try {
      await Clipboard.setStringAsync(formatShareText(latestResult));
      setInfo("Reply copied. Ready to paste anywhere.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      closeShareCard();
    } catch (clipboardError) {
      console.error(clipboardError);
      Alert.alert("Copy issue", "Could not copy that reply.");
    }
  }, [closeShareCard, latestResult]);

  const handleShareToApps = useCallback(async () => {
    if (!latestResult) {
      return;
    }

    try {
      await Share.share({
        message: formatShareText(latestResult),
      });
      closeShareCard();
    } catch (shareError) {
      console.error(shareError);
      Alert.alert("Share issue", "Could not open the share sheet.");
    }
  }, [closeShareCard, latestResult]);

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
                <View
                  style={{
                    minHeight: 228,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 12,
                    paddingTop: 18,
                    paddingBottom: 28,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: "800",
                      fontStyle: "italic",
                      color: theme.text1,
                      lineHeight: 40,
                      textAlign: "center",
                      maxWidth: 250,
                      marginBottom: 34,
                    }}
                  >
                    "{latestResult.catPhrase}"
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      justifyContent: "center",
                      height: 56,
                    }}
                  >
                    {visualizerLevels.map((val, i) => (
                      <View
                        key={i}
                        style={{
                          width: 5,
                          height: val * 6,
                          backgroundColor: "#FF8C00",
                          borderRadius: 999,
                          opacity: isVisualizerActive
                            ? 0.28 + val * 0.08
                            : 0.18 + val * 0.08,
                        }}
                      />
                    ))}
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    minHeight: 228,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 20,
                    paddingTop: 18,
                    paddingBottom: 28,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "700",
                      color: theme.text2,
                      textAlign: "center",
                      marginBottom: 26,
                      letterSpacing: 0.4,
                    }}
                  >
                    Waiting for your cat's reply
                  </Text>

                  <Text
                    style={{
                      fontSize: 30,
                      fontWeight: "800",
                      fontStyle: "italic",
                      color: theme.text1,
                      textAlign: "center",
                      lineHeight: 42,
                      maxWidth: 240,
                      marginBottom: 34,
                    }}
                  >
                    "Mrow!
                    {"\n"}Mrrrreow!"
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      justifyContent: "center",
                      height: 56,
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1].map((val, i) => (
                      <View
                        key={i}
                        style={{
                          width: 5,
                          height: val * 6,
                          backgroundColor: "#FF8C00",
                          borderRadius: 999,
                          opacity: 0.18 + val * 0.08,
                        }}
                      />
                    ))}
                  </View>
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
                  onPress={openShareCard}
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

                <View
                  style={{
                    position: "relative",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {LIKE_PARTICLES.map((particle, index) => (
                    <Animated.View
                      key={`${particle.x}-${particle.y}-${index}`}
                      pointerEvents="none"
                      style={{
                        position: "absolute",
                        width: particle.size,
                        height: particle.size,
                        borderRadius: 999,
                        backgroundColor: particle.color,
                        opacity: likeBurstProgress.interpolate({
                          inputRange: [0, 0.08, 0.72, 1],
                          outputRange: [0, 0.95, 0.6, 0],
                        }),
                        transform: [
                          {
                            translateX: likeBurstProgress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, particle.x],
                            }),
                          },
                          {
                            translateY: likeBurstProgress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, particle.y],
                            }),
                          },
                          {
                            scale: likeBurstProgress.interpolate({
                              inputRange: [0, 0.25, 1],
                              outputRange: [0.3, 1, 0.4],
                            }),
                          },
                        ],
                      }}
                    />
                  ))}

                  <Animated.View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      bottom: 42,
                      opacity: likeBadgeOpacity,
                      transform: [
                        { translateY: likeBadgeTranslateY },
                        {
                          scale: likeBadgeOpacity.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.88, 1],
                          }),
                        },
                      ],
                    }}
                  >
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 999,
                        backgroundColor: "#FF8C00",
                        shadowColor: "#FF8C00",
                        shadowOpacity: 0.3,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 6 },
                        elevation: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 12,
                          fontWeight: "800",
                        }}
                      >
                        Favorite added
                      </Text>
                    </View>
                  </Animated.View>

                  <Animated.View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      width: 66,
                      height: 66,
                      borderRadius: 999,
                      backgroundColor: isDark
                        ? "rgba(255, 140, 0, 0.14)"
                        : "rgba(255, 140, 0, 0.12)",
                      opacity: likeBurstProgress.interpolate({
                        inputRange: [0, 0.2, 0.9, 1],
                        outputRange: [0, 0.8, 0.18, 0],
                      }),
                      transform: [
                        {
                          scale: likeBurstProgress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.45, 1.55],
                          }),
                        },
                      ],
                    }}
                  />

                  <Animated.View
                    style={{
                      transform: [{ scale: likeButtonScale }],
                    }}
                  >
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
                  </Animated.View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingAnimatedView>

      <Modal
        transparent
        visible={isShareCardVisible}
        animationType="none"
        onRequestClose={closeShareCard}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable
            onPress={closeShareCard}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          >
            <Animated.View
              style={{
                flex: 1,
                backgroundColor: "#000000",
                opacity: shareBackdropOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.48],
                }),
              }}
            />
          </Pressable>

          <Animated.View
            style={{
              paddingHorizontal: 16,
              paddingBottom: insets.bottom + 18,
              opacity: shareSheetOpacity,
              transform: [{ translateY: shareSheetTranslateY }],
            }}
          >
            <View
              style={{
                backgroundColor: theme.surface,
                borderRadius: 30,
                paddingHorizontal: 18,
                paddingTop: 14,
                paddingBottom: 18,
                shadowColor: "#000",
                shadowOpacity: isDark ? 0.35 : 0.16,
                shadowRadius: 22,
                shadowOffset: { width: 0, height: 14 },
                elevation: 16,
                borderWidth: 1,
                borderColor: isDark ? "#2E2E2E" : "#EFEFEF",
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 5,
                    borderRadius: 999,
                    backgroundColor: isDark ? "#3A3A3A" : "#E5E7EB",
                    marginBottom: 16,
                  }}
                />
                <Text
                  style={{
                    color: theme.text1,
                    fontSize: 24,
                    fontWeight: "800",
                    marginBottom: 6,
                  }}
                >
                  Share the cat reply
                </Text>
                <Text
                  style={{
                    color: theme.text2,
                    fontSize: 14,
                    textAlign: "center",
                    maxWidth: 250,
                    lineHeight: 20,
                  }}
                >
                  Turn this moment into a polished post before it leaves the
                  room.
                </Text>
              </View>

              <View
                style={{
                  borderRadius: 24,
                  padding: 18,
                  marginBottom: 16,
                  backgroundColor: isDark ? "#171717" : "#FBFBFB",
                  borderWidth: 1,
                  borderColor: isDark ? "#2C2C2C" : "#F2F2F2",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 18,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "800",
                      letterSpacing: 1,
                      color: theme.text2,
                    }}
                  >
                    CAT TRANSLATE
                  </Text>
                  <View
                    style={{
                      backgroundColor: theme.orangeIconBg,
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FF8C00",
                        fontSize: 11,
                        fontWeight: "800",
                        letterSpacing: 0.6,
                      }}
                    >
                      PAWSPEAK
                    </Text>
                  </View>
                </View>

                <Text
                  style={{
                    color: theme.text1,
                    fontSize: 26,
                    lineHeight: 36,
                    fontStyle: "italic",
                    fontWeight: "800",
                    textAlign: "center",
                    marginBottom: 18,
                  }}
                >
                  "{latestResult?.catPhrase || "Mrrrow..."}"
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    marginBottom: 16,
                  }}
                >
                  {SHARE_PREVIEW_LEVELS.map((level, index) => (
                    <View
                      key={`${level}-${index}`}
                      style={{
                        width: 5,
                        height: level * 4,
                        borderRadius: 999,
                        backgroundColor: "#FF8C00",
                        opacity: 0.2 + level * 0.08,
                      }}
                    />
                  ))}
                </View>

                {latestResult?.humanText ? (
                  <Text
                    style={{
                      color: theme.text2,
                      fontSize: 13,
                      textAlign: "center",
                      lineHeight: 20,
                    }}
                  >
                    You said: {latestResult.humanText}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={handleShareToApps}
                style={{
                  backgroundColor: "#FF8C00",
                  borderRadius: 18,
                  paddingVertical: 16,
                  alignItems: "center",
                  shadowColor: "#FF8C00",
                  shadowOpacity: 0.28,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 8,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: "800",
                  }}
                >
                  Share to apps
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                }}
              >
                <TouchableOpacity
                  onPress={handleCopyShareText}
                  style={{
                    flex: 1,
                    backgroundColor: theme.iconBtnBg,
                    borderRadius: 18,
                    paddingVertical: 15,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: theme.text1,
                      fontSize: 15,
                      fontWeight: "700",
                    }}
                  >
                    Copy text
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={closeShareCard}
                  style={{
                    flex: 1,
                    backgroundColor: theme.iconBtnBg,
                    borderRadius: 18,
                    paddingVertical: 15,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: theme.text2,
                      fontSize: 15,
                      fontWeight: "700",
                    }}
                  >
                    Not now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
