"use client";

import { ProductForm } from "../../../components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-brown-900">Add Product</h1>
        <p className="text-brown-400 mt-1">Create a new cookie or box</p>
      </div>

      {/* Form */}
      <ProductForm mode="add" />
    </div>
  );
}
