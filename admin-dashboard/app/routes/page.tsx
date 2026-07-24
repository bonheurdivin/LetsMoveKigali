"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function RoutesPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingRoute, setViewingRoute] = useState<any>(null);
  const [expandedStopsFor, setExpandedStopsFor] = useState<string | null>(null);
  const [newStop, setNewStop] = useState({ name: "", latitude: "", longitude: "" });
  const [form, setForm] = useState({ name: "", startPoint: "", endPoint: "", startLatitude: "", startLongitude: "", endLatitude: "", endLongitude: "" });
  const [stopDrafts, setStopDrafts] = useState<{ name: string; latitude: string; longitude: string }[]>([]);
  const [token, setToken] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
    fetchRoutes(t);
  }, []);

  const fetchRoutes = async (t: string) => {
    try {
      const response = await api.get("/api/routes", {
        headers: { Authorization: `Bearer ${t}` },
      });
      setRoutes(response.data);
    } catch (error) {
      console.error("Failed to fetch routes:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", startPoint: "", endPoint: "", startLatitude: "", startLongitude: "", endLatitude: "", endLongitude: "" });
    setStopDrafts([]);
    setEditingId(null);
    setShowForm(false);
  };

  const addStopDraft = () => {
    setStopDrafts([...stopDrafts, { name: "", latitude: "", longitude: "" }]);
  };

  const updateStopDraft = (index: number, field: string, value: string) => {
    const updated = [...stopDrafts];
    updated[index] = { ...updated[index], [field]: value };
    setStopDrafts(updated);
  };

  const removeStopDraft = (index: number) => {
    setStopDrafts(stopDrafts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/routes/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post(
          "/api/routes",
          { ...form, stops: stopDrafts.filter((s) => s.name) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      resetForm();
      fetchRoutes(token);
    } catch (error) {
      console.error("Failed to save route:", error);
      alert("Failed to save route.");
    }
  };

  const handleEdit = (route: any) => {
    setForm({
      name: route.name,
      startPoint: route.startPoint,
      endPoint: route.endPoint,
      startLatitude: route.startLatitude?.toString() || "",
      startLongitude: route.startLongitude?.toString() || "",
      endLatitude: route.endLatitude?.toString() || "",
      endLongitude: route.endLongitude?.toString() || "",
    });
    setEditingId(route.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this route? This will also affect any buses assigned to it.")) return;
    try {
      await api.delete(`/api/routes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRoutes(token);
    } catch (error) {
      console.error("Failed to delete route:", error);
      alert("Failed to delete — this route may still have buses linked to it.");
    }
  };

  const handleAddStopToExistingRoute = async (routeId: string) => {
    if (!newStop.name || !newStop.latitude || !newStop.longitude) {
      alert("Please fill in stop name, latitude, and longitude.");
      return;
    }
    try {
      const route = routes.find((r) => r.id === routeId);
      const order = (route?.stops?.length || 0) + 1;
      await api.post(
        "/api/stops",
        { ...newStop, routeId, order },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewStop({ name: "", latitude: "", longitude: "" });
      fetchRoutes(token);
    } catch (error) {
      console.error("Failed to add stop:", error);
      alert("Failed to add stop.");
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm("Delete this stop?")) return;
    try {
      await api.delete(`/api/stops/${stopId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRoutes(token);
    } catch (error) {
      console.error("Failed to delete stop:", error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Routes</h1>
          <p className="text-gray-500">View, add, edit and manage all bus routes in Kigali.</p>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-green-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-800"
        >
          {showForm ? "Cancel" : "+ Add New Route"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <input
              required
              placeholder="Route Name (e.g. Kicukiro - Nyabugogo)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-gray-300 rounded-lg p-2 col-span-3"
            />
            <input
              required
              placeholder="Start Point"
              value={form.startPoint}
              onChange={(e) => setForm({ ...form, startPoint: e.target.value })}
              className="border border-gray-300 rounded-lg p-2"
            />
            <input
              required
              placeholder="End Point"
              value={form.endPoint}
              onChange={(e) => setForm({ ...form, endPoint: e.target.value })}
              className="border border-gray-300 rounded-lg p-2"
            />
            <input
              placeholder="Start Latitude (optional)"
              value={form.startLatitude}
              onChange={(e) => setForm({ ...form, startLatitude: e.target.value })}
              className="border border-gray-300 rounded-lg p-2"
            />
            <input
              placeholder="Start Longitude (optional)"
              value={form.startLongitude}
              onChange={(e) => setForm({ ...form, startLongitude: e.target.value })}
              className="border border-gray-300 rounded-lg p-2"
            />
            <input
              placeholder="End Latitude (optional)"
              value={form.endLatitude}
              onChange={(e) => setForm({ ...form, endLatitude: e.target.value })}
              className="border border-gray-300 rounded-lg p-2"
            />
            <input
              placeholder="End Longitude (optional)"
              value={form.endLongitude}
              onChange={(e) => setForm({ ...form, endLongitude: e.target.value })}
              className="border border-gray-300 rounded-lg p-2"
            />
          </div>

          {!editingId && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">Stops (optional, in order)</p>
                <button type="button" onClick={addStopDraft} className="text-green-700 text-sm font-medium hover:underline">
                  + Add Stop
                </button>
              </div>
              {stopDrafts.map((stop, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                  <input
                    placeholder={`Stop ${index + 1} name`}
                    value={stop.name}
                    onChange={(e) => updateStopDraft(index, "name", e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 text-sm"
                  />
                  <input
                    placeholder="Latitude"
                    value={stop.latitude}
                    onChange={(e) => updateStopDraft(index, "latitude", e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 text-sm"
                  />
                  <input
                    placeholder="Longitude"
                    value={stop.longitude}
                    onChange={(e) => updateStopDraft(index, "longitude", e.target.value)}
                    className="border border-gray-300 rounded-lg p-2 text-sm"
                  />
                  <button type="button" onClick={() => removeStopDraft(index)} className="text-red-600 text-sm hover:underline">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="submit" className="w-full bg-green-700 text-white rounded-lg py-2 font-medium hover:bg-green-800">
            {editingId ? "Update Route" : "Save Route"}
          </button>
        </form>
      )}

      {viewingRoute && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg mb-2">Route Details</h3>
            <button onClick={() => setViewingRoute(null)} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <p><span className="text-gray-500">Name:</span> {viewingRoute.name}</p>
          <p><span className="text-gray-500">Start:</span> {viewingRoute.startPoint}</p>
          <p><span className="text-gray-500">End:</span> {viewingRoute.endPoint}</p>
          <p><span className="text-gray-500">Stops:</span> {viewingRoute.stops?.map((s: any) => s.name).join(" → ") || "None"}</p>
          <p><span className="text-gray-500">Buses assigned:</span> {viewingRoute.buses?.length || 0}</p>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading routes...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="p-3">Route Name</th>
                <th className="p-3">Start</th>
                <th className="p-3">End</th>
                <th className="p-3">Stops</th>
                <th className="p-3">Buses</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <React.Fragment key={r.id}>
                  <tr className="border-t border-gray-100">
                    <td className="p-3 font-medium">{r.name}</td>
                    <td className="p-3">{r.startPoint}</td>
                    <td className="p-3">{r.endPoint}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setExpandedStopsFor(expandedStopsFor === r.id ? null : r.id)}
                        className="text-green-700 hover:underline"
                      >
                        {r.stops?.length || 0} stops {expandedStopsFor === r.id ? "▲" : "▼"}
                      </button>
                    </td>
                    <td className="p-3">{r.buses?.length || 0}</td>
                    <td className="p-3 text-right space-x-3">
                      <button onClick={() => setViewingRoute(r)} className="text-blue-600 hover:underline">View</button>
                      <button onClick={() => handleEdit(r)} className="text-green-700 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                  {expandedStopsFor === r.id && (
                    <tr className="bg-gray-50 border-t border-gray-100">
                      <td colSpan={6} className="p-4">
                        <p className="text-xs font-semibold text-gray-500 mb-2">STOPS ON THIS ROUTE</p>
                        <div className="space-y-1 mb-3">
                          {(r.stops || []).map((stop: any) => (
                            <div key={stop.id} className="flex justify-between items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                              <span>{stop.order}. {stop.name} <span className="text-gray-400 text-xs">({stop.latitude}, {stop.longitude})</span></span>
                              <button onClick={() => handleDeleteStop(stop.id)} className="text-red-600 text-xs hover:underline">Delete</button>
                            </div>
                          ))}
                          {(!r.stops || r.stops.length === 0) && <p className="text-gray-400 text-sm">No stops yet.</p>}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <input
                            placeholder="Stop name"
                            value={newStop.name}
                            onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                            className="border border-gray-300 rounded-lg p-1.5 text-sm"
                          />
                          <input
                            placeholder="Latitude"
                            value={newStop.latitude}
                            onChange={(e) => setNewStop({ ...newStop, latitude: e.target.value })}
                            className="border border-gray-300 rounded-lg p-1.5 text-sm"
                          />
                          <input
                            placeholder="Longitude"
                            value={newStop.longitude}
                            onChange={(e) => setNewStop({ ...newStop, longitude: e.target.value })}
                            className="border border-gray-300 rounded-lg p-1.5 text-sm"
                          />
                          <button
                            onClick={() => handleAddStopToExistingRoute(r.id)}
                            className="bg-green-700 text-white rounded-lg text-sm hover:bg-green-800"
                          >
                            + Add Stop
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {routes.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">No routes yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}