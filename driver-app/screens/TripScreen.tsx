import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import api from "../services/api";
import socket from "../services/socket";

export default function TripScreen({ route }: any) {
  const { user, token } = route.params;
  const [loading, setLoading] = useState(true);
  const [assignedBus, setAssignedBus] = useState<any>(null);
  const [tripActive, setTripActive] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    fetchAssignedBus();
    return () => {
      // Clean up location tracking if the screen unmounts mid-trip
      locationSubscription.current?.remove();
    };
  }, []);

  const fetchAssignedBus = async () => {
    try {
      const response = await api.get("/api/buses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Find the bus assigned to this driver (matched by driver relation from seed data)
      const buses = response.data;
      const myBus = buses.find((b: any) => b.route); // simplified: first bus with a route for now
      setAssignedBus(myBus || buses[0] || null);
    } catch (error) {
      console.error("Failed to fetch assigned bus:", error);
    } finally {
      setLoading(false);
    }
  };

  const startTrip = async () => {
    if (!assignedBus) {
      Alert.alert("No bus assigned", "You don't have a bus assigned yet.");
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Location permission is required to start a trip.");
      return;
    }

    try {
      const response = await api.post(
        "/trips/start",
        { routeId: assignedBus.routeId, busId: assignedBus.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const tripId = response.data.id;
      setCurrentTripId(tripId);
      setTripActive(true);

      // Start sending GPS updates every 3 seconds
      locationSubscription.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
        (location) => {
          socket.emit("gps:update", {
            tripId,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            speed: location.coords.speed || 0,
          });
        }
      );

      Alert.alert("Trip started", "Your location is now being shared live.");
    } catch (error) {
      console.error("Start trip error:", error);
      Alert.alert("Error", "Failed to start trip.");
    }
  };

  const stopTrip = async () => {
    if (!currentTripId) return;

    try {
      await api.put(`/trips/${currentTripId}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      locationSubscription.current?.remove();
      locationSubscription.current = null;
      setTripActive(false);
      setCurrentTripId(null);

      Alert.alert("Trip ended", "You have stopped sharing your location.");
    } catch (error) {
      console.error("Stop trip error:", error);
      Alert.alert("Error", "Failed to end trip.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1B7A3D" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.greeting}>Hello, {user.fullName} 🚍</Text>

      {assignedBus ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Assigned Bus</Text>
          <Text style={styles.cardValue}>{assignedBus.busNumber} ({assignedBus.plateNumber})</Text>
          <Text style={styles.cardLabel}>Route</Text>
          <Text style={styles.cardValue}>{assignedBus.route?.name || "Not assigned"}</Text>
        </View>
      ) : (
        <Text style={styles.emptyText}>No bus assigned to you yet.</Text>
      )}

      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: tripActive ? "#1B7A3D" : "#ccc" }]} />
        <Text style={styles.statusText}>{tripActive ? "Trip in progress — sharing live location" : "Not on a trip"}</Text>
      </View>

      {!tripActive ? (
        <TouchableOpacity style={styles.startButton} onPress={startTrip}>
          <Text style={styles.buttonText}>Start Trip</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.stopButton} onPress={stopTrip}>
          <Text style={styles.buttonText}>Stop Trip</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 24, justifyContent: "center" },
  greeting: { fontSize: 22, fontWeight: "bold", marginBottom: 24, textAlign: "center" },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  cardLabel: { fontSize: 12, color: "#999", marginTop: 8 },
  cardValue: { fontSize: 16, fontWeight: "600", color: "#222" },
  emptyText: { textAlign: "center", color: "#999", marginBottom: 24 },
  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusText: { fontSize: 14, color: "#444" },
  startButton: { backgroundColor: "#1B7A3D", borderRadius: 8, padding: 16, alignItems: "center" },
  stopButton: { backgroundColor: "#C0392B", borderRadius: 8, padding: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});