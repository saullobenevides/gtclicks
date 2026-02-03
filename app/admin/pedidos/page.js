"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

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
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-mono text-zinc-400">
                    #{order.numeroSequencial || order.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-white">
                        {order.user.name}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {order.user.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {order.items.length} foto
                    {order.items.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    R$ {parseFloat(order.total || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        order.status === "APPROVED"
                          ? "default"
                          : order.status === "PENDING"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
