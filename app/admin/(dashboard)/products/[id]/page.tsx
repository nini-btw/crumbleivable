"use client";

import { useParams } from "next/navigation";
import { ProductForm } from "../../../components/ProductForm";
import type { Product } from "@/domain/entities/product";
import { useState, useEffect } from "react";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${productId}`);
        const result = await response.json();
        if (result.success) {
          setProduct(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-[#2C1810]">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl text-[#2C1810]">Product Not Found</h1>
          <p className="text-[#A07850] mt-1">The product you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-[#2C1810]">Edit Product</h1>
        <p className="text-[#A07850] mt-1">Update {product.name}</p>
      </div>

      {/* Form */}
      <ProductForm mode="edit" initialData={product} />
    </div>
  );
}
