// We cannot use "let" and other new JS features in vite.config.ts because of the restriction in vite.config.ts and esbuild.
// See https://vitejs.dev/config/#build-target
// Since we use es5 for target in tsconfig , new JS features that es5 cannot handle are prohibited.
/* eslint-disable no-var */
import { defineConfig, PluginOption } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import checker from "vite-plugin-checker";
import path from "path";
import bundleVisualizer from "rollup-plugin-visualizer";
import { tsxSourceJump } from "tsx-source-jump/vite";

var rollupPlugins = [];
var plugins: (PluginOption | PluginOption[])[] = [];
var nodeEnv = process.env.NODE_ENV;

if (process.env.VISUALIZE) {
  rollupPlugins.push(bundleVisualizer({ open: true }));
}

if (nodeEnv && ["production", "staging"].includes(nodeEnv)) {
  // tsxSourceJump should be included only in local env.
} else {
  // tsxSourceJump() needs to be before react().
  plugins.push(
    tsxSourceJump({
      projectRoot: path.join(__dirname, "/"),
      // rewriting element target
      target: [
        /^[a-z]+$/, // Covers div, span, img, etc.
        /^Styled[a-zA-Z]+$/, // Covers styled-components. We have a weak convention that styled-components begin with Styled.
        /^(Box|Flex|Form|FormControl|Spinner|Badge|Tooltip|Col|Row|Line|Modal|Center|Container|Grid|SimpleGrid|Stack|Wrap|Button|Link|Icon|Image|Card|Tab|Tabs|Dropdown|FloatingLabel|Container|Alert|Table|Pagination|Stepper|Grid)$/, // Covers React Element from material-ui and react-bootstrap
      ],
    })
  );
}

plugins = plugins.concat([
  react(),
  tsconfigPaths(),
  legacy({ renderLegacyChunks: false, modernPolyfills: true }),
  checker({
    overlay: false,
    typescript: {
      root: path.resolve(__dirname),
    },
  }),
]);

export default defineConfig({
  plugins,
  build: {
    outDir: "build",
    rollupOptions: {
      plugins: rollupPlugins,
    },
  },
  server: {
    port: 4000,
    proxy: {
      "/api": {
        target: "http://localhost:4001",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "sardine-dashboard-typescript-definitions": path.resolve(__dirname, "../shared/index.ts"),
    },
  },
});
