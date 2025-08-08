import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import cloudflareAstro from "@astrojs/cloudflare";

// Determine if running in Playwright tests (not deployment)
// eslint-disable-next-line no-undef
const environment = ["test", "development"].includes(process.env.NODE_ENV) ? "node" : "cloudflare";
const cloudflareAdapter = cloudflareAstro({
  platformProxy: {
    enabled: true,
  },

  imageService: "cloudflare",
});

const config = {
  node: {
    adapter: node({ mode: "standalone" }),
    alias: undefined,
  },
  cloudflare: {
    adapter: cloudflareAdapter,
    alias: {
      "react-dom/server": "react-dom/server.edge",
    },
  },
};

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 4321 },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: config[environment].alias,
    },
    ssr: {
      external: ["crypto", "node:crypto", "node:path", "node:fs/promises", "node:url"],
    },
  },
  adapter: config[environment].adapter,
});
