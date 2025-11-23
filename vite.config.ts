import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [react()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "import.meta.env.VITE_APPWRITE_ENDPOINT": JSON.stringify(
        env.VITE_APPWRITE_ENDPOINT
      ),
      "import.meta.env.VITE_APPWRITE_PROJECT_ID": JSON.stringify(
        env.VITE_APPWRITE_PROJECT_ID
      ),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
