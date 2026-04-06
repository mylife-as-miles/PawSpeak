import { Tabs } from "expo-router";
import { User, Music, Wand2 } from "lucide-react-native";
import { useAppTheme } from "@/utils/themeStore";

export default function TabLayout() {
  const { isDark } = useAppTheme();

  const backgroundColor = isDark ? "#121212" : "#FFFFFF";
  const borderTopColor = isDark ? "#2C2C2C" : "#F3F4F6";
  const inactiveTintColor = isDark ? "#6B7280" : "#9CA3AF";
  const sceneBackgroundColor = isDark ? "#121212" : "#FAFAFA";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor,
          borderTopWidth: 1,
          borderTopColor,
          paddingTop: 6,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: "#FF8C00",
        tabBarInactiveTintColor: inactiveTintColor,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
        sceneStyle: {
          backgroundColor: sceneBackgroundColor,
        },
      }}
      initialRouteName="home"
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Translator",
          tabBarIcon: ({ color, size }) => <Wand2 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Moods",
          tabBarIcon: ({ color, size }) => <Music color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
