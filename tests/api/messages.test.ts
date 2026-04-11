/**
 * Messages API Route Tests
 * @module tests/api/messages
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/messages/route";
import { NextRequest } from "next/server";

// Mock the i18n config
vi.mock("@/i18n.config", () => ({
  i18nConfig: {
    defaultLocale: "en",
    locales: ["en", "fr", "ar"],
  },
}));

// Mock the messages files
vi.mock("@/messages/en.json", () => ({
  default: {
    home: { title: "Home" },
    common: { welcome: "Welcome" },
  },
}));

vi.mock("@/messages/fr.json", () => ({
  default: {
    home: { title: "Accueil" },
    common: { welcome: "Bienvenue" },
  },
}));

vi.mock("@/messages/ar.json", () => ({
  default: {
    home: { title: "الرئيسية" },
    common: { welcome: "مرحباً" },
  },
}));

describe("GET /api/messages", () => {
  const createRequest = (locale?: string): NextRequest => {
    const url = locale 
      ? `http://localhost:3000/api/messages?locale=${locale}`
      : "http://localhost:3000/api/messages";
    return new NextRequest(url);
  };

  describe("Valid locales", () => {
    it("should return 200 with English messages for 'en' locale", async () => {
      const request = createRequest("en");
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        home: { title: "Home" },
        common: { welcome: "Welcome" },
      });
    });

    it("should return 200 with French messages for 'fr' locale", async () => {
      const request = createRequest("fr");
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        home: { title: "Accueil" },
        common: { welcome: "Bienvenue" },
      });
    });

    it("should return 200 with Arabic messages for 'ar' locale", async () => {
      const request = createRequest("ar");
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        home: { title: "الرئيسية" },
        common: { welcome: "مرحباً" },
      });
    });

    it("should return default locale (en) when no locale specified", async () => {
      const request = createRequest();
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.home.title).toBe("Home");
    });
  });

  describe("Invalid locales", () => {
    it("should return 400 for invalid locale", async () => {
      const request = createRequest("invalid");
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ error: "Invalid locale" });
    });

    it("should return 400 for empty locale", async () => {
      const request = createRequest("");
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ error: "Invalid locale" });
    });

    it("should return 400 for unsupported locale", async () => {
      const request = createRequest("de");
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ error: "Invalid locale" });
    });
  });

  describe("Response format", () => {
    it("should return JSON content type", async () => {
      const request = createRequest("en");
      const response = await GET(request);
      
      expect(response.headers.get("content-type")).toContain("application/json");
    });
  });
});
