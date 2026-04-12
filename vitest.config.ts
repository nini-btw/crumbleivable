import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Vitest configuration
 */
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.ts",
    restoreMocks: true,
    clearMocks: true,
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**", // E2E tests require Playwright
      "**/*.spec.ts", // Playwright spec files
    ],
  },
});
