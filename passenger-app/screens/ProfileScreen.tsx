import React from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import TopBar from "../components/TopBar";

export default function ProfileScreen({ navigation }: any) {
  const { auth, setAuth } = useAuth();

  const handleLogout = () => {
    setAuth(null);
    navigation.getParent()?.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const Row = ({ icon, label, onPress, danger }: any) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={18} color={danger ? "#C0392B" : "#555"} />
        <Text style={[styles.rowLabel, danger && { color: "#C0392B" }]}>{label}</Text>
      </View>
      {!danger && <Ionicons name="chevron-forward" size={16} color="#ccc" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <TopBar title="Profile" />
        <View style={{ paddingHorizontal: 0 }}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{auth?.user?.fullName?.charAt(0) || "?"}</Text>
          </View>
          <View>
            <Text style={styles.name}>{auth?.user?.fullName}</Text>
            <Text style={styles.email}>{auth?.user?.email}</Text>
          </View>
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() => navigation.getParent()?.navigate("PersonalInfo")}
          >
            <Ionicons name="pencil" size={14} color="#1B7A3D" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <Row icon="person-outline" label="Personal Information" onPress={() => navigation.getParent()?.navigate("PersonalInfo")} />
          <Row icon="key-outline" label="Change Password" onPress={() => navigation.getParent()?.navigate("ChangePassword")} />
        </View>

        <Text style={styles.sectionLabel}>MY DATA</Text>
        <View style={styles.card}>
          <Row icon="heart-outline" label="Favorites" onPress={() => navigation.getParent()?.navigate("Favorites")} />
        </View>

        <Text style={styles.sectionLabel}>GENERAL</Text>
        <View style={styles.card}>
          <Row icon="log-out-outline" label="Log Out" onPress={handleLogout} danger />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 20 },
  profileHeader: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#F3F4F6", borderRadius: 16, padding: 16, marginBottom: 24,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: "#1B7A3D",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  name: { fontSize: 16, fontWeight: "700" },
  email: { fontSize: 12.5, color: "#666", marginTop: 2 },
  editIcon: {
    marginLeft: "auto", width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#EAF7EF", alignItems: "center", justifyContent: "center",
  },
  sectionLabel: { fontSize: 11.5, color: "#999", fontWeight: "700", marginBottom: 8, marginTop: 4, letterSpacing: 0.5 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#f0f0f0", marginBottom: 20,
  },
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#f5f5f5",
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowLabel: { fontSize: 14, color: "#333", fontWeight: "500" },
});