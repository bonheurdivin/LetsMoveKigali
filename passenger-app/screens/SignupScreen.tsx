import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const logo = require("../assets/logo.png");

export default function SignupScreen({ navigation }: any) {
  const { setAuth } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Missing info", "Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        fullName, email, phone, password, role: "PASSENGER",
      });
      const { user, token } = response.data;
      setAuth({ user, token });
      navigation.replace("MainTabs");
    } catch (error: any) {
      const message = error.response?.data?.error || "Something went wrong. Check your connection.";
      Alert.alert("Signup failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 30 }}>
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Join Let'sMove Kigali and start your journey.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#999" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Enter your full name" placeholderTextColor="#aaa" value={fullName} onChangeText={setFullName} />
          </View>

          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#999" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Please enter your email" placeholderTextColor="#aaa" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          </View>

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={18} color="#999" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Enter your phone number" placeholderTextColor="#aaa" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#999" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Create a password" placeholderTextColor="#aaa" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#999" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#999" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Confirm your password" placeholderTextColor="#aaa" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Text style={styles.buttonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")} style={{ marginTop: 18 }}>
            <Text style={styles.loginLink}>Already have an account? <Text style={{ fontWeight: "700", color: "#1B7A3D" }}>Login</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  logoImage: { width: 72, height: 72, alignSelf: "center", marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "800", textAlign: "center", color: "#222" },
  subtitle: { color: "#888", textAlign: "center", marginBottom: 20, marginTop: 4, fontSize: 13 },
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
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  loginLink: { textAlign: "center", color: "#666", fontSize: 14 },
});