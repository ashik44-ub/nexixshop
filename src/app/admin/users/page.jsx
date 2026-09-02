"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

const roles = ["admin", "manager", "user"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => fetch("/api/admin/users").then((r) => r.json()).then((d) => setUsers(Array.isArray(d) ? d : [])).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const updateRole = async (id, role) => {
    const res = await fetch(`/api/admin/users/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
    const data = await res.json();
    if (!res.ok) return toast.error(data.message);
    toast.success("Role updated");
    load();
  };

  const toggleActive = async (id, isActive) => {
    await fetch(`/api/admin/users/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !isActive }) });
    load();
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return toast.error(data.message);
    toast.success("User deleted");
    load();
  };

  if (loading) return <LoadingSpinner full size="lg" />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Registered Users ({users.length})</h1>
      <div className="card p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-3">Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Active</th>
              <th className="pb-3">Joined</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-gray-50">
                <td className="py-3">{u.name}</td>
                <td className="py-3">{u.email}</td>
                <td className="py-3">
                  <select value={u.role} onChange={(e) => updateRole(u._id, e.target.value)} className="input-field py-1 text-xs">
                    {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="py-3">
                  <button onClick={() => toggleActive(u._id, u.isActive)} className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {u.isActive ? "Active" : "Disabled"}
                  </button>
                </td>
                <td className="py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-3">
                  <button onClick={() => deleteUser(u._id)} className="text-red-500"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
