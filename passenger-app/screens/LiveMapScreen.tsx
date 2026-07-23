import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import api from "../services/api";
import socket from "../services/socket";

export default function LiveMapScreen({ route: navRoute }: any) {
  const { token, routeId, routeName } = navRoute.params;

  const [loading, setLoading] = useState(true);
  const [tripId, setTripId] = useState<string | null>(null);
  const [busPosition, setBusPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [speed, setSpeed] = useState<number>(0);
  const [noActiveTrip, setNoActiveTrip] = useState(false);

  // Step 1: find an active trip for this route
  useEffect(() => {
    const findActiveTrip = async () => {
      try {
        const response = await api.get("/trips/active", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const trips = response.data;
        const matchingTrip = trips.find((t: any) => t.routeId === routeId);

        if (matchingTrip) {
          setTripId(matchingTrip.id);
        } else {
          setNoActiveTrip(true);
        }
      } catch (error) {
        console.error("Failed to fetch active trips:", error);
        setNoActiveTrip(true);
      } finally {
        setLoading(false);
      }
    };

    findActiveTrip();
  }, []);

  // Step 2: listen for live GPS updates once we have a tripId
  useEffect(() => {
    if (!tripId) return;

    const eventName = `gps:${tripId}`;

    const handleUpdate = (location: any) => {
      setBusPosition({ latitude: location.latitude, longitude: location.longitude });
      setSpeed(location.speed || 0);
    };

    socket.on(eventName, handleUpdate);

    return () => {
      socket.off(eventName, handleUpdate);
    };
  }, [tripId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#1B7A3D" />
      </SafeAreaView>
    );
  }

  if (noActiveTrip) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>{routeName}</Text>
        <Text style={styles.emptyText}>No bus is currently active on this route.</Text>
        <Text style={styles.hintText}>Ask the driver to press "Start Trip" on their app.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>{routeName}</Text>
        <Text style={styles.subtitle}>
          {busPosition ? `Live • Speed: ${speed.toFixed(1)} km/h` : "Waiting for GPS signal..."}
        </Text>
      </View>

      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: busPosition?.latitude || -1.9499,
          longitude: busPosition?.longitude || 30.0589,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        region={
          busPosition
            ? {
                latitude: busPosition.latitude,
                longitude: busPosition.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }
            : undefined
        }
      >
        {busPosition && (
          <Marker
            coordinate={busPosition}
            title="Bus"
            description={`Speed: ${speed.toFixed(1)} km/h`}
            pinColor="#1B7A3D"
          />
        )}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { fontSize: 13, color: "#666", marginTop: 4 },
  emptyText: { fontSize: 15, color: "#666", textAlign: "center", marginTop: 12 },
  hintText: { fontSize: 13, color: "#999", textAlign: "center", marginTop: 6 },
});