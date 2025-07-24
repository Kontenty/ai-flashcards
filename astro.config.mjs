/* eslint-env node */
/* eslint-disable no-undef */
// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import cloudflare from "@astrojs/cloudflare";

// Determine if running in CI environment
const isCI = Boolean(process.env.CI);

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 4321 },
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: isCI ? node({ mode: "standalone" }) : cloudflare(),
});
