/**
 * Mock data for development without database
 * @module infrastructure/db/mock-data
 */

import type { Product, CookiePiece, CookieBox } from "@/domain/entities/product";
import type { Order } from "@/domain/entities/order";
import type { VoteCandidate } from "@/domain/entities/vote";
import type { WeeklyDrop } from "@/domain/entities/drop";

/**
 * Mock cookies with local image paths
 */
export const mockCookies: CookiePiece[] = [
  {
    id: "cookie-1",
    name: "Classic Chocolate Chip",
    slug: "classic-chocolate-chip",
    images: ["/images/chocoShips.png"],
    description:
      "Our signature cookie loaded with Belgian chocolate chunks and a sprinkle of sea salt. Crispy edges, chewy center.",
    price: 150,
    isActive: true,
    type: "cookie",
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
    flavour: "Chocolate Chip",
    allergens: ["gluten", "dairy", "eggs"],
    isNew: false,
    isSoldOut: false,
  },
  {
    id: "cookie-2",
    name: "Double Chocolate Fudge",
    slug: "double-chocolate",
    images: ["/images/mm.png"],
    description:
      "Rich cocoa dough packed with dark chocolate chips and fudge chunks. For the true chocolate lover.",
    price: 170,
    isActive: true,
    type: "cookie",
    createdAt: new Date("2026-01-20"),
    updatedAt: new Date("2026-01-20"),
    flavour: "Double Chocolate",
    allergens: ["gluten", "dairy", "eggs"],
    isNew: true,
    isSoldOut: false,
  },
  {
    id: "cookie-3",
    name: "White Chocolate Macadamia",
    slug: "white-chocolate-macadamia",
    images: ["/images/pistash.png"],
    description:
      "Creamy white chocolate chunks paired with roasted macadamia nuts. A classic combination.",
    price: 180,
    isActive: true,
    type: "cookie",
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-01"),
    flavour: "White Chocolate Macadamia",
    allergens: ["gluten", "dairy", "eggs", "nuts"],
    isNew: false,
    isSoldOut: false,
  },
  {
    id: "cookie-4",
    name: "Red Velvet Cheesecake",
    slug: "red-velvet",
    images: ["/images/viola.png"],
    description:
      "Classic red velvet cookie with cream cheese chips. A slice of cake in cookie form.",
    price: 170,
    isActive: true,
    type: "cookie",
    createdAt: new Date("2026-02-10"),
    updatedAt: new Date("2026-02-10"),
    flavour: "Red Velvet",
    allergens: ["gluten", "dairy", "eggs"],
    isNew: true,
    isSoldOut: false,
  },
  {
    id: "cookie-5",
    name: "Peanut Butter Chocolate",
    slug: "peanut-butter",
    images: ["/images/peanut.png"],
    description: "Creamy peanut butter cookie with chocolate drizzle and Reese's pieces.",
    price: 160,
    isActive: true,
    type: "cookie",
    createdAt: new Date("2026-02-15"),
    updatedAt: new Date("2026-02-15"),
    flavour: "Peanut Butter",
    allergens: ["gluten", "dairy", "eggs", "peanuts"],
    isNew: false,
    isSoldOut: true,
  },
  {
    id: "cookie-6",
    name: "Oatmeal Raisin Spice",
    slug: "oatmeal-raisin",
    images: ["/images/ben10.png"],
    description: "Chewy oatmeal cookie with plump raisins, cinnamon, and a hint of nutmeg.",
    price: 150,
    isActive: true,
    type: "cookie",
    createdAt: new Date("2026-02-20"),
    updatedAt: new Date("2026-02-20"),
    flavour: "Oatmeal Raisin",
    allergens: ["gluten", "dairy", "eggs"],
    isNew: false,
    isSoldOut: false,
  },
  {
    id: "cookie-7",
    name: "Salted Caramel",
    slug: "salted-caramel",
    images: ["/images/lotus.png"],
    description:
      "Buttery cookie with caramel chunks and flaky sea salt. Sweet and salty perfection.",
    price: 170,
    isActive: true,
    type: "cookie",
    createdAt: new Date("2026-03-01"),
    updatedAt: new Date("2026-03-01"),
    flavour: "Salted Caramel",
    allergens: ["gluten", "dairy", "eggs"],
    isNew: false,
    isSoldOut: false,
  },
  {
    id: "cookie-8",
    name: "Funfetti Birthday Cake",
    slug: "funfetti",
    images: ["/images/strawbery.png"],
    description: "Colorful funfetti cookie with vanilla frosting swirl. Celebrate every day!",
    price: 160,
    isActive: true,
    type: "cookie",
    createdAt: new Date("2026-03-05"),
    updatedAt: new Date("2026-03-05"),
    flavour: "Birthday Cake",
    allergens: ["gluten", "dairy", "eggs"],
    isNew: true,
    isSoldOut: false,
  },
];

/**
 * Mock boxes with local image paths
 */
