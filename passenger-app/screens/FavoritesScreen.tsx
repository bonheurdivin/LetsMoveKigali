import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function FavoritesScreen({ navigation }: any) {
  const { auth } = useAuth();
  const token = auth?.token;
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await api.get("/api/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(response.data);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (routeId: string) => {
    try {
      await api.delete(`/api/favorites/${routeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFavorites();
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Favorites</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1B7A3D" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No favorite routes yet. Tap the heart icon on any route to save it here.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("LiveMap", { routeId: item.route.id, routeName: item.route.name })}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="bus" size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.routeName}>{item.route.name}</Text>
                <Text style={styles.routeSub}>{item.route.startPoint} → {item.route.endPoint}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemove(item.route.id)}>
                <Ionicons name="heart" size={20} color="#DB2777" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "800" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 30, paddingHorizontal: 20 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderWidth: 1, borderColor: "#f0f0f0", borderRadius: 14, marginBottom: 10,
  },
  iconCircle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#1B7A3D",
    alignItems: "center", justifyContent: "center",
  },
  routeName: { fontSize: 14.5, fontWeight: "700" },
  routeSub: { fontSize: 12.5, color: "#888", marginTop: 2 },
});