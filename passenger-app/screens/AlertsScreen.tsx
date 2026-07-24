import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import TopBar from "../components/TopBar";

const typeStyles: Record<string, { bg: string; label: string }> = {
  delay: { bg: "#FEF3C7", label: "Route Delay" },
  arrival: { bg: "#DBEAFE", label: "Bus Arrival" },
  service_update: { bg: "#D1FAE5", label: "Service Update" },
  info: { bg: "#F3F4F6", label: "Info" },
};

export default function AlertsScreen() {
  const { auth } = useAuth();
  const token = auth?.token;
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await api.get("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(response.data);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  const timeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title="Alerts" />

      {loading ? (
        <ActivityIndicator size="large" color="#1B7A3D" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No alerts right now.</Text>}
          renderItem={({ item }) => {
            const style = typeStyles[item.type] || typeStyles.info;
            return (
              <View style={styles.card}>
                <View style={[styles.badge, { backgroundColor: style.bg }]}>
                  <Text style={styles.badgeText}>{style.label}</Text>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMessage}>{item.message}</Text>
                <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40 },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  badgeText: { fontSize: 11, fontWeight: "600", color: "#333" },
  cardTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  cardMessage: { fontSize: 13, color: "#555", marginBottom: 6 },
  cardTime: { fontSize: 11, color: "#999" },
});