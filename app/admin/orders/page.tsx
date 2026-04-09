"use client";

import * as React from "react";
import Link from "next/link";
import { EyeIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { mockOrders } from "@/infrastructure/db/mock-data";

type SortField = "id" | "customer" | "total" | "status" | "date";
type SortDirection = "asc" | "desc";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState(mockOrders);
  const [sortField, setSortField] = React.useState<SortField>("date");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedOrders = React.useMemo(() => {
    return [...orders].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "id":
          comparison = a.id.localeCompare(b.id);
          break;
        case "customer":
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case "total":
          comparison = a.totalAmount - b.totalAmount;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [orders, sortField, sortDirection]);

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-brown-400 cursor-pointer hover:text-brown-600 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === "asc" ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )
        )}
      </div>
    </th>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-brown-900">Orders</h1>
        <p className="text-brown-400 mt-1">Manage customer orders</p>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-brown-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-sand/50">
              <tr>
                <SortHeader field="id">Order ID</SortHeader>
                <SortHeader field="customer">Customer</SortHeader>
                <SortHeader field="total">Total</SortHeader>
                <SortHeader field="status">Status</SortHeader>
                <SortHeader field="date">Date</SortHeader>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-brown-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brown-100">
              {sortedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-pink-50/50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 font-medium text-brown-900">
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div>
                      <p className="font-medium text-brown-900">{order.fullName}</p>
                      <p className="text-xs text-brown-400">{order.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 font-semibold text-brown-900 tabular-nums">
                    {order.totalAmount} DA
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[order.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-brown-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/orders/${order.id}`}>
                        <button className="p-2 hover:bg-sand rounded-lg transition-colors cursor-pointer">
                          <EyeIcon className="w-4 h-4 text-brown-400" />
                        </button>
                      </Link>
                    </div>
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
