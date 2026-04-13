/**
 * Delivery adapter unit tests
 * @module tests/unit/delivery.adapter
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/infrastructure/db/client", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/infrastructure/db/client")>();

  const chainable = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  };

  return {
    ...mod,
    db: {
      select: vi.fn().mockReturnValue(chainable),
    } as any,
  };
});

import { DeliveryRepository } from "@/infrastructure/db/delivery.adapter";
import { db } from "@/infrastructure/db/client";

describe("DeliveryRepository", () => {
  let repo: DeliveryRepository;
  let selectChain: ReturnType<typeof db.select>;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new DeliveryRepository();
    selectChain = db.select();
  });

  describe("getZone", () => {
    it("should return a zone when found in DB", async () => {
      const mockRow = {
        id: "zone-1",
        wilayaCode: "16",
        wilayaNameAscii: "Alger",
        wilayaName: "Alger",
        communeNameAscii: "Alger Centre",
        communeName: "Alger Centre",
        stopDeskFee: 400,
        homeFee: 700,
        hasStopDesk: true,
        hasHomeDelivery: true,
      };
      vi.mocked(selectChain.limit).mockResolvedValue([mockRow]);

      const zone = await repo.getZone("zone-1");

      expect(zone).toEqual(mockRow);
      expect(selectChain.from).toHaveBeenCalled();
      expect(selectChain.where).toHaveBeenCalled();
      expect(selectChain.limit).toHaveBeenCalledWith(1);
    });

    it("should return null when zone not found", async () => {
      vi.mocked(selectChain.limit).mockResolvedValue([]);

      const zone = await repo.getZone("zone-missing");

      expect(zone).toBeNull();
    });
  });

  describe("getWilayas", () => {
    it("should deduplicate and return distinct wilayas", async () => {
      const mockRows = [
        {
          id: "zone-1",
          wilayaCode: "16",
          wilayaNameAscii: "Alger",
          wilayaName: "Alger",
          communeNameAscii: "Alger Centre",
          communeName: "Alger Centre",
          stopDeskFee: 400,
          homeFee: 700,
          hasStopDesk: true,
          hasHomeDelivery: true,
        },
        {
          id: "zone-2",
          wilayaCode: "16",
          wilayaNameAscii: "Alger",
          wilayaName: "Alger",
          communeNameAscii: "Bab El Oued",
          communeName: "Bab El Oued",
          stopDeskFee: 400,
          homeFee: 700,
          hasStopDesk: true,
          hasHomeDelivery: true,
        },
        {
          id: "zone-3",
          wilayaCode: "31",
          wilayaNameAscii: "Oran",
          wilayaName: "Oran",
          communeNameAscii: "Oran",
          communeName: "Oran",
          stopDeskFee: 350,
          homeFee: 600,
          hasStopDesk: true,
          hasHomeDelivery: true,
        },
      ];
      vi.mocked(selectChain.orderBy).mockResolvedValue(mockRows);

      const wilayas = await repo.getWilayas();

      expect(wilayas).toHaveLength(2);
      expect(wilayas[0].wilayaCode).toBe("16");
      expect(wilayas[1].wilayaCode).toBe("31");
    });
  });

  describe("getCommunesByWilaya", () => {
    it("should return communes filtered by wilaya code", async () => {
      const mockRows = [
        {
          id: "zone-1",
          wilayaCode: "16",
          wilayaNameAscii: "Alger",
          wilayaName: "Alger",
          communeNameAscii: "Alger Centre",
          communeName: "Alger Centre",
          stopDeskFee: 400,
          homeFee: 700,
          hasStopDesk: true,
          hasHomeDelivery: true,
        },
      ];
      vi.mocked(selectChain.orderBy).mockResolvedValue(mockRows);

      const communes = await repo.getCommunesByWilaya("16");

      expect(communes).toHaveLength(1);
      expect(communes[0].wilayaCode).toBe("16");
      expect(communes[0].communeName).toBe("Alger Centre");
      expect(selectChain.where).toHaveBeenCalled();
    });
  });
});
