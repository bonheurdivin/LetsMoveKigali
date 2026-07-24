import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import TopBar from "../components/TopBar";

export default function SearchScreen({ navigation }: any) {
  const { auth } = useAuth();
  const token = auth?.token;
  const [query, setQuery] = useState("");
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await api.get("/api/routes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoutes(response.data);
    } catch (error) {
      console.error("Failed to fetch routes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = routes.filter((r) =>
    `${r.name} ${r.startPoint} ${r.endPoint}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title="Search" />

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#999" />
        <TextInput
          placeholder="Search by destination, stop, or route name"
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={18} color="#ccc" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1B7A3D" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No matching routes found.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultRow}
              onPress={() => navigation.getParent()?.navigate("LiveMap", { routeId: item.id, routeName: item.name })}
            >
              <View style={styles.resultIcon}>
                <Ionicons name="bus" size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultSub}>{item.startPoint} → {item.endPoint}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 16 },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1, borderColor: "#eee", backgroundColor: "#FAFAFA",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#222" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 30 },
  resultRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f2f2f2",
  },
  resultIcon: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: "#1B7A3D",
    alignItems: "center", justifyContent: "center",
  },
  resultName: { fontSize: 14.5, fontWeight: "700", color: "#222" },
  resultSub: { fontSize: 12.5, color: "#888", marginTop: 2 },
});