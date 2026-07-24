import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";
import socket from "../services/socket";
import { useAuth } from "../context/AuthContext";

// Haversine formula — distance in km between two lat/lng points
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Fetches a real, road-following path between stops using the free OSRM routing service.
// Falls back silently to straight lines between stops if the request fails.
async function fetchRoadPathFromOSRM(stops: any[]): Promise<{ latitude: number; longitude: number }[]> {
  if (stops.length < 2) return [];
  try {
    const coordsStr = stops.map((s) => `${s.longitude},${s.latitude}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== "Ok" || !data.routes?.[0]?.geometry?.coordinates) {
      return stops.map((s) => ({ latitude: s.latitude, longitude: s.longitude }));
    }

    // OSRM returns [longitude, latitude] pairs — convert to the {latitude, longitude} format react-native-maps expects
    return data.routes[0].geometry.coordinates.map(([lon, lat]: [number, number]) => ({
      latitude: lat,
      longitude: lon,
    }));
  } catch (error) {
    console.error("OSRM routing failed, falling back to straight lines:", error);
    return stops.map((s) => ({ latitude: s.latitude, longitude: s.longitude }));
  }
}

export default function LiveMapScreen({ route: navRoute, navigation }: any) {
  const { auth } = useAuth();
  const token = auth?.token;
  const { routeId, routeName } = navRoute.params;

  const [loading, setLoading] = useState(true);
  const [stops, setStops] = useState<any[]>([]);
  const [roadPath, setRoadPath] = useState<{ latitude: number; longitude: number }[]>([]);
  const [tripId, setTripId] = useState<string | null>(null);
  const [busPosition, setBusPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [speed, setSpeed] = useState<number>(0);
  const [noActiveTrip, setNoActiveTrip] = useState(false);

  const fetchRoadPath = async (stopsData: any[]) => {
    const path = await fetchRoadPathFromOSRM(stopsData);
    setRoadPath(path);
  };

  useEffect(() => {
    const setup = async () => {
      try {
        const [stopsRes, tripsRes] = await Promise.all([
          api.get(`/api/stops/${routeId}`, { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/trips/active", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setStops(stopsRes.data);
        fetchRoadPath(stopsRes.data);

        const matchingTrip = tripsRes.data.find((t: any) => t.routeId === routeId);
        if (matchingTrip) {
          setTripId(matchingTrip.id);
        } else {
          setNoActiveTrip(true);
        }
      } catch (error) {
        console.error("Failed to load route data:", error);
        setNoActiveTrip(true);
      } finally {
        setLoading(false);
      }
    };
    setup();
  }, []);

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

  // Figure out which stop is "next" based on proximity to the bus
  let nextStopIndex = -1;
  let distanceToNext = 0;
  if (busPosition && stops.length > 0) {
    let minDist = Infinity;
    stops.forEach((stop, index) => {
      const d = distanceKm(busPosition.latitude, busPosition.longitude, stop.latitude, stop.longitude);
      if (d < minDist) {
        minDist = d;
        nextStopIndex = index;
      }
    });
    distanceToNext = minDist;
  }

  const etaMinutes =
    speed > 2 && distanceToNext > 0 ? Math.max(1, Math.round((distanceToNext / speed) * 60)) : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#1B7A3D" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#222" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.title}>{routeName}</Text>
          <Text style={styles.subtitle}>
            {noActiveTrip
              ? "No bus currently active on this route"
              : busPosition
              ? `Live • ${speed.toFixed(0)} km/h`
              : "Waiting for GPS signal..."}
          </Text>
        </View>
      </View>

      <MapView
        style={{ height: "45%" }}
        initialRegion={{
          latitude: stops[0]?.latitude || busPosition?.latitude || -1.9499,
          longitude: stops[0]?.longitude || busPosition?.longitude || 30.0589,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {roadPath.length > 1 && (
          <Polyline
            coordinates={roadPath}
            strokeColor="#1B7A3D"
            strokeWidth={4}
          />
        )}
        {stops.map((stop, index) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={stop.name}
            pinColor={index === nextStopIndex ? "#1B7A3D" : "#999"}
          />
        ))}
        {busPosition && (
          <Marker coordinate={busPosition} title="Bus" description={`${speed.toFixed(0)} km/h`}>
            <View style={styles.busMarker}>
              <Ionicons name="bus" size={16} color="#fff" />
            </View>
          </Marker>
        )}
      </MapView>

      <ScrollView style={styles.stopsPanel} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.stopsPanelTitle}>Route Progress</Text>
        {stops.map((stop, index) => {
          const isPassed = nextStopIndex >= 0 && index < nextStopIndex;
          const isNext = index === nextStopIndex;
          return (
            <View key={stop.id} style={styles.stopRow}>
              <View style={[styles.stopDot, isPassed && styles.stopDotPassed, isNext && styles.stopDotNext]}>
                {isPassed ? <Ionicons name="checkmark" size={12} color="#fff" /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stopName, isNext && { color: "#1B7A3D", fontWeight: "700" }]}>{stop.name}</Text>
                {isNext && (
                  <Text style={styles.etaText}>
                    {etaMinutes ? `Arriving in ~${etaMinutes} min` : "Calculating ETA..."} · {distanceToNext.toFixed(1)} km away
                  </Text>
                )}
              </View>
            </View>
          );
        })}
        {stops.length === 0 && <Text style={{ color: "#999" }}>No stops defined for this route yet.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  title: { fontSize: 16, fontWeight: "800" },
  subtitle: { fontSize: 12.5, color: "#666", marginTop: 2 },
  busMarker: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: "#1B7A3D",
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff",
  },
  stopsPanel: { flex: 1, backgroundColor: "#fff" },
  stopsPanelTitle: { fontSize: 14, fontWeight: "700", marginBottom: 12, color: "#333" },
  stopRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  stopDot: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: "#e5e5e5",
    alignItems: "center", justifyContent: "center", marginTop: 2,
  },
  stopDotPassed: { backgroundColor: "#1B7A3D" },
  stopDotNext: { backgroundColor: "#fff", borderWidth: 2, borderColor: "#1B7A3D" },
  stopName: { fontSize: 14, color: "#333" },
  etaText: { fontSize: 12, color: "#1B7A3D", marginTop: 2, fontWeight: "600" },
});