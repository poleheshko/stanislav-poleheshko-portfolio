import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Split the big third-party libraries into their own long-lived chunks so
    // they cache independently of our app code, and so the admin-only bundle
    // (lazy-loaded — see AppRouter) never lands in the homepage's initial load.
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-animation": ["gsap", "lenis"],
        },
      },
    },
  },
});
