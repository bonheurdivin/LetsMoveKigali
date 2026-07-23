"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ buses: 0, routes: 0, drivers: 0, activeTrips: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchStats(token);
  }, []);

  const fetchStats = async (token: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [busesRes, routesRes, tripsRes] = await Promise.all([
        api.get("/api/buses", { headers }),
        api.get("/api/routes", { headers }),
        api.get("/trips/active", { headers }),
      ]);

      setStats({
        buses: busesRes.data.length,
        routes: routesRes.data.length,
        drivers: new Set(busesRes.data.map((b: any) => b.routeId).filter(Boolean)).size,
        activeTrips: tripsRes.data.length,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: "Total Buses", value: stats.buses, color: "bg-green-100 text-green-800" },
    { label: "Total Routes", value: stats.routes, color: "bg-blue-100 text-blue-800" },
    { label: "Active Trips", value: stats.activeTrips, color: "bg-orange-100 text-orange-800" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-gray-500 mb-6">Welcome back, Admin! Here's what's happening today.</p>

      {loading ? (
        <p className="text-gray-400">Loading stats...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.label} className={`rounded-xl p-5 ${c.color}`}>
              <p className="text-sm font-medium opacity-80">{c.label}</p>
              <p className="text-3xl font-bold mt-2">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <a href="/buses" className="text-green-700 font-medium hover:underline">Manage Buses →</a>
        <a href="/routes" className="text-green-700 font-medium hover:underline">Manage Routes →</a>
      </div>
    </div>
  );
}