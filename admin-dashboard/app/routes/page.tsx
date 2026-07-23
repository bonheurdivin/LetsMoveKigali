"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function RoutesPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", startPoint: "", endPoint: "" });
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/routes", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ name: "", startPoint: "", endPoint: "" });
      setShowForm(false);
      fetchRoutes(token);
    } catch (error) {
      console.error("Failed to create route:", error);
      alert("Failed to create route.");
    }
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
      alert("Failed to delete — this route may still have buses or stops linked to it.");
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
          onClick={() => setShowForm(!showForm)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-800"
        >
          + Add New Route
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 grid grid-cols-3 gap-4">
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
          <button type="submit" className="bg-green-700 text-white rounded-lg py-2 font-medium hover:bg-green-800">
            Save Route
          </button>
        </form>
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
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3">{r.startPoint}</td>
                  <td className="p-3">{r.endPoint}</td>
                  <td className="p-3">{r.stops?.length || 0}</td>
                  <td className="p-3">{r.buses?.length || 0}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
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