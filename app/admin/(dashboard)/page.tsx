"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBagIcon,
  TrendingUpIcon,
  CookieIcon,
  VoteIcon,
  ArrowRightIcon,
} from "lucide-react";
import type { Order } from "@/domain/entities/order";
import type { Product } from "@/domain/entities/product";
import type { VoteCandidate } from "@/domain/entities/vote";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [votes, setVotes] = useState<VoteCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, productsRes, votesRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/products"),
          fetch("/api/votes"),
        ]);

        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        const votesData = await votesRes.json();

        if (ordersData.success) setOrders(ordersData.data);
        if (productsData.success) setProducts(productsData.data);
        if (votesData.success) setVotes(votesData.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const activeProducts = products.filter((p) => p.isActive).length;

  // Calculate most ordered product
  const productCounts = new Map<string, number>();
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const count = productCounts.get(item.productName) || 0;
      productCounts.set(item.productName, count + item.quantity);
    });
  });
  const mostOrdered = [...productCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  // Most voted cookie
  const mostVoted = [...votes].sort((a, b) => b.voteCount - a.voteCount)[0];

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-[#2C1810]">Dashboard</h1>
          <p className="text-[#A07850] mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-[#2C1810]">Dashboard</h1>
        <p className="text-[#A07850] mt-1">Overview of your shop&apos;s performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={ShoppingBagIcon}
          label="Total Orders"
          value={totalOrders.toString()}
          description="All orders"
        />
        <StatCard
          icon={TrendingUpIcon}
          label="Revenue"
          value={`${totalRevenue} DA`}
          description="Total revenue"
        />
        <StatCard
          icon={CookieIcon}
          label="Most Ordered"
          value={mostOrdered?.[0] || "N/A"}
          description={mostOrdered ? `${mostOrdered[1]} sold` : "No orders yet"}
        />
        <StatCard
          icon={VoteIcon}
          label="Most Voted"
          value={mostVoted?.cookieName || "N/A"}
          description={mostVoted ? `${mostVoted.voteCount} votes` : "No votes yet"}
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-3xl border border-[#E8D5C0] overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-[#E8D5C0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-bold text-[#2C1810] text-lg">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-[#F4538A] hover:text-[#D63A72] text-sm font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            View All
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-[#F0E6D6]/50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#A07850]">
                    Order ID
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#A07850]">
                    Customer
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#A07850]">
                    Total
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#A07850]">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#A07850]">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D5C0]">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-[#FFF0F5]/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 font-medium text-[#2C1810]">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-[#5C3D2E]">{order.fullName}</td>
                    <td className="px-4 sm:px-6 py-4 font-semibold text-[#2C1810]">
                      {order.totalAmount} DA
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-[#A07850]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-[#A07850]">No orders yet</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <QuickActionCard
          href="/admin/products"
          title="Manage Products"
          description={`${activeProducts} active products`}
        />
        <QuickActionCard
          href="/admin/drop"
          title="Schedule Drop"
          description="Set up weekly cookie reveal"
        />
        <QuickActionCard
          href="/admin/votes"
          title="View Votes"
          description={`${votes.length} active candidates`}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E8D5C0]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-[#FFF0F5] rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[#F4538A]" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#A07850]">{label}</span>
      </div>
      <p className="font-display text-2xl sm:text-3xl text-[#2C1810] truncate">{value}</p>
      <p className="text-sm text-[#A07850] mt-1">{description}</p>
    </div>
  );
}

function QuickActionCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-2xl p-4 sm:p-6 border border-[#E8D5C0] hover:border-[#F4538A] hover:shadow-lg transition-all group cursor-pointer"
    >
      <h3 className="font-bold text-[#2C1810] group-hover:text-[#F4538A] transition-colors">
        {title}
      </h3>
      <p className="text-sm text-[#A07850] mt-1">{description}</p>
    </Link>
  );
}
