import { defineConfig } from "vitest/config";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [viteTsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "lcov"],
      thresholds: {
        global: {
          statements: 80,
          branches: 70,
          functions: 70,
          lines: 80,
        },
      },
    },
  },
});
