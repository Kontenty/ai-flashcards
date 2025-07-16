import { defineConfig } from "vitest/config";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [viteTsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "tests/setup.ts",
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
