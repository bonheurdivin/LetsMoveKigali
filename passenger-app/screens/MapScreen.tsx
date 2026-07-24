import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import api from "../services/api";
import socket from "../services/socket";
import { useAuth } from "../context/AuthContext";
import TopBar from "../components/TopBar";

export default function MapScreen() {
  const { auth } = useAuth();
  const token = auth?.token;
  const [activeTrips, setActiveTrips] = useState<any[]>([]);
  const [positions, setPositions] = useState<Record<string, { latitude: number; longitude: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveTrips();
  }, []);

  const fetchActiveTrips = async () => {
    try {
      const response = await api.get("/trips/active", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveTrips(response.data);
    } catch (error) {
      console.error("Failed to fetch active trips:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handlers: { event: string; fn: (loc: any) => void }[] = [];

    activeTrips.forEach((trip) => {
      const eventName = `gps:${trip.id}`;
      const handler = (location: any) => {
        setPositions((prev) => ({
          ...prev,
          [trip.id]: { latitude: location.latitude, longitude: location.longitude },
        }));
      };
      socket.on(eventName, handler);
      handlers.push({ event: eventName, fn: handler });
    });

    return () => {
      handlers.forEach(({ event, fn }) => socket.off(event, fn));
    };
  }, [activeTrips]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#1B7A3D" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar title="Live Map" />
      <View style={styles.header}>
        <Text style={styles.title}>Live Map</Text>
        <Text style={styles.subtitle}>
          {activeTrips.length > 0 ? `${activeTrips.length} bus(es) currently active` : "No buses currently active"}
        </Text>
      </View>

      <MapView
        style={{ flex: 1 }}
        initialRegion={{ latitude: -1.9499, longitude: 30.0589, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
      >
        {activeTrips.map((trip) => {
          const pos = positions[trip.id];
          if (!pos) return null;
          return (
            <Marker
              key={trip.id}
              coordinate={pos}
              title={`Bus ${trip.bus?.busNumber || ""}`}
              description={trip.route?.name || ""}
              pinColor="#1B7A3D"
            />
          );
        })}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  title: { fontSize: 18, fontWeight: "800" },
  subtitle: { fontSize: 13, color: "#666", marginTop: 4 },
});