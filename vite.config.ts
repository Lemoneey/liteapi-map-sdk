/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
  },
  plugins: [tsconfigPaths()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "LiteAPIMapSDK",
      fileName: (format) => `liteapi-map-sdk.${format}.js`,
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: ["mapbox-gl"],
      output: {
        globals: {
          "mapbox-gl": "mapboxgl",
        },
      },
    },
  },
});
