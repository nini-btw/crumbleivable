/**
 * Cart Redux slice unit tests
 * @module tests/unit/cart.slice
 */

import { describe, it, expect, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import cartReducer, {
  CartState,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  setCookingNote,
  setGiftNote,
  hydrateCart,
  selectCartItems,
  selectCartSummary,
  selectCanCheckout,
  selectCartTotal,
  selectCookiesNeeded,
  selectCartProgress,
  selectTotalItemCount,
  selectTotalCookieCount,
  selectCookingNote,
  selectGiftNote,
} from "@/presentation/store/cart/cart.slice";
import { createCookiePiece, createCookieBox, createCartItem } from "@/tests/helpers/factories";

describe("Cart Slice", () => {
  let store: ReturnType<typeof createTestStore>;

  const createTestStore = (preloadedState?: { cart: CartState }) => {
    return configureStore({
      reducer: { cart: cartReducer },
      preloadedState,
    });
  };

  beforeEach(() => {
    store = createTestStore();
  });

  describe("actions", () => {
    describe("addItem", () => {
      it("should add a new item to empty cart", () => {
        const cookie = createCookiePiece();
        store.dispatch(addItem({ product: cookie, quantity: 1 }));

        const state = store.getState().cart;
        expect(state.items).toHaveLength(1);
        expect(state.items[0].product.id).toBe(cookie.id);
        expect(state.items[0].quantity).toBe(1);
      });

      it("should increment quantity when adding same product", () => {
        const cookie = createCookiePiece();
        store.dispatch(addItem({ product: cookie, quantity: 1 }));
        store.dispatch(addItem({ product: cookie, quantity: 2 }));

        const state = store.getState().cart;
        expect(state.items).toHaveLength(1);
        expect(state.items[0].quantity).toBe(3);
      });

      it("should use default quantity of 1 when not specified", () => {
        const cookie = createCookiePiece();
        store.dispatch(addItem({ product: cookie }));

        const state = store.getState().cart;
        expect(state.items[0].quantity).toBe(1);
      });

      it("should add different products as separate items", () => {
        const cookie1 = createCookiePiece();
        const cookie2 = createCookiePiece();
        store.dispatch(addItem({ product: cookie1, quantity: 1 }));
        store.dispatch(addItem({ product: cookie2, quantity: 1 }));

        const state = store.getState().cart;
        expect(state.items).toHaveLength(2);
      });
    });

    describe("removeItem", () => {
      it("should remove item by product id", () => {
        const cookie = createCookiePiece();
        store.dispatch(addItem({ product: cookie, quantity: 2 }));
        store.dispatch(removeItem(cookie.id));

        const state = store.getState().cart;
        expect(state.items).toHaveLength(0);
      });

      it("should not fail when removing non-existent item", () => {
        store.dispatch(removeItem("non-existent-id"));

        const state = store.getState().cart;
        expect(state.items).toHaveLength(0);
      });
    });

    describe("updateQuantity", () => {
      it("should update item quantity", () => {
        const cookie = createCookiePiece();
        store.dispatch(addItem({ product: cookie, quantity: 1 }));
        store.dispatch(updateQuantity({ productId: cookie.id, quantity: 5 }));

        const state = store.getState().cart;
        expect(state.items[0].quantity).toBe(5);
      });

      it("should remove item when quantity is set to 0", () => {
        const cookie = createCookiePiece();
        store.dispatch(addItem({ product: cookie, quantity: 3 }));
        store.dispatch(updateQuantity({ productId: cookie.id, quantity: 0 }));

        const state = store.getState().cart;
        expect(state.items).toHaveLength(0);
      });

      it("should not fail when updating non-existent item", () => {
        store.dispatch(updateQuantity({ productId: "non-existent", quantity: 5 }));

        const state = store.getState().cart;
        expect(state.items).toHaveLength(0);
      });
    });

    describe("clearCart", () => {
      it("should remove all items", () => {
        const cookie1 = createCookiePiece();
        const cookie2 = createCookiePiece();
        store.dispatch(addItem({ product: cookie1, quantity: 2 }));
        store.dispatch(addItem({ product: cookie2, quantity: 3 }));
        store.dispatch(clearCart());

        const state = store.getState().cart;
        expect(state.items).toHaveLength(0);
      });

      it("should reset notes when clearing", () => {
        store.dispatch(setCookingNote("Cook well"));
        store.dispatch(setGiftNote("Happy birthday"));
        store.dispatch(clearCart());

        const state = store.getState().cart;
        expect(state.cookingNote).toBeNull();
        expect(state.giftNote).toBeNull();
      });
    });

    describe("setCookingNote", () => {
      it("should set cooking note", () => {
        store.dispatch(setCookingNote("Extra crispy please"));

        const state = store.getState().cart;
        expect(state.cookingNote).toBe("Extra crispy please");
      });

      it("should allow null to clear note", () => {
        store.dispatch(setCookingNote("Note"));
        store.dispatch(setCookingNote(null));

        const state = store.getState().cart;
        expect(state.cookingNote).toBeNull();
      });
    });

    describe("setGiftNote", () => {
      it("should set gift note", () => {
        store.dispatch(setGiftNote("Happy Birthday!"));

        const state = store.getState().cart;
        expect(state.giftNote).toBe("Happy Birthday!");
      });

      it("should allow null to clear note", () => {
        store.dispatch(setGiftNote("Note"));
        store.dispatch(setGiftNote(null));

        const state = store.getState().cart;
        expect(state.giftNote).toBeNull();
      });
    });

    describe("hydrateCart", () => {
      it("should restore entire cart state", () => {
        const cookie = createCookiePiece();
        const hydratedState: CartState = {
          items: [{ product: cookie, quantity: 5 }],
          cookingNote: "Cook note",
          giftNote: "Gift note",
        };

        store.dispatch(hydrateCart(hydratedState));

        const state = store.getState().cart;
        expect(state.items).toHaveLength(1);
        expect(state.items[0].quantity).toBe(5);
        expect(state.cookingNote).toBe("Cook note");
        expect(state.giftNote).toBe("Gift note");
      });
    });
  });

  describe("selectors", () => {
    beforeEach(() => {
      const cookie1 = createCookiePiece({ price: 100 });
      const cookie2 = createCookiePiece({ price: 150 });
      const box = createCookieBox({ price: 400 });

      store = createTestStore({
        cart: {
          items: [
            { product: cookie1, quantity: 2 }, // 200, counts as 2 cookies
            { product: cookie2, quantity: 1 }, // 150, counts as 1 cookie
            { product: box, quantity: 1 },     // 400, counts as 3 cookies
          ],
          cookingNote: "Cook note",
          giftNote: "Gift note",
        },
      });
    });

    describe("selectCartItems", () => {
      it("should return all cart items", () => {
        const items = selectCartItems(store.getState());
        expect(items).toHaveLength(3);
      });
    });

    describe("selectCartSummary", () => {
      it("should return complete summary", () => {
        const summary = selectCartSummary(store.getState());

        expect(summary).toHaveProperty("itemCount");
        expect(summary).toHaveProperty("cookieCount");
        expect(summary).toHaveProperty("totalAmount");
        expect(summary).toHaveProperty("canCheckout");
        expect(summary).toHaveProperty("cookiesNeeded");
        expect(summary).toHaveProperty("progress");
      });

      it("should calculate correct totals", () => {
        const summary = selectCartSummary(store.getState());

        // itemCount = 2 + 1 + 1 = 4
        expect(summary.itemCount).toBe(4);

        // cookieCount = 2 + 1 + 3 (box) = 6
        expect(summary.cookieCount).toBe(6);

        // totalAmount = (100 * 2) + (150 * 1) + (400 * 1) = 200 + 150 + 400 = 750
        expect(summary.totalAmount).toBe(750);

        // canCheckout = cookieCount >= 3
        expect(summary.canCheckout).toBe(true);

        // cookiesNeeded = max(0, 3 - 6) = 0
        expect(summary.cookiesNeeded).toBe(0);

        // progress = min(100, (6 / 3) * 100) = 100
        expect(summary.progress).toBe(100);
      });
    });

    describe("selectCanCheckout", () => {
      it("should return true when min cookies met", () => {
        expect(selectCanCheckout(store.getState())).toBe(true);
      });

      it("should return false when below min cookies", () => {
        store = createTestStore({
          cart: {
            items: [createCartItem({ quantity: 1 })],
            cookingNote: null,
            giftNote: null,
          },
        });
        expect(selectCanCheckout(store.getState())).toBe(false);
      });
    });

    describe("selectCartTotal", () => {
      it("should return total amount in cents", () => {
        const total = selectCartTotal(store.getState());
        expect(total).toBe(750);
      });
    });

    describe("selectCookiesNeeded", () => {
      it("should return 0 when min met", () => {
        expect(selectCookiesNeeded(store.getState())).toBe(0);
      });

      it("should return correct amount when below min", () => {
        store = createTestStore({
          cart: {
            items: [createCartItem({ quantity: 2 })],
            cookingNote: null,
            giftNote: null,
          },
        });
        expect(selectCookiesNeeded(store.getState())).toBe(1);
      });
    });

    describe("selectCartProgress", () => {
      it("should return 100 when min exceeded", () => {
        expect(selectCartProgress(store.getState())).toBe(100);
      });

      it("should return correct percentage when below min", () => {
        store = createTestStore({
          cart: {
            items: [createCartItem({ quantity: 2 })],
            cookingNote: null,
            giftNote: null,
          },
        });
        // 2/3 * 100 = 66.67
        expect(selectCartProgress(store.getState())).toBeCloseTo(66.67, 1);
      });
    });

    describe("selectTotalItemCount", () => {
      it("should return sum of all quantities", () => {
        expect(selectTotalItemCount(store.getState())).toBe(4);
      });
    });

    describe("selectTotalCookieCount", () => {
      it("should return cookie count including box equivalents", () => {
        expect(selectTotalCookieCount(store.getState())).toBe(6);
      });
    });

    describe("selectCookingNote", () => {
      it("should return cooking note", () => {
        expect(selectCookingNote(store.getState())).toBe("Cook note");
      });
    });

    describe("selectGiftNote", () => {
      it("should return gift note", () => {
        expect(selectGiftNote(store.getState())).toBe("Gift note");
      });
    });
  });
});
