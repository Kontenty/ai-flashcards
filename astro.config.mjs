// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import cloudflareAstro from "@astrojs/cloudflare";

// Determine if running in Playwright tests (not deployment)
// eslint-disable-next-line no-undef
const useNode = Boolean(process.env.PLAYWRIGHT_TEST);
const cloudflareAdapter = cloudflareAstro({
  platformProxy: {
    enabled: true,
  },

  imageService: "cloudflare",
});

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 4321 },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: useNode
        ? undefined
        : {
            "react-dom/server": "react-dom/server.edge",
          },
    },
  },
  adapter: useNode ? node({ mode: "standalone" }) : cloudflareAdapter,
});
