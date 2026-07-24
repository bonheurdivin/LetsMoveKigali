import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const logo = require("../assets/logo.png");

export default function LoginScreen({ navigation }: any) {
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user, token } = response.data;

      setAuth({ user, token });
      navigation.replace("MainTabs");
    } catch (error: any) {
      const message = error.response?.data?.error || "Something went wrong. Check your connection.";
      Alert.alert("Login failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={logo} style={styles.logoImage} resizeMode="contain" />
      <Text style={styles.logo}>
        Let'sMove <Text style={{ color: "#1B7A3D" }}>Kigali</Text>
      </Text>
      <Text style={styles.tagline}>Move Smarter. Travel Better.</Text>

      <Text style={styles.welcome}>Welcome back!</Text>
      <Text style={styles.welcomeSub}>Login to continue your journey.</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Email or Phone Number</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={18} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Please enter your email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#999" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>Login</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.safetyBox}>
          <Ionicons name="shield-checkmark" size={20} color="#1B7A3D" />
          <Text style={styles.safetyText}>Your data is safe with us. We protect your information and keep your journey secure.</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("Signup")} style={{ marginTop: 20 }}>
          <Text style={{ textAlign: "center", color: "#666" }}>
            Don't have an account? <Text style={{ color: "#1B7A3D", fontWeight: "700" }}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", padding: 24, paddingTop: 40 },
  logoImage: { width: 88, height: 88, marginBottom: 8 },
  logo: { fontSize: 24, fontWeight: "800", color: "#222" },
  tagline: { color: "#888", marginTop: 2, marginBottom: 20, fontSize: 13 },
  welcome: { fontSize: 20, fontWeight: "700", alignSelf: "flex-start" },
  welcomeSub: { color: "#888", alignSelf: "flex-start", marginBottom: 20, fontSize: 13 },
  form: { width: "100%" },
  label: { fontSize: 13, color: "#444", marginBottom: 6, marginTop: 14, fontWeight: "600" },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 12,
    paddingHorizontal: 14, backgroundColor: "#FAFAFA",
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: "#222" },
  button: {
    flexDirection: "row", gap: 8,
    backgroundColor: "#1B7A3D", borderRadius: 12, padding: 15,
    alignItems: "center", justifyContent: "center", marginTop: 24,
    shadowColor: "#1B7A3D", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  safetyBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#EAF7EF", borderRadius: 12, padding: 12, marginTop: 20,
  },
  safetyText: { flex: 1, fontSize: 12, color: "#3a6b4a" },
});