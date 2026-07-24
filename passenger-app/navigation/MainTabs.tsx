import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import MapScreen from "../screens/MapScreen";
import SearchScreen from "../screens/SearchScreen";
import AlertsScreen from "../screens/AlertsScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const icons: Record<string, string> = {
  Home: "home",
  Map: "map",
  Search: "search",
  Alerts: "notifications",
  Profile: "person",
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#1B7A3D",
        tabBarInactiveTintColor: "#aaa",
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: "600" },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={(focused ? icons[route.name] : `${icons[route.name]}-outline`) as any}
            size={size ? size - 2 : 20}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}