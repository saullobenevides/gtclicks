"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppPagination from "@/components/shared/AppPagination";
import Link from "next/link";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append("role", roleFilter);
      if (search) params.append("search", search);
      params.append("page", page.toString());

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.data) {
        setUsers(data.data);
        setTotalPages(data.metadata.totalPages);
      } else if (Array.isArray(data)) {
        // Fallback for backward compatibility while route updates
        setUsers(data);
        setTotalPages(1);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to page 1 on search
    const params = new URLSearchParams(searchParams);
    if (search) params.set("search", search);
    else params.delete("search");

    if (roleFilter) params.set("role", roleFilter);
    else params.delete("role");

    params.set("page", "1");
    router.push(`/admin/usuarios?${params.toString()}`);
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRoleFilter(newRole);
    // Let useEffect trigger refetch
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-zinc-400">Carregando usuários...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Usuários</h1>
          <p className="text-zinc-400 mt-1">
            {users.length} usuários (nesta página)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <select
            value={roleFilter}
            onChange={handleRoleChange}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos os roles</option>
            <option value="CLIENTE">Clientes</option>
            <option value="FOTOGRAFO">Fotógrafos</option>
            <option value="ADMIN">Admins</option>
          </select>

          <Button type="submit">Filtrar</Button>
        </form>
      </div>

      {/* Users Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Pedidos
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Cadastro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-white">
                        {user.name || "Sem nome"}
                      </p>
                      <p className="text-sm text-zinc-500">{user.email}</p>
                      {user.fotografo && (
                        <p className="text-xs text-primary mt-1">
                          @{user.fotografo.username}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        user.role === "ADMIN"
                          ? "destructive"
                          : user.role === "FOTOGRAFO"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {user._count.pedidos}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <AppPagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/admin/usuarios"
        />
      </div>
    </div>
  );
}
