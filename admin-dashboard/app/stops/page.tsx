"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function StopsPage() {
  const router = useRouter();
  const [stops, setStops] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingStop, setViewingStop] = useState<any>(null);
  const [filterRouteId, setFilterRouteId] = useState("");
  const [form, setForm] = useState({ name: "", latitude: "", longitude: "", order: "", routeId: "" });
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
      const [stopsRes, routesRes] = await Promise.all([
        api.get("/api/stops", { headers }),
        api.get("/api/routes", { headers }),
      ]);
      setStops(stopsRes.data);
      setRoutes(routesRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", latitude: "", longitude: "", order: "", routeId: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/stops/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post("/api/stops", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      resetForm();
      fetchData(token);
    } catch (error) {
      console.error("Failed to save stop:", error);
      alert("Failed to save stop.");
    }
  };

  const handleEdit = (stop: any) => {
    setForm({
      name: stop.name,
      latitude: stop.latitude.toString(),
      longitude: stop.longitude.toString(),
      order: stop.order.toString(),
      routeId: stop.routeId,
    });
    setEditingId(stop.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this stop?")) return;
    try {
      await api.delete(`/api/stops/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData(token);
    } catch (error) {
      console.error("Failed to delete stop:", error);
    }
  };

  const filteredStops = filterRouteId ? stops.filter((s) => s.routeId === filterRouteId) : stops;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Stops</h1>
          <p className="text-gray-500">View, add, edit and manage all bus stops across every route.</p>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-green-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-800"
        >
          {showForm ? "Cancel" : "+ Add New Stop"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 grid grid-cols-2 gap-4">
          <select
            required
            value={form.routeId}
            onChange={(e) => setForm({ ...form, routeId: e.target.value })}
            className="border border-gray-300 rounded-lg p-2 col-span-2"
          >
            <option value="">Select a route</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <input
            required
            placeholder="Stop Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-gray-300 rounded-lg p-2 col-span-2"
          />
          <input
            required
            placeholder="Latitude"
            value={form.latitude}
            onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            className="border border-gray-300 rounded-lg p-2"
          />
          <input
            required
            placeholder="Longitude"
            value={form.longitude}
            onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            className="border border-gray-300 rounded-lg p-2"
          />
          <input
            required
            type="number"
            placeholder="Order (e.g. 1, 2, 3...)"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: e.target.value })}
            className="border border-gray-300 rounded-lg p-2 col-span-2"
          />
          <button type="submit" className="col-span-2 bg-green-700 text-white rounded-lg py-2 font-medium hover:bg-green-800">
            {editingId ? "Update Stop" : "Save Stop"}
          </button>
        </form>
      )}

      {viewingStop && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg mb-2">Stop Details</h3>
            <button onClick={() => setViewingStop(null)} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <p><span className="text-gray-500">Name:</span> {viewingStop.name}</p>
          <p><span className="text-gray-500">Route:</span> {viewingStop.route?.name}</p>
          <p><span className="text-gray-500">Order:</span> {viewingStop.order}</p>
          <p><span className="text-gray-500">Coordinates:</span> {viewingStop.latitude}, {viewingStop.longitude}</p>
        </div>
      )}

      <div className="mb-4">
        <select
          value={filterRouteId}
          onChange={(e) => setFilterRouteId(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm"
        >
          <option value="">All Routes</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading stops...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Stop Name</th>
                <th className="p-3">Route</th>
                <th className="p-3">Coordinates</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStops.map((stop) => (
                <tr key={stop.id} className="border-t border-gray-100">
                  <td className="p-3">{stop.order}</td>
                  <td className="p-3 font-medium">{stop.name}</td>
                  <td className="p-3">{stop.route?.name || "—"}</td>
                  <td className="p-3 text-gray-500 text-xs">{stop.latitude}, {stop.longitude}</td>
                  <td className="p-3 text-right space-x-3">
                    <button onClick={() => setViewingStop(stop)} className="text-blue-600 hover:underline">View</button>
                    <button onClick={() => handleEdit(stop)} className="text-green-700 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(stop.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {filteredStops.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400">No stops found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}