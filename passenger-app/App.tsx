import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider } from "./context/AuthContext";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import LiveMapScreen from "./screens/LiveMapScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import PersonalInfoScreen from "./screens/PersonalInfoScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import MainTabs from "./navigation/MainTabs";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="LiveMap" component={LiveMapScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}