export const mockBoxes: CookieBox[] = [
  {
    id: "box-1",
    name: "The Classics Box",
    slug: "the-classics-box",
    description:
      "A perfect selection of our all-time favorite cookies. 6 cookies including Chocolate Chip, Double Chocolate, and White Chocolate Macadamia.",
    price: 850,
    isActive: true,
    type: "box",
    images: ["/images/box1.png"],
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    includedCookies: [
      { cookiePieceId: "cookie-1", quantity: 2 },
      { cookiePieceId: "cookie-2", quantity: 2 },
      { cookiePieceId: "cookie-3", quantity: 2 },
    ],
  },
  {
    id: "box-2",
    name: "Chocoholic Box",
    slug: "chocoholic-box",
    description:
      "For the serious chocolate lover. 6 cookies featuring our richest chocolate flavors.",
    price: 900,
    isActive: true,
    type: "box",
    images: ["/images/box1.png"],
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-01-10"),
    includedCookies: [
      { cookiePieceId: "cookie-2", quantity: 3 },
      { cookiePieceId: "cookie-1", quantity: 2 },
      { cookiePieceId: "cookie-5", quantity: 1 },
    ],
  },
  {
    id: "box-3",
    name: "Variety Pack",
    slug: "variety-pack",
    description: "Can't decide? Get a taste of everything! 9 cookies with 3 of each flavor.",
    price: 1200,
    isActive: true,
    type: "box",
    images: ["/images/box1.png"],
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-01"),
    includedCookies: [
      { cookiePieceId: "cookie-1", quantity: 3 },
      { cookiePieceId: "cookie-3", quantity: 3 },
      { cookiePieceId: "cookie-6", quantity: 3 },
    ],
  },
];

/**
 * All mock products
 */
export const mockProducts: Product[] = [...mockCookies, ...mockBoxes];

/**
 * Mock orders
 */
export const mockOrders: Order[] = [
  {
    id: "order-1",
    fullName: "Ahmed Benali",
    phone: "+213 555 123 456",
    address: "123 Rue Mohamed VI, Oran",
    items: [
      {
        id: "item-1",
        orderId: "order-1",
        productId: "cookie-1",
        productType: "cookie",
        productName: "Classic Chocolate Chip",
        quantity: 3,
        priceSnapshot: 150,
      },
      {
        id: "item-2",
        orderId: "order-1",
        productId: "cookie-2",
        productType: "cookie",
        productName: "Double Chocolate Fudge",
        quantity: 2,
        priceSnapshot: 170,
      },
    ],
    status: "confirmed",
    totalAmount: 790,
    createdAt: new Date("2026-04-08T10:30:00"),
    updatedAt: new Date("2026-04-08T10:30:00"),
  },
  {
    id: "order-2",
    fullName: "Sarah Mansouri",
    phone: "+213 555 789 012",
    address: "45 Boulevard de la Soummam, Oran",
    items: [
      {
        id: "item-3",
        orderId: "order-2",
        productId: "box-1",
        productType: "box",
        productName: "The Classics Box",
        quantity: 1,
        priceSnapshot: 850,
      },
    ],
    status: "pending",
    totalAmount: 850,
    createdAt: new Date("2026-04-08T14:15:00"),
    updatedAt: new Date("2026-04-08T14:15:00"),
  },
  {
    id: "order-3",
    fullName: "Karim Hadj",
    phone: "+213 555 456 789",
    address: "78 Rue Ibn Sina, Oran",
    cookingNote: "Please make them extra crispy",
    items: [
      {
        id: "item-4",
        orderId: "order-3",
        productId: "cookie-3",
        productType: "cookie",
        productName: "White Chocolate Macadamia",
        quantity: 4,
        priceSnapshot: 180,
      },
      {
        id: "item-5",
        orderId: "order-3",
        productId: "cookie-7",
        productType: "cookie",
        productName: "Salted Caramel",
        quantity: 2,
        priceSnapshot: 170,
      },
    ],
    status: "preparing",
    totalAmount: 1060,
    createdAt: new Date("2026-04-07T16:45:00"),
    updatedAt: new Date("2026-04-07T16:45:00"),
  },
];

/**
 * Mock vote candidates
 */
export const mockVoteCandidates: VoteCandidate[] = [
  {
    id: "vote-1",
    cookieName: "Lemon Lavender",
    description: "Bright lemon zest with calming lavender notes. A springtime favorite.",
    imageUrl: "/images/vote-lemon-lavender.png",
    voteCount: 42,
    isActive: true,
    createdAt: new Date("2026-03-01"),
  },
  {
    id: "vote-2",
    cookieName: "Salted Caramel Pretzel",
    description: "Sweet caramel with crunchy pretzel pieces and sea salt.",
    imageUrl: "/images/vote-salted-caramel-pretzel.png",
    voteCount: 38,
    isActive: true,
    createdAt: new Date("2026-03-01"),
  },
  {
    id: "vote-3",
    cookieName: "Matcha White Chocolate",
    description: "Earthy Japanese matcha paired with sweet white chocolate chunks.",
    imageUrl: "/images/vote-matcha-white-chocolate.png",
    voteCount: 27,
    isActive: true,
    createdAt: new Date("2026-03-01"),
  },
  {
    id: "vote-4",
    cookieName: "S'mores",
    description: "Graham cracker cookie with marshmallow and chocolate. Campfire vibes!",
    imageUrl: "/images/vote-smores.png",
    voteCount: 35,
    isActive: true,
    createdAt: new Date("2026-03-01"),
  },
  {
    id: "vote-5",
    cookieName: "Pumpkin Spice",
    description: "Fall favorite with real pumpkin, cinnamon, nutmeg, and cream cheese frosting.",
    imageUrl: "/images/vote-pumpkin-spice.png",
    voteCount: 29,
    isActive: true,
    createdAt: new Date("2026-03-01"),
  },
  {
    id: "vote-6",
    cookieName: "Tiramisu",
    description: "Coffee-flavored cookie with mascarpone chips and cocoa dusting.",
    imageUrl: "/images/vote-tiramisu.png",
    voteCount: 31,
    isActive: true,
    createdAt: new Date("2026-03-01"),
  },
];

/**
 * Mock weekly drop
 */
export const mockWeeklyDrop: WeeklyDrop = {
  id: "drop-1",
  productId: "cookie-8",
  product: mockCookies[7],
  scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  isActive: true,
  createdAt: new Date(),
};
