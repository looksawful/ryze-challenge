import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "storybook-static/**",
    "build/**",
    "public/ryze-canvas/vendor/**", // Third-party WebGL/GSAP distributions.
    "public/ryze-canvas/assets/**", // Media, not authored JavaScript.
    "public/ryze-media/**",
    "docs/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
