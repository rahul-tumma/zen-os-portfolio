import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**", // Exclude utility scripts (CommonJS)
    "node_modules/**",
  ]),
  // Custom rules
  {
    rules: {
      // Allow explicit any for flexibility (use sparingly)
      "@typescript-eslint/no-explicit-any": "warn",
      // Unused vars are warnings, not errors
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      // Allow img elements (external images)
      "@next/next/no-img-element": "off",
    },
  },
]);

export default eslintConfig;
