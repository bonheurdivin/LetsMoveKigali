import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ChangePasswordScreen({ navigation }: any) {
  const { auth } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing info", "Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.put(
        "/auth/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      Alert.alert("Success", "Password updated successfully.");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.error || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={{ padding: 20 }}>
        <Text style={styles.label}>Current Password</Text>
        <TextInput style={styles.input} secureTextEntry value={currentPassword} onChangeText={setCurrentPassword} />

        <Text style={styles.label}>New Password</Text>
        <TextInput style={styles.input} secureTextEntry value={newPassword} onChangeText={setNewPassword} />

        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput style={styles.input} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Password</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  title: { fontSize: 17, fontWeight: "800" },
  label: { fontSize: 13, color: "#444", marginBottom: 6, marginTop: 16, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: "#FAFAFA" },
  button: { backgroundColor: "#1B7A3D", borderRadius: 12, padding: 15, alignItems: "center", marginTop: 28 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});