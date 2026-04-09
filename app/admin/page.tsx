import { Metadata } from "next";
import Link from "next/link";
import {
  ShoppingBagIcon,
  TrendingUpIcon,
  CookieIcon,
  VoteIcon,
  ArrowRightIcon,
} from "lucide-react";
import { mockOrders, mockProducts, mockVoteCandidates } from "@/infrastructure/db/mock-data";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Admin dashboard page
 */
export default function AdminDashboardPage() {
  const orders = mockOrders;
  const products = mockProducts;
  const votes = mockVoteCandidates;

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-brown-900">Dashboard</h1>
        <p className="text-brown-400 mt-1">
          Overview of your shop&apos;s performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={ShoppingBagIcon}
          label="Total Orders"
          value={totalOrders.toString()}
          description="Last 10 orders"
        />
        <StatCard
          icon={TrendingUpIcon}
          label="Revenue"
          value={`${totalRevenue} DA`}
          description="From recent orders"
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
      <div className="bg-white rounded-3xl border border-brown-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-brown-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-bold text-brown-900 text-lg">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-pink-500 hover:text-pink-600 text-sm font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            View All
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-sand/50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-brown-400">
                    Order ID
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-brown-400">
                    Customer
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-brown-400">
                    Total
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-brown-400">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-brown-400">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brown-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-pink-50/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 font-medium text-brown-900">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-brown-700">{order.fullName}</td>
                    <td className="px-4 sm:px-6 py-4 font-semibold text-brown-900">
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
                    <td className="px-4 sm:px-6 py-4 text-brown-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-brown-400">No orders yet</p>
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

/**
 * Stat card component
 */
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
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-brown-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-pink-500" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-brown-400">
          {label}
        </span>
      </div>
      <p className="font-display text-2xl sm:text-3xl text-brown-900 truncate">{value}</p>
      <p className="text-sm text-brown-400 mt-1">{description}</p>
    </div>
  );
}

/**
 * Quick action card
 */
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
      className="block bg-white rounded-2xl p-4 sm:p-6 border border-brown-100 hover:border-pink-500 hover:shadow-warm transition-all group cursor-pointer"
    >
      <h3 className="font-bold text-brown-900 group-hover:text-pink-500 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-brown-400 mt-1">{description}</p>
    </Link>
  );
}
