/**
 * Redux store configuration
 * @module presentation/store
 */

import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cart/cart.slice";
import uiReducer from "./ui/ui.slice";

/**
 * Redux store
 */
export const store = configureStore({
  reducer: {
    cart: cartReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in these paths
        ignoredPaths: ["cart.items.product.createdAt", "cart.items.product.updatedAt"],
      },
    }),
});

/**
 * Store type exports
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
