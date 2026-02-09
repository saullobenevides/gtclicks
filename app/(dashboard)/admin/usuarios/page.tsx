"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableTableHead } from "@/components/shared/SortableTableHead";
import AppPagination from "@/components/shared/AppPagination";

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  createdAt: string;
  fotografo?: { username: string };
  _count?: { pedidos: number };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const roleFilter = searchParams.get("role") ?? "";
  const sort = searchParams.get("sort") ?? "createdAt";
  const order = searchParams.get("order") ?? "desc";
  const router = useRouter();

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", field);
    params.set("order", sort === field && order === "desc" ? "asc" : "desc");
    params.set("page", "1");
    router.push(`/admin/usuarios?${params.toString()}`);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append("role", roleFilter);
      if (search) params.append("search", search);
      params.append("page", page.toString());
      params.append("sort", sort);
      params.append("order", order);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.data) {
        setUsers(data.data);
        setTotalPages(data.metadata?.totalPages ?? 1);
      } else if (Array.isArray(data)) {
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
  }, [roleFilter, page, search, sort, order]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) params.set("search", search);
    else params.delete("search");

    if (roleFilter) params.set("role", roleFilter);
    else params.delete("role");

    params.set("page", "1");
    router.push(`/admin/usuarios?${params.toString()}`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Usuários</h1>
          <p className="text-zinc-400 mt-1">
            {users.length} usuários (nesta página)
          </p>
        </div>
      </div>

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
            onChange={(e) => {
              const v = e.target.value;
              const params = new URLSearchParams(searchParams);
              if (v) params.set("role", v);
              else params.delete("role");
              params.set("page", "1");
              router.push(`/admin/usuarios?${params.toString()}`);
            }}
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

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/10">
                <SortableTableHead
                  field="name"
                  sort={sort}
                  order={order}
                  onSort={handleSort}
                >
                  Usuário
                </SortableTableHead>
                <SortableTableHead
                  field="role"
                  sort={sort}
                  order={order}
                  onSort={handleSort}
                >
                  Role
                </SortableTableHead>
                <SortableTableHead
                  field="pedidos"
                  sort={sort}
                  order={order}
                  onSort={handleSort}
                >
                  Pedidos
                </SortableTableHead>
                <SortableTableHead
                  field="createdAt"
                  sort={sort}
                  order={order}
                  onSort={handleSort}
                >
                  Cadastro
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-white/5 transition-colors border-white/5"
                >
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {user._count?.pedidos ?? 0}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-400">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-4">
        <AppPagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/admin/usuarios"
          searchParams={Object.fromEntries(searchParams.entries())}
        />
      </div>
    </div>
  );
}
