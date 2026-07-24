"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const typeStyles: Record<string, string> = {
  delay: "bg-yellow-100 text-yellow-800",
  arrival: "bg-blue-100 text-blue-800",
  service_update: "bg-green-100 text-green-800",
  info: "bg-gray-100 text-gray-700",
};

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "info" });
  const [token, setToken] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
    fetchAlerts(t);
  }, []);

  const fetchAlerts = async (t: string) => {
    try {
      const response = await api.get("/api/notifications", {
        headers: { Authorization: `Bearer ${t}` },
      });
      setAlerts(response.data);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/notifications", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ title: "", message: "", type: "info" });
      setShowForm(false);
      fetchAlerts(token);
    } catch (error) {
      console.error("Failed to create alert:", error);
      alert("Failed to create alert.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this alert?")) return;
    try {
      await api.delete(`/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAlerts(token);
    } catch (error) {
      console.error("Failed to delete alert:", error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Alerts</h1>
          <p className="text-gray-500">Create, manage and monitor system alerts sent to passengers.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-800"
        >
          {showForm ? "Cancel" : "+ Create New Alert"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 space-y-4">
          <input
            required
            placeholder="Alert title (e.g. Route 102 Delay)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
          <textarea
            required
            placeholder="Alert message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full border border-gray-300 rounded-lg p-2"
            rows={3}
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="border border-gray-300 rounded-lg p-2"
          >
            <option value="info">General Info</option>
            <option value="delay">Route Delay</option>
            <option value="arrival">Bus Arrival</option>
            <option value="service_update">Service Update</option>
          </select>
          <button type="submit" className="bg-green-700 text-white rounded-lg py-2 px-4 font-medium hover:bg-green-800">
            Send Alert
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Loading alerts...</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeStyles[a.type] || typeStyles.info}`}>
                    {a.type.replace("_", " ")}
                  </span>
                  <p className="font-semibold">{a.title}</p>
                </div>
                <p className="text-sm text-gray-600">{a.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(a.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => handleDelete(a.id)} className="text-red-600 text-sm hover:underline">
                Delete
              </button>
            </div>
          ))}
          {alerts.length === 0 && <p className="text-gray-400 text-center py-6">No alerts yet.</p>}
        </div>
      )}
    </div>
  );
}