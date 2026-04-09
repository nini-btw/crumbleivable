/**
 * Cloudflare R2 storage service (MOCK for development)
 * @module infrastructure/storage/r2
 * 
 * NOTE: AWS SDK is not installed for development. This is a mock implementation.
 * For production, install @aws-sdk/client-s3 and implement the real service.
 */

import { v4 as uuidv4 } from "uuid";
import type { IStorageService } from "@/domain/ports/repositories";

/**
 * Mock R2 storage service for development
 */
export class R2StorageService implements IStorageService {
  async upload(file: File, path: string = "products"): Promise<string> {
    // Return a mock URL for development
    const extension = file.name.split(".").pop();
    return `https://mock-r2.example.com/${path}/${uuidv4()}.${extension}`;
  }

  async delete(url: string): Promise<void> {
    // No-op in mock mode
    console.log(`Mock delete: ${url}`);
  }

  getPublicUrl(key: string): string {
    return `https://mock-r2.example.com/${key}`;
  }
}

/**
 * Simple in-memory storage for development
 */
export class DevStorageService implements IStorageService {
  private uploads = new Map<string, string>();

  async upload(file: File, path: string = "products"): Promise<string> {
    // In development, return a data URL
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const id = `${path}/${uuidv4()}`;
        this.uploads.set(id, dataUrl);
        resolve(dataUrl);
      };
      reader.readAsDataURL(file);
    });
  }

  async delete(url: string): Promise<void> {
    // No-op in development
  }

  getPublicUrl(key: string): string {
    return this.uploads.get(key) || key;
  }
}

/**
 * Get storage service based on environment
 */
export function getStorageService(): IStorageService {
  // Always use DevStorageService for now since AWS SDK is not installed
  return new DevStorageService();
}

export const storageService = getStorageService();
