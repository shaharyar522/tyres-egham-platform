import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5175,
    strictPort: true,
    open: false,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8077",
        changeOrigin: true,
      },
      "/sitemap.xml": {
        target: "http://127.0.0.1:8077",
        changeOrigin: true,
      },
      "/robots.txt": {
        target: "http://127.0.0.1:8077",
        changeOrigin: true,
      },
    },
  },
});
