import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import process from "node:process";

export default defineConfig(({ mode }) => {
  // Load only server-side UNISON settings; Vite does not expose these to browser code.
  for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), "UNISON_"))) {
    if (process.env[key] == null) process.env[key] = value;
  }
  return {
    plugins: [
      tsConfigPaths(),
      tailwindcss(),
      tanstackStart({ server: { entry: "server" } }),
      viteReact(),
      nitro(),
    ],
  };
});
