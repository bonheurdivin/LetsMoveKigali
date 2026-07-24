import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import TopBar from "../components/TopBar";

const routeColors = ["#1B7A3D", "#2563EB", "#7C3AED", "#DB2777", "#EA580C"];

export default function HomeScreen({ navigation }: any) {
  const { auth } = useAuth();
  const user = auth?.user;
  const token = auth?.token;
  const [routes, setRoutes] = useState<any[]>([]);
  const [favoriteRouteIds, setFavoriteRouteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
    fetchFavorites();
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

  const fetchFavorites = async () => {
    try {
      const response = await api.get("/api/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavoriteRouteIds(new Set(response.data.map((f: any) => f.routeId)));
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  };

  const toggleFavorite = async (routeId: string) => {
    try {
      if (favoriteRouteIds.has(routeId)) {
        await api.delete(`/api/favorites/${routeId}`, { headers: { Authorization: `Bearer ${token}` } });
        setFavoriteRouteIds((prev) => {
          const next = new Set(prev);
          next.delete(routeId);
          return next;
        });
      } else {
        await api.post("/api/favorites", { routeId }, { headers: { Authorization: `Bearer ${token}` } });
        setFavoriteRouteIds((prev) => new Set(prev).add(routeId));
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const quickActions = [
    { label: "Find Route", icon: "navigate-outline", onPress: () => navigation.navigate("Search") },
    { label: "Live Map", icon: "map-outline", onPress: () => navigation.navigate("Map") },
    { label: "Favorites", icon: "star-outline", onPress: () => navigation.getParent()?.navigate("Favorites") },
    { label: "Recent", icon: "time-outline", onPress: () => navigation.navigate("Search") },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        ListHeaderComponent={
          <>
            <TopBar />
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.greeting}>Hello {user?.fullName?.split(" ")[0]} 👋</Text>
                <Text style={styles.subtext}>Where are you going today?</Text>
              </View>
              <TouchableOpacity style={styles.bellButton} onPress={() => navigation.navigate("Alerts")}>
                <Ionicons name="notifications-outline" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate("Search")} activeOpacity={0.7}>
              <Ionicons name="search-outline" size={18} color="#999" />
              <Text style={styles.searchPlaceholder}>Search for destination or bus route</Text>
            </TouchableOpacity>

            <View style={styles.quickActionsRow}>
              {quickActions.map((action) => (
                <TouchableOpacity key={action.label} style={styles.quickAction} onPress={action.onPress}>
                  <Ionicons name={action.icon as any} size={20} color="#1B7A3D" />
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Available Routes</Text>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#1B7A3D" style={{ marginTop: 20 }} />
          ) : (
            <Text style={styles.emptyText}>No routes found yet.</Text>
          )
        }
        renderItem={({ item, index }) => {
          const color = routeColors[index % routeColors.length];
          const isFavorite = favoriteRouteIds.has(item.id);
          return (
            <TouchableOpacity
              style={styles.routeCard}
              onPress={() => navigation.getParent()?.navigate("LiveMap", { routeId: item.id, routeName: item.name })}
            >
              <View style={[styles.busIcon, { backgroundColor: color }]}>
                <Ionicons name="bus" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.routeName}>{item.name}</Text>
                <Text style={styles.routeSub}>{item.startPoint} → {item.endPoint}</Text>
                <View style={styles.stopsRow}>
                  <Ionicons name="location-outline" size={12} color="#999" />
                  <Text style={styles.routeStops}>{item.stops?.length || 0} stops</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(item.id)} hitSlop={10}>
                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#DB2777" : "#ccc"} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: "800", color: "#222" },
  subtext: { color: "#888", marginTop: 4 },
  bellButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#F3F4F6",
    alignItems: "center", justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1, borderColor: "#eee", backgroundColor: "#FAFAFA",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 20,
  },
  searchPlaceholder: { flex: 1, fontSize: 14, color: "#aaa" },
  quickActionsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  quickAction: {
    alignItems: "center", gap: 6, backgroundColor: "#F3F4F6",
    borderRadius: 12, paddingVertical: 12, width: "23%",
  },
  quickActionLabel: { fontSize: 10.5, color: "#444", fontWeight: "600", textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, color: "#222" },
  emptyText: { color: "#999", textAlign: "center", marginTop: 20 },
  routeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  busIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  routeName: { fontSize: 15, fontWeight: "700", color: "#222" },
  routeSub: { fontSize: 12.5, color: "#777", marginTop: 2 },
  stopsRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  routeStops: { fontSize: 11, color: "#999" },
});