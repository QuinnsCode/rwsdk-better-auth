"use client";

import { useState, useEffect } from "react";
import {
  createUser,
  listUsers,
  setUserRole,
  banUser,
  unbanUser,
  listUserSessions,
  revokeUserSession,
  revokeAllUserSessions,
  impersonateUser,
  stopImpersonating,
  removeUser,
  type User,
  type CreateUserData,
  type ListUsersResponse,
} from "./functions";
import { RoleToggleButton } from "@/app/pages/user/RoleToggleButton";

interface AdminTestProps {
  currentUser?: {
    id: string;
    email?: string;
    name?: string;
    role?: string;
  };
}

export default function AdminTest({ currentUser }: AdminTestProps) {
  const [users, setUsers] = useState<ListUsersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  // Form states
  const [createUserForm, setCreateUserForm] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listUsers({ limit: 20 });
      setUsers(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createUser(createUserForm);
      setCreateUserForm({ name: "", email: "", password: "", role: "user" });
      await loadUsers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleSetRole = async (userId: string, role: string) => {
    setLoading(true);
    setError(null);
    try {
      await setUserRole(userId, role);
      await loadUsers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set role");
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      await banUser(userId, "Banned by admin", 60 * 60 * 24 * 7); // 7 days
      await loadUsers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ban user");
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      await unbanUser(userId);
      await loadUsers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unban user");
    } finally {
      setLoading(false);
    }
  };

  const handleViewSessions = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const userSessions = await listUserSessions(userId);
      setSessions(userSessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionToken: string) => {
    setLoading(true);
    setError(null);
    try {
      await revokeUserSession(sessionToken);
      if (selectedUser) {
        await handleViewSessions(selectedUser.id); // Refresh sessions
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke session");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAllSessions = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      await revokeAllUserSessions(userId);
      if (selectedUser) {
        await handleViewSessions(selectedUser.id); // Refresh sessions
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke all sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      await impersonateUser(userId);
      alert("Impersonation started! Check your session.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to impersonate user");
    } finally {
      setLoading(false);
    }
  };

  const handleStopImpersonating = async () => {
    setLoading(true);
    setError(null);
    try {
      await stopImpersonating();
      alert("Stopped impersonating!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop impersonating");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await removeUser(userId);
      await loadUsers(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="space-x-2">
          <button
            onClick={handleStopImpersonating}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Stop Impersonating
          </button>
          {currentUser && (
            <RoleToggleButton 
              currentRole={currentUser.role || "user"}
              userId={currentUser.id}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            />
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Create User Form */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Create New User</h2>
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={createUserForm.name}
            onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={createUserForm.email}
            onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={createUserForm.password}
            onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <select
            value={createUserForm.role}
            onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="md:col-span-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Users ({users?.total || 0})</h2>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {users && users.users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{user.name || "N/A"}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        user.role === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        user.banned ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}>
                        {user.banned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => handleSetRole(user.id, user.role === "admin" ? "user" : "admin")}
                          className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                        >
                          Toggle Role
                        </button>
                        
                        {user.banned ? (
                          <button
                            onClick={() => handleUnbanUser(user.id)}
                            className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanUser(user.id)}
                            className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                          >
                            Ban
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            handleViewSessions(user.id);
                          }}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          Sessions
                        </button>
                        
                        <button
                          onClick={() => handleImpersonate(user.id)}
                          className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
                        >
                          Impersonate
                        </button>
                        
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No users found.</p>
        )}
      </div>

      {/* Sessions Panel */}
      {selectedUser && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Sessions for {selectedUser.name || selectedUser.email}
            </h2>
            <div className="space-x-2">
              <button
                onClick={() => handleRevokeAllSessions(selectedUser.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Revoke All Sessions
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
          
          {sessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Session ID</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Created</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Expires</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                        {session.id.substring(0, 12)}...
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(session.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          onClick={() => handleRevokeSession(session.token)}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No active sessions found.</p>
          )}
        </div>
      )}
    </div>
  );
}