"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function DriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", licenseNumber: "" });
  const [token, setToken] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
    fetchDrivers(t);
  }, []);

  const fetchDrivers = async (t: string) => {
    try {
      const response = await api.get("/api/drivers", {
        headers: { Authorization: `Bearer ${t}` },
      });
      setDrivers(response.data);
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/drivers", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ fullName: "", email: "", phone: "", password: "", licenseNumber: "" });
      setShowForm(false);
      fetchDrivers(token);
    } catch (error: any) {
      console.error("Failed to create driver:", error);
      alert(error.response?.data?.error || "Failed to create driver.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this driver?")) return;
    try {
      await api.delete(`/api/drivers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDrivers(token);
    } catch (error) {
      console.error("Failed to delete driver:", error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Drivers</h1>
          <p className="text-gray-500">View, add, edit and manage all drivers in the system.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-800"
        >
          + Add New Driver
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 grid grid-cols-2 gap-4">
          <input required placeholder="Full Name" value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="border border-gray-300 rounded-lg p-2" />
          <input required type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-gray-300 rounded-lg p-2" />
          <input placeholder="Phone Number" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="border border-gray-300 rounded-lg p-2" />
          <input placeholder="License Number" value={form.licenseNumber}
            onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
            className="border border-gray-300 rounded-lg p-2" />
          <input type="password" placeholder="Password (default: changeme123)" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border border-gray-300 rounded-lg p-2 col-span-2" />
          <button type="submit" className="col-span-2 bg-green-700 text-white rounded-lg py-2 font-medium hover:bg-green-800">
            Save Driver
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Loading drivers...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">License</th>
                <th className="p-3">Assigned Bus</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id} className="border-t border-gray-100">
                  <td className="p-3 font-medium">{d.fullName}</td>
                  <td className="p-3">{d.email}</td>
                  <td className="p-3">{d.phone || "—"}</td>
                  <td className="p-3">{d.licenseNumber || "—"}</td>
                  <td className="p-3">{d.assignedBus?.busNumber || "Unassigned"}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {drivers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">No drivers yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}