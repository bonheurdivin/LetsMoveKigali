import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function PersonalInfoScreen({ navigation }: any) {
  const { auth, setAuth } = useAuth();
  const [fullName, setFullName] = useState(auth?.user?.fullName || "");
  const [phone, setPhone] = useState(auth?.user?.phone || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put(
        "/auth/me",
        { fullName, phone },
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      setAuth({ user: { ...auth?.user, ...response.data }, token: auth?.token as string });
      Alert.alert("Saved", "Your information has been updated.");
      navigation.goBack();
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Error", "Failed to update your information.");
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
        <Text style={styles.title}>Personal Information</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={{ padding: 20 }}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <Text style={styles.label}>Email (cannot be changed)</Text>
        <TextInput style={[styles.input, styles.disabled]} value={auth?.user?.email} editable={false} />

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Changes</Text>}
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
  disabled: { color: "#999" },
  button: { backgroundColor: "#1B7A3D", borderRadius: 12, padding: 15, alignItems: "center", marginTop: 28 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});