import { Tabs } from "expo-router";
import * as Haptics from "expo-haptics";
import { Music, User, Wand2 } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Platform,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/utils/themeStore";

const TAB_CONFIG = {
  home: {
    title: "Translator",
    Icon: Wand2,
  },
  library: {
    title: "Moods",
    Icon: Music,
  },
  saved: {
    title: "Profile",
    Icon: User,
  },
};

function PremiumTabBar({ state, descriptors, navigation, insets, isDark }) {
  const [barWidth, setBarWidth] = useState(0);
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  const shellColor = isDark ? "#171717" : "#FFFFFF";
  const shellBorder = isDark ? "rgba(255, 140, 0, 0.72)" : "rgba(255, 140, 0, 0.36)";
  const shellEdge = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.72)";
  const inactiveTint = isDark ? "#737373" : "#9AA1AA";
  const activePlate = isDark ? "#3C2B16" : "#FFF3E3";
  const activePlateBorder = isDark
    ? "rgba(255, 140, 0, 0.12)"
    : "rgba(255, 140, 0, 0.18)";
  const barPadding = 7;
  const tabCount = state.routes.length;
  const trackWidth = Math.max(barWidth - barPadding * 2, 0);
  const segmentWidth = tabCount > 0 ? trackWidth / tabCount : 0;
  const activePlateWidth = segmentWidth > 0 ? Math.max(segmentWidth - 8, 0) : 0;
  const activePlateStart =
    barPadding + (segmentWidth > 0 ? (segmentWidth - activePlateWidth) / 2 : 0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduceMotionEnabled)
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener?.(
      "reduceMotionChanged",
      setReduceMotionEnabled
    );

    return () => {
      subscription?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (!segmentWidth) {
      return;
    }

    const toValue = state.index * segmentWidth;

    if (reduceMotionEnabled) {
      translateX.setValue(toValue);
      return;
    }

    Animated.spring(translateX, {
      toValue,
      tension: 240,
      friction: 24,
      useNativeDriver: true,
    }).start();
  }, [reduceMotionEnabled, segmentWidth, state.index, translateX]);

  const handlePress = useCallback(
    (route, isFocused) => {
      Haptics.selectionAsync().catch(() => {});

      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    },
    [navigation]
  );

  const bottomOffset = Math.max(insets.bottom, 10);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: "100%",
          alignItems: "center",
          paddingBottom: bottomOffset,
        }}
      >
        <View
          onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
          style={{
            width: "92%",
            maxWidth: 372,
            height: 56,
            shadowColor: "#FF8C00",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: isDark ? 0.22 : 0.12,
            shadowRadius: 18,
            elevation: 14,
          }}
        >
          <View
            style={{
              flex: 1,
              borderRadius: 999,
              backgroundColor: shellColor,
              borderWidth: 1,
              borderColor: shellBorder,
              overflow: "hidden",
            }}
          >
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: 1,
                backgroundColor: shellEdge,
              }}
            />

            {activePlateWidth > 0 ? (
              <Animated.View
                style={{
                  position: "absolute",
                  top: 6,
                  left: activePlateStart,
                  width: activePlateWidth,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: activePlate,
                  borderWidth: 1,
                  borderColor: activePlateBorder,
                  shadowColor: "#FF8C00",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: isDark ? 0.18 : 0.08,
                  shadowRadius: 14,
                  transform: [{ translateX }],
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    height: 1,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(255,255,255,0.7)",
                  }}
                />
              </Animated.View>
            ) : null}

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                paddingHorizontal: barPadding,
              }}
            >
              {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const config = TAB_CONFIG[route.name] || TAB_CONFIG.home;
                const Icon = config.Icon;
                const color = isFocused ? "#FF8C00" : inactiveTint;
                const iconSize = 20;

                return (
                  <Pressable
                    key={route.key}
                    accessibilityRole="button"
                    accessibilityState={isFocused ? { selected: true } : {}}
                    accessibilityLabel={descriptors[route.key].options.title || config.title}
                    onPress={() => handlePress(route, isFocused)}
                    onLongPress={() =>
                      navigation.emit({
                        type: "tabLongPress",
                        target: route.key,
                      })
                    }
                    style={({ pressed }) => ({
                      width: segmentWidth || undefined,
                      flex: segmentWidth ? 0 : 1,
                      alignItems: "center",
                      justifyContent: "center",
                      transform: [
                        {
                          scale:
                            pressed && !reduceMotionEnabled
                              ? 0.96
                              : isFocused
                                ? 1.02
                                : 1,
                        },
                      ],
                      opacity: pressed ? 0.9 : 1,
                    })}
                  >
                    <Animated.View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        transform: [
                          {
                            translateY:
                              isFocused && !reduceMotionEnabled ? -0.5 : 0,
                          },
                        ],
                      }}
                    >
                      <Icon
                        color={color}
                        size={iconSize}
                        strokeWidth={isFocused ? 2.3 : 2}
                        absoluteStrokeWidth={Platform.OS === "web"}
                      />
                    </Animated.View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const sceneBackgroundColor = useMemo(
    () => (isDark ? "#121212" : "#FAFAFA"),
    [isDark]
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        sceneStyle: {
          backgroundColor: sceneBackgroundColor,
        },
      }}
      tabBar={(props) => (
        <PremiumTabBar {...props} insets={insets} isDark={isDark} />
      )}
      initialRouteName="home"
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Translator",
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Moods",
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
