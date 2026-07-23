"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function DriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingDriver, setViewingDriver] = useState<any>(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", licenseNumber: "", busId: "" });
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
      const [driversRes, busesRes] = await Promise.all([
        api.get("/api/drivers", { headers }),
        api.get("/api/buses", { headers }),
      ]);
      setDrivers(driversRes.data);
      setBuses(busesRes.data);
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ fullName: "", email: "", phone: "", password: "", licenseNumber: "", busId: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(
          `/api/drivers/${editingId}`,
          { fullName: form.fullName, phone: form.phone, licenseNumber: form.licenseNumber, busId: form.busId || null },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await api.post("/api/drivers", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      resetForm();
      fetchData(token);
    } catch (error: any) {
      console.error("Failed to save driver:", error);
      alert(error.response?.data?.error || "Failed to save driver.");
    }
  };

  const handleEdit = (driver: any) => {
    setForm({
      fullName: driver.fullName,
      email: driver.email,
      phone: driver.phone || "",
      password: "",
      licenseNumber: driver.licenseNumber || "",
      busId: driver.busId || "",
    });
    setEditingId(driver.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this driver?")) return;
    try {
      await api.delete(`/api/drivers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData(token);
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
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-green-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-800"
        >
          {showForm ? "Cancel" : "+ Add New Driver"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 grid grid-cols-2 gap-4">
          <input required placeholder="Full Name" value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="border border-gray-300 rounded-lg p-2" />
          <input required type="email" placeholder="Email" value={form.email}
            disabled={!!editingId}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-gray-300 rounded-lg p-2 disabled:bg-gray-100" />
          <input placeholder="Phone Number" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="border border-gray-300 rounded-lg p-2" />
          <input placeholder="License Number" value={form.licenseNumber}
            onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
            className="border border-gray-300 rounded-lg p-2" />
          <select
            value={form.busId}
            onChange={(e) => setForm({ ...form, busId: e.target.value })}
            className="border border-gray-300 rounded-lg p-2"
          >
            <option value="">No bus assigned</option>
            {buses.map((b) => (
              <option key={b.id} value={b.id}>{b.busNumber} ({b.plateNumber})</option>
            ))}
          </select>
          {!editingId && (
            <input type="password" placeholder="Password (default: changeme123)" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="border border-gray-300 rounded-lg p-2" />
          )}
          <button type="submit" className="col-span-2 bg-green-700 text-white rounded-lg py-2 font-medium hover:bg-green-800">
            {editingId ? "Update Driver" : "Save Driver"}
          </button>
        </form>
      )}

      {viewingDriver && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg mb-2">Driver Details</h3>
            <button onClick={() => setViewingDriver(null)} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <p><span className="text-gray-500">Name:</span> {viewingDriver.fullName}</p>
          <p><span className="text-gray-500">Email:</span> {viewingDriver.email}</p>
          <p><span className="text-gray-500">Phone:</span> {viewingDriver.phone || "—"}</p>
          <p><span className="text-gray-500">License:</span> {viewingDriver.licenseNumber || "—"}</p>
          <p><span className="text-gray-500">Assigned Bus:</span> {viewingDriver.assignedBus?.busNumber || "Unassigned"}</p>
        </div>
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
                <th className="p-3 text-right">Actions</th>
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
                  <td className="p-3 text-right space-x-3">
                    <button onClick={() => setViewingDriver(d)} className="text-blue-600 hover:underline">View</button>
                    <button onClick={() => handleEdit(d)} className="text-green-700 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:underline">Delete</button>
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