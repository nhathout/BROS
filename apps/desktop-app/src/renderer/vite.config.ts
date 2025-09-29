import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname),
  base: "./",
  plugins: [react({})],  // <-- fix: pass empty object
  build: {
    outDir: "../../dist/renderer",
    emptyOutDir: true,
  },
});
