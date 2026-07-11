import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Vite 8's own dev/build pipeline uses oxc, which ignores this and
  // handles JSX correctly on its own - this `esbuild` block has ZERO
  // effect on `vite dev`/`vite build`. It's here only for vitest: its
  // internal vite-node transform pipeline still goes through esbuild
  // (bundled at an older version, see package-lock), whose default
  // *classic* JSX transform needs `React` in scope and throws
  // "ReferenceError: React is not defined" without this. Do not remove
  // this thinking oxc/babel already covers it - that's true for the app,
  // not for the test runner.
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
  },
});
