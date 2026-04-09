"use client";

import { useParams } from "next/navigation";
import { ProductForm } from "../../components/ProductForm";
import { mockProducts } from "@/infrastructure/db/mock-data";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  
  // Find the product from mock data
  const product = mockProducts.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-brown-900">Product Not Found</h1>
          <p className="text-brown-400 mt-1">The product you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-brown-900">Edit Product</h1>
        <p className="text-brown-400 mt-1">Update {product.name}</p>
      </div>

      {/* Form */}
      <ProductForm mode="edit" initialData={product} />
    </div>
  );
}
