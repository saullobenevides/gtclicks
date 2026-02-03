"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortableTableHead } from "@/components/shared/SortableTableHead";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const handleSort = (field) => {
    setSort(field);
    setOrder((prev) => (sort === field && prev === "desc" ? "asc" : "desc"));
  };

  const sortedOrders = useMemo(() => {
    const arr = [...orders];
    arr.sort((a, b) => {
      let va = a[sort];
      let vb = b[sort];
      if (sort === "total") {
        va = parseFloat(va || 0);
        vb = parseFloat(vb || 0);
      } else if (sort === "createdAt") {
        va = new Date(va).getTime();
        vb = new Date(vb).getTime();
      } else if (sort === "user") {
        va = (a.user?.name || a.user?.email || "").toLowerCase();
        vb = (b.user?.name || b.user?.email || "").toLowerCase();
      } else if (sort === "items") {
        va = a.items?.length || 0;
        vb = b.items?.length || 0;
      } else if (sort === "status") {
        va = (va || "").toLowerCase();
        vb = (vb || "").toLowerCase();
      } else if (sort === "id") {
        va = (a.numeroSequencial || a.id || "").toString();
        vb = (b.numeroSequencial || b.id || "").toString();
      }
      if (va < vb) return order === "asc" ? -1 : 1;
      if (va > vb) return order === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [orders, sort, order]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const response = await fetch(`/api/admin/orders${params}`);

      if (!response.ok) {
        console.error("API error:", response.status);
        setOrders([]);
        return;
      }

      const data = await response.json();

      // Ensure data is an array
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error("Invalid data format:", data);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalRevenue = Array.isArray(orders)
    ? orders
        .filter((o) => o.status === "APPROVED")
        .reduce((sum, o) => sum + parseFloat(o.total || 0), 0)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-zinc-400">Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pedidos</h1>
          <p className="text-zinc-400 mt-1">
            {orders.length} pedidos encontrados
          </p>
        </div>

        <div className="glass-panel px-6 py-3">
          <p className="text-sm text-zinc-400">Receita Total</p>
          <p className="text-2xl font-bold text-white">
            R$ {totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        <Badge
          variant={!statusFilter ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setStatusFilter("")}
        >
          Todos
        </Badge>
        <Badge
          variant={statusFilter === "PENDING" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setStatusFilter("PENDING")}
        >
          Pendentes
        </Badge>
        <Badge
          variant={statusFilter === "APPROVED" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setStatusFilter("APPROVED")}
        >
          Aprovados
        </Badge>
        <Badge
          variant={statusFilter === "CANCELLED" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setStatusFilter("CANCELLED")}
        >
          Cancelados
        </Badge>
      </div>

      {/* Orders Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/10">
                <SortableTableHead
                  field="id"
                  sort={sort}
                  order={order}
                  onSort={handleSort}
                >
                  ID
                </SortableTableHead>
                <SortableTableHead
                  field="user"
                  sort={sort}
                  order={order}
                  onSort={handleSort}
                >
                  Cliente
                </SortableTableHead>
                <SortableTableHead
                  field="items"
                  sort={sort}
                  order={order}
                  onSort={handleSort}
                >
                  Items
                </SortableTableHead>
                <SortableTableHead
                  field="total"
                  sort={sort}
                  order={order}
                  onSort={handleSort}
                  className="text-right"
                >
                  Total
                </SortableTableHead>
                <SortableTableHead
                  field="status"
                  sort={sort}
                  order={order}
                  onSort={handleSort}
                >
                  Status
                </SortableTableHead>
                <SortableTableHead
                  field="createdAt"
                  sort={sort}
                  order={order}
                  onSort={handleSort}
                >
                  Data
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOrders.map((ord) => (
                <TableRow
                  key={ord.id}
                  className="hover:bg-white/5 transition-colors border-white/5"
                >
                  <TableCell className="text-sm font-mono text-zinc-400">
                    #{ord.numeroSequencial || ord.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{ord.user?.name}</p>
                      <p className="text-sm text-zinc-500">{ord.user?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {ord.items?.length ?? 0} foto
                    {(ord.items?.length ?? 0) !== 1 ? "s" : ""}
                  </TableCell>
                  <TableCell className="font-medium text-white text-right">
                    R$ {parseFloat(ord.total || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ord.status === "APPROVED"
                          ? "default"
                          : ord.status === "PENDING"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {ord.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-400">
                    {new Date(ord.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
