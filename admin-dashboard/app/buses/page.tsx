"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function BusesPage() {
  const router = useRouter();
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ busNumber: "", plateNumber: "", fuelType: "Diesel", routeId: "" });
  const [token, setToken] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
    fetchData(t);
  }, []);

  const fetchData = async (t: string) => {
    try {
      const headers = { Authorization: `Bearer ${t}` };
      const [busesRes, routesRes] = await Promise.all([
        api.get("/api/buses", { headers }),
        api.get("/api/routes", { headers }),
      ]);
      setBuses(busesRes.data);
      setRoutes(routesRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/buses", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ busNumber: "", plateNumber: "", fuelType: "Diesel", routeId: "" });
      setShowForm(false);
      fetchData(token);
    } catch (error) {
      console.error("Failed to create bus:", error);
      alert("Failed to create bus.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this bus?")) return;
    try {
      await api.delete(`/api/buses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData(token);
    } catch (error) {
      console.error("Failed to delete bus:", error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Buses</h1>
          <p className="text-gray-500">View, add, edit and manage all buses in the system.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-800"
        >
          + Add New Bus
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 grid grid-cols-2 gap-4">
          <input
            required
            placeholder="Bus Number (e.g. 102)"
            value={form.busNumber}
            onChange={(e) => setForm({ ...form, busNumber: e.target.value })}
            className="border border-gray-300 rounded-lg p-2"
          />
          <input
            required
            placeholder="Plate Number (e.g. RAD123A)"
            value={form.plateNumber}
            onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
            className="border border-gray-300 rounded-lg p-2"
          />
          <select
            value={form.fuelType}
            onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
            className="border border-gray-300 rounded-lg p-2"
          >
            <option>Diesel</option>
            <option>Electric</option>
            <option>Petrol</option>
          </select>
          <select
            value={form.routeId}
            onChange={(e) => setForm({ ...form, routeId: e.target.value })}
            className="border border-gray-300 rounded-lg p-2"
          >
            <option value="">No route assigned</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button type="submit" className="col-span-2 bg-green-700 text-white rounded-lg py-2 font-medium hover:bg-green-800">
            Save Bus
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Loading buses...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="p-3">Bus Number</th>
                <th className="p-3">Plate Number</th>
                <th className="p-3">Fuel Type</th>
                <th className="p-3">Route</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus) => (
                <tr key={bus.id} className="border-t border-gray-100">
                  <td className="p-3 font-medium">{bus.busNumber}</td>
                  <td className="p-3">{bus.plateNumber}</td>
                  <td className="p-3">{bus.fuelType}</td>
                  <td className="p-3">{bus.route?.name || "—"}</td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                      {bus.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDelete(bus.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {buses.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">No buses yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}