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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingBus, setViewingBus] = useState<any>(null);
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

  const resetForm = () => {
    setForm({ busNumber: "", plateNumber: "", fuelType: "Diesel", routeId: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/buses/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post("/api/buses", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      resetForm();
      fetchData(token);
    } catch (error) {
      console.error("Failed to save bus:", error);
      alert("Failed to save bus.");
    }
  };

  const handleEdit = (bus: any) => {
    setForm({
      busNumber: bus.busNumber,
      plateNumber: bus.plateNumber,
      fuelType: bus.fuelType,
      routeId: bus.routeId || "",
    });
    setEditingId(bus.id);
    setShowForm(true);
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

  const handleStatusChange = async (bus: any, newStatus: string) => {
    try {
      await api.put(
        `/api/buses/${bus.id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData(token);
    } catch (error) {
      console.error("Failed to update bus status:", error);
      alert("Failed to update status.");
    }
  };

  const statusStyles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    MAINTENANCE: "bg-yellow-100 text-yellow-800",
    INACTIVE: "bg-gray-200 text-gray-600",
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Buses</h1>
          <p className="text-gray-500">View, add, edit and manage all buses in the system.</p>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-green-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-800"
        >
          {showForm ? "Cancel" : "+ Add New Bus"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 grid grid-cols-2 gap-4">
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
            {editingId ? "Update Bus" : "Save Bus"}
          </button>
        </form>
      )}

      {viewingBus && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg mb-2">Bus Details</h3>
            <button onClick={() => setViewingBus(null)} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <p><span className="text-gray-500">Bus Number:</span> {viewingBus.busNumber}</p>
          <p><span className="text-gray-500">Plate Number:</span> {viewingBus.plateNumber}</p>
          <p><span className="text-gray-500">Fuel Type:</span> {viewingBus.fuelType}</p>
          <p><span className="text-gray-500">Route:</span> {viewingBus.route?.name || "Unassigned"}</p>
          <p><span className="text-gray-500">Status:</span> {viewingBus.status}</p>
        </div>
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
                <th className="p-3 text-right">Actions</th>
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
                    <select
                      value={bus.status}
                      onChange={(e) => handleStatusChange(bus, e.target.value)}
                      className={`rounded-full text-xs font-medium px-2 py-1 border-0 cursor-pointer ${statusStyles[bus.status]}`}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </td>
                  <td className="p-3 text-right space-x-3">
                    <button onClick={() => setViewingBus(bus)} className="text-blue-600 hover:underline">View</button>
                    <button onClick={() => handleEdit(bus)} className="text-green-700 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(bus.id)} className="text-red-600 hover:underline">Delete</button>
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