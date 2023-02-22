/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.vitest": "undefined",
  },
  test: {
    globals: true,
    includeSource: ["src/**/*.{ts,tsx,js,jsx}"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
