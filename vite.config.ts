import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

let plugins: any[] = [
  react(),
];

// Only add Replit plugins if in Replit environment
try {
  if (process.env.REPL_ID) {
    const runtimeErrorOverlay = require("@replit/vite-plugin-runtime-error-modal").default;
    plugins.push(runtimeErrorOverlay());
  }
} catch (e) {
  console.warn("Replit plugins not available, skipping");
}

export default defineConfig({
  plugins,
  json: {
    stringify: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
