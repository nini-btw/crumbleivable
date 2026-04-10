"use client";

import Link from "next/link";

const endpoints = [
  {
    group: "Products",
    routes: [
      { method: "GET", path: "/api/products", description: "Get all active products", auth: false },
      { method: "POST", path: "/api/products", description: "Create new product", auth: true },
      { method: "GET", path: "/api/products/[id]", description: "Get product by ID", auth: false },
      { method: "PUT", path: "/api/products/[id]", description: "Update product", auth: true },
      { method: "DELETE", path: "/api/products/[id]", description: "Delete product", auth: true },
    ],
  },
  {
    group: "Orders",
    routes: [
      { method: "GET", path: "/api/orders", description: "Get all orders", auth: true },
      { method: "POST", path: "/api/orders", description: "Create new order", auth: false },
      { method: "GET", path: "/api/orders/[id]", description: "Get order by ID", auth: true },
      { method: "PUT", path: "/api/orders/[id]", description: "Update order status", auth: true },
    ],
  },
  {
    group: "Votes",
    routes: [
      { method: "GET", path: "/api/votes", description: "Get all vote candidates", auth: false },
      { method: "POST", path: "/api/votes", description: "Cast a vote", auth: false },
      { method: "PUT", path: "/api/votes", description: "Create vote candidate", auth: true },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-green-500",
  POST: "bg-blue-500",
  PUT: "bg-yellow-500",
  DELETE: "bg-red-500",
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-[#FDF6EE] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-[#F4538A] hover:underline">
            ← Back to Home
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold text-[#2C1810] mb-4">
          API Documentation
        </h1>
        <p className="text-[#A07850] mb-8">
          RESTful API endpoints for Crumbleivable Cookie Shop
        </p>

        <div className="space-y-8">
          {endpoints.map((group) => (
            <div key={group.group} className="bg-white rounded-2xl shadow-sm border border-[#E8D5C0] overflow-hidden">
              <div className="bg-[#2C1810] text-white px-6 py-4">
                <h2 className="text-xl font-bold">{group.group}</h2>
              </div>
              <div className="divide-y divide-[#E8D5C0]">
                {group.routes.map((route) => (
                  <div key={route.path + route.method} className="px-6 py-4 hover:bg-[#F0E6D6]/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className={`${methodColors[route.method]} text-white text-xs font-bold px-2 py-1 rounded`}>
                        {route.method}
                      </span>
                      <code className="text-sm text-[#2C1810] font-mono bg-[#F0E6D6] px-2 py-1 rounded">
                        {route.path}
                      </code>
                      {route.auth && (
                        <span className="text-xs bg-[#F4538A] text-white px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-[#A07850] text-sm mt-2 ml-[4.5rem]">
                      {route.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-[#E8D5C0] p-6">
          <h2 className="text-xl font-bold text-[#2C1810] mb-4">Response Format</h2>
          <p className="text-[#A07850] mb-4">
            All API responses follow this standard format:
          </p>
          <pre className="bg-[#2C1810] text-white p-4 rounded-xl overflow-x-auto text-sm">
{`{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}`}
          </pre>
          <p className="text-[#A07850] mt-4">
            For errors, <code>success</code> will be <code>false</code> and an <code>error</code> field will be included.
          </p>
        </div>
      </div>
    </div>
  );
}
