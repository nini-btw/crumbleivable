/**
 * Product repository adapter (MOCK VERSION)
 * @module infrastructure/db/product-adapter
 */

import type {
  Product,
  CookiePiece,
  CookieBox,
} from "@/domain/entities/product";
import type { IProductRepository } from "@/domain/ports/repositories";
import { mockProducts, mockCookies, mockBoxes } from "./mock-data";

/**
 * Product repository implementation using MOCK DATA
 */
export class ProductRepository implements IProductRepository {
  private products = [...mockProducts];

  async getAllActive(): Promise<Product[]> {
    return this.products.filter((p) => p.isActive);
  }

  async getBySlug(slug: string): Promise<Product | null> {
    return this.products.find((p) => p.slug === slug) || null;
  }

  async getById(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id) || null;
  }

  async getAllCookies(): Promise<CookiePiece[]> {
    return this.products.filter((p): p is CookiePiece => p.type === "cookie");
  }

  async getAllBoxes(): Promise<CookieBox[]> {
    return this.products.filter((p): p is CookieBox => p.type === "box");
  }

  async create(
    product: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): Promise<Product> {
    const newProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Product;
    this.products.push(newProduct);
    return newProduct;
  }

  async update(id: string, product: Partial<Product>): Promise<Product> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Product not found");
    
    this.products[index] = {
      ...this.products[index],
      ...product,
      updatedAt: new Date(),
    };
    return this.products[index];
  }

  async toggleActive(id: string): Promise<void> {
    const product = await this.getById(id);
    if (product) {
      await this.update(id, { isActive: !product.isActive });
    }
  }

  async delete(id: string): Promise<void> {
    this.products = this.products.filter((p) => p.id !== id);
  }
}

/**
 * Singleton instance
 */
export const productRepository = new ProductRepository();
