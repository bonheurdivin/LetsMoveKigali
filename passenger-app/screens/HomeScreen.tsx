import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import api from "../services/api";

export default function HomeScreen({ route, navigation }: any) {
  const { user, token } = route.params;
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello {user.fullName.split(" ")[0]} 👋</Text>
        <Text style={styles.subtext}>Where are you going today?</Text>
      </View>

      <TextInput style={styles.searchBar} placeholder="Search for destination or bus route" />

      <Text style={styles.sectionTitle}>Available Routes</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1B7A3D" style={{ marginTop: 20 }} />
      ) : routes.length === 0 ? (
        <Text style={styles.emptyText}>No routes found yet.</Text>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.routeCard}
              onPress={() =>
                navigation.navigate("LiveMap", { token, routeId: item.id, routeName: item.name })
              }
            >
              <View style={styles.busIcon}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {routes.findIndex((r) => r.id === item.id) + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.routeName}>{item.name}</Text>
                <Text style={styles.routeSub}>
                  {item.startPoint} → {item.endPoint}
                </Text>
                <Text style={styles.routeStops}>{item.stops?.length || 0} stops</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: "bold" },
  subtext: { color: "#666", marginTop: 4 },
  searchBar: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  emptyText: { color: "#999", textAlign: "center", marginTop: 20 },
  routeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    marginBottom: 10,
  },
  busIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1B7A3D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  routeName: { fontSize: 15, fontWeight: "600" },
  routeSub: { fontSize: 13, color: "#666", marginTop: 2 },
  routeStops: { fontSize: 12, color: "#999", marginTop: 2 },
});