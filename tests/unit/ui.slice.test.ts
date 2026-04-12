/**
 * UI Redux slice unit tests
 * @module tests/unit/ui.slice
 */

import { describe, it, expect, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import uiReducer, {
  UIState,
  openCart,
  closeCart,
  toggleCart,
  openMobileMenu,
  closeMobileMenu,
  toggleMobileMenu,
  addToast,
  removeToast,
  clearToasts,
  selectCartOpen,
  selectMobileMenuOpen,
  selectToasts,
} from "@/presentation/store/ui/ui.slice";

describe("UI Slice", () => {
  let store: ReturnType<typeof createTestStore>;

  const createTestStore = (preloadedState?: { ui: UIState }) => {
    return configureStore({
      reducer: { ui: uiReducer },
      preloadedState,
    });
  };

  beforeEach(() => {
    store = createTestStore();
  });

  describe("cart actions", () => {
    describe("openCart", () => {
      it("should set cartOpen to true", () => {
        store.dispatch(openCart());

        const state = store.getState().ui;
        expect(state.cartOpen).toBe(true);
      });

      it("should remain true when called multiple times", () => {
        store.dispatch(openCart());
        store.dispatch(openCart());

        const state = store.getState().ui;
        expect(state.cartOpen).toBe(true);
      });
    });

    describe("closeCart", () => {
      it("should set cartOpen to false", () => {
        store.dispatch(openCart());
        store.dispatch(closeCart());

        const state = store.getState().ui;
        expect(state.cartOpen).toBe(false);
      });

      it("should remain false when called multiple times", () => {
        store.dispatch(closeCart());
        store.dispatch(closeCart());

        const state = store.getState().ui;
        expect(state.cartOpen).toBe(false);
      });
    });

    describe("toggleCart", () => {
      it("should toggle from false to true", () => {
        expect(store.getState().ui.cartOpen).toBe(false);
        
        store.dispatch(toggleCart());
        
        expect(store.getState().ui.cartOpen).toBe(true);
      });

      it("should toggle from true to false", () => {
        store.dispatch(openCart());
        expect(store.getState().ui.cartOpen).toBe(true);
        
        store.dispatch(toggleCart());
        
        expect(store.getState().ui.cartOpen).toBe(false);
      });

      it("should toggle multiple times correctly", () => {
        store.dispatch(toggleCart()); // false -> true
        store.dispatch(toggleCart()); // true -> false
        store.dispatch(toggleCart()); // false -> true
        
        expect(store.getState().ui.cartOpen).toBe(true);
      });
    });
  });

  describe("mobile menu actions", () => {
    describe("openMobileMenu", () => {
      it("should set mobileMenuOpen to true", () => {
        store.dispatch(openMobileMenu());

        const state = store.getState().ui;
        expect(state.mobileMenuOpen).toBe(true);
      });
    });

    describe("closeMobileMenu", () => {
      it("should set mobileMenuOpen to false", () => {
        store.dispatch(openMobileMenu());
        store.dispatch(closeMobileMenu());

        const state = store.getState().ui;
        expect(state.mobileMenuOpen).toBe(false);
      });
    });

    describe("toggleMobileMenu", () => {
      it("should toggle mobile menu state", () => {
        expect(store.getState().ui.mobileMenuOpen).toBe(false);
        
        store.dispatch(toggleMobileMenu());
        expect(store.getState().ui.mobileMenuOpen).toBe(true);
        
        store.dispatch(toggleMobileMenu());
        expect(store.getState().ui.mobileMenuOpen).toBe(false);
      });
    });
  });

  describe("toast actions", () => {
    describe("addToast", () => {
      it("should add a toast to the array", () => {
        store.dispatch(addToast({ message: "Test message", type: "success" }));

        const state = store.getState().ui;
        expect(state.toasts).toHaveLength(1);
        expect(state.toasts[0].message).toBe("Test message");
        expect(state.toasts[0].type).toBe("success");
      });

      it("should generate unique id for each toast", () => {
        store.dispatch(addToast({ message: "First", type: "info" }));
        store.dispatch(addToast({ message: "Second", type: "error" }));

        const state = store.getState().ui;
        expect(state.toasts).toHaveLength(2);
        expect(state.toasts[0].id).not.toBe(state.toasts[1].id);
      });

      it("should default type to undefined when not specified", () => {
        store.dispatch(addToast({ message: "No type specified" }));

        const state = store.getState().ui;
        expect(state.toasts[0].type).toBeUndefined();
      });

      it("should handle multiple toasts", () => {
        store.dispatch(addToast({ message: "First", type: "success" }));
        store.dispatch(addToast({ message: "Second", type: "error" }));
        store.dispatch(addToast({ message: "Third", type: "info" }));

        const state = store.getState().ui;
        expect(state.toasts).toHaveLength(3);
      });
    });

    describe("removeToast", () => {
      it("should remove toast by id", () => {
        store.dispatch(addToast({ message: "First", type: "success" }));
        store.dispatch(addToast({ message: "Second", type: "error" }));

        const firstToastId = store.getState().ui.toasts[0].id;
        store.dispatch(removeToast(firstToastId));

        const state = store.getState().ui;
        expect(state.toasts).toHaveLength(1);
        expect(state.toasts[0].message).toBe("Second");
      });

      it("should not fail when removing non-existent id", () => {
        store.dispatch(addToast({ message: "Test", type: "success" }));
        store.dispatch(removeToast("non-existent-id"));

        const state = store.getState().ui;
        expect(state.toasts).toHaveLength(1);
      });

      it("should remove correct toast when multiple exist", () => {
        store.dispatch(addToast({ message: "Keep 1", type: "success" }));
        store.dispatch(addToast({ message: "Remove", type: "error" }));
        store.dispatch(addToast({ message: "Keep 2", type: "info" }));

        const middleToastId = store.getState().ui.toasts[1].id;
        store.dispatch(removeToast(middleToastId));

        const state = store.getState().ui;
        expect(state.toasts).toHaveLength(2);
        expect(state.toasts[0].message).toBe("Keep 1");
        expect(state.toasts[1].message).toBe("Keep 2");
      });
    });

    describe("clearToasts", () => {
      it("should remove all toasts", () => {
        store.dispatch(addToast({ message: "First", type: "success" }));
        store.dispatch(addToast({ message: "Second", type: "error" }));
        store.dispatch(addToast({ message: "Third", type: "info" }));
        store.dispatch(clearToasts());

        const state = store.getState().ui;
        expect(state.toasts).toHaveLength(0);
      });

      it("should work when no toasts exist", () => {
        store.dispatch(clearToasts());

        const state = store.getState().ui;
        expect(state.toasts).toHaveLength(0);
      });
    });
  });

  describe("selectors", () => {
    beforeEach(() => {
      store = createTestStore({
        ui: {
          cartOpen: true,
          mobileMenuOpen: true,
          toasts: [
            { id: "toast-1", message: "Test", type: "success" },
          ],
        },
      });
    });

    describe("selectCartOpen", () => {
      it("should return cart open state", () => {
        expect(selectCartOpen(store.getState())).toBe(true);
      });

      it("should return false when cart is closed", () => {
        store.dispatch(closeCart());
        expect(selectCartOpen(store.getState())).toBe(false);
      });
    });

    describe("selectMobileMenuOpen", () => {
      it("should return mobile menu open state", () => {
        expect(selectMobileMenuOpen(store.getState())).toBe(true);
      });

      it("should return false when menu is closed", () => {
        store.dispatch(closeMobileMenu());
        expect(selectMobileMenuOpen(store.getState())).toBe(false);
      });
    });

    describe("selectToasts", () => {
      it("should return all toasts", () => {
        const toasts = selectToasts(store.getState());
        expect(toasts).toHaveLength(1);
        expect(toasts[0].message).toBe("Test");
      });
    });
  });
});
