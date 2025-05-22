import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  build: {
    emptyOutDir: true,
    sourcemap: true,
  },
  plugins: [react({ include: /\.(js|jsx|ts|tsx)$/ })],
  base: "./",
});